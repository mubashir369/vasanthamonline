/**
 * SMTP email sender (nodemailer).
 *
 * Configure with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM.
 * Works with Gmail (app password), Zoho, or the vasanthamonline.com mailbox.
 */
import nodemailer, { Transporter } from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'Vasantham Online <no-reply@vasanthamonline.com>';

export const isMailerConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // 465 = implicit TLS; 587 = STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ success: boolean; message: string }> {
  if (!isMailerConfigured) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[mailer] SMTP is not configured – cannot send email.');
      return { success: false, message: 'Email service is not configured. Please contact support.' };
    }
    console.warn(`[mailer DEV] SMTP not configured. Email to ${options.to}: ${options.subject}\n${options.text}`);
    return { success: true, message: 'Email logged to console (dev mode)' };
  }

  try {
    await getTransporter().sendMail({ from: SMTP_FROM, ...options });
    return { success: true, message: 'Email sent' };
  } catch (error: any) {
    console.error('[mailer] Failed to send email:', error);
    return { success: false, message: 'Could not send the email. Please try again shortly.' };
  }
}

const PURPOSE_TEXT: Record<string, string> = {
  LOGIN: 'sign in to your account',
  REGISTER: 'verify your email and create your account',
  PASSWORD_RESET: 'reset your password',
  CHECKOUT_VERIFY: 'confirm your order',
};

export async function sendEmailOTP(
  email: string,
  code: string,
  purpose: string,
  expiresInMinutes: number
) {
  const action = PURPOSE_TEXT[purpose] || 'continue';
  const subject = `${code} is your Vasantham Online verification code`;
  const text =
    `Your Vasantham Online verification code is ${code}.\n\n` +
    `Use it to ${action}. It expires in ${expiresInMinutes} minutes.\n\n` +
    `If you didn't request this, you can ignore this email.\n\n` +
    `Vasantham Online – https://vasanthamonline.com`;
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f1f1f">
    <h2 style="margin:0 0 4px;color:#7E121D">Vasantham Online</h2>
    <p style="margin:0 0 24px;color:#777;font-size:13px">Where elegance is woven with tradition</p>
    <p style="font-size:15px">Use this code to ${action}:</p>
    <p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:16px 0;color:#7E121D">${code}</p>
    <p style="font-size:13px;color:#555">This code expires in ${expiresInMinutes} minutes. Never share it with anyone, including Vasantham staff.</p>
    <p style="font-size:12px;color:#999;margin-top:32px">If you didn't request this, you can safely ignore this email.<br/>
    <a href="https://vasanthamonline.com" style="color:#7E121D">vasanthamonline.com</a></p>
  </div>`;
  return sendMail({ to: email, subject, text, html });
}
