/**
 * MSG91 WhatsApp OTP Helper
 *
 * Sends OTP messages via MSG91's WhatsApp outbound API using
 * pre-approved authentication templates.
 */
import { randomInt } from 'crypto';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || '';
const MSG91_INTEGRATED_NUMBER = process.env.MSG91_WHATSAPP_INTEGRATED_NUMBER || '';
const MSG91_TEMPLATE_NAME = process.env.MSG91_WHATSAPP_TEMPLATE_NAME || '';
const MSG91_NAMESPACE = process.env.MSG91_NAMESPACE || '';

const MSG91_API_URL =
  'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/';

interface MSG91Response {
  success?: boolean;
  message?: string;
  data?: any;
}

/**
 * Sends a WhatsApp OTP message via MSG91.
 *
 * @param phone - Full phone number with country code (e.g. "919876543210")
 * @param otp   - The OTP code to send
 * @returns     - { success: boolean, message: string }
 */
export async function sendWhatsAppOTP(
  phone: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  // Validate configuration. Without MSG91, codes are only logged in development;
  // in production we fail instead of silently "sending" nothing.
  if (!MSG91_AUTH_KEY || !MSG91_INTEGRATED_NUMBER || !MSG91_TEMPLATE_NAME) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[MSG91] WhatsApp OTP is not configured (AUTH_KEY / INTEGRATED_NUMBER / TEMPLATE_NAME).');
      return { success: false, message: 'WhatsApp verification is not available right now. Please contact support.' };
    }
    console.warn(`[MSG91 DEV] WhatsApp not configured. OTP for ${phone}: ${otp}`);
    return { success: true, message: 'OTP logged to console (dev mode)' };
  }

  const payload = {
    integrated_number: MSG91_INTEGRATED_NUMBER,
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template: {
        name: MSG91_TEMPLATE_NAME,
        language: {
          code: 'en',
          policy: 'deterministic',
        },
        ...(MSG91_NAMESPACE ? { namespace: MSG91_NAMESPACE } : {}),
        to_and_components: [
          {
            to: [phone],
            components: {
              body: {
                type: 'text',
                values: [otp],
              },
            },
          },
        ],
      },
    },
  };

  try {
    const response = await fetch(MSG91_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authkey: MSG91_AUTH_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data: MSG91Response = await response.json();

    if (response.ok) {
      return { success: true, message: 'OTP sent successfully via WhatsApp' };
    } else {
      console.error('[MSG91] API Error:', data);
      return {
        success: false,
        message: data.message || 'Failed to send WhatsApp OTP',
      };
    }
  } catch (error: any) {
    console.error('[MSG91] Network Error:', error);
    return {
      success: false,
      message: error.message || 'Network error while sending WhatsApp OTP',
    };
  }
}

/**
 * Generates a cryptographically random 6-digit OTP string.
 */
export function generateOTP(): string {
  return randomInt(100000, 1000000).toString();
}

/**
 * Normalizes a phone number to digits only with country code.
 * - Strips spaces, dashes, parentheses
 * - Adds "91" prefix if not already present (India default)
 *
 * @param phone - Raw phone input (e.g. "+91 98950 11223", "9895011223")
 * @returns     - Normalized phone (e.g. "919895011223")
 */
export function normalizePhone(phone: string): string {
  // Strip all non-digit characters
  let digits = phone.replace(/\D/g, '');

  // If it starts with "0", remove leading zero
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  // If it's a 10-digit Indian number, prepend country code
  if (digits.length === 10) {
    digits = '91' + digits;
  }

  return digits;
}
