import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { AuthProvider } from '@/lib/context/AuthContext';
import { CartProvider } from '@/lib/context/CartContext';
import { WishlistProvider } from '@/lib/context/WishlistContext';
import StoreLayoutWrapper from '@/components/layout/StoreLayoutWrapper';

export const metadata: Metadata = {
  title: 'Vasantham Group | Where elegance is woven with tradition | Mannarkkad, Palakkad',
  description:
    'Malabar’s premier textile and fashion network. Explore authentic Kanchipuram silk sarees, Kerala Kasavu drapes, festive kurtas, and family wear in Mannarkkad, Palakkad.',
  keywords: [
    'Vasantham Group',
    'Mannarkkad textile shop',
    'Palakkad silk sarees',
    'Kerala Kasavu sarees',
    'Malabar fashion',
    'South Indian wedding wear',
    'Set Mundu',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <StoreLayoutWrapper>{children}</StoreLayoutWrapper>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
