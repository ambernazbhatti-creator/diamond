import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import BottomNav from '@/compomemts/BottomNav';
// import WhatsAppWidget from '@/components/WhatsAppWidget';
import WhatsAppWidget from '@/compomemts/WhatsAppWidget';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EarnsPK',
  description: 'Earn diamonds, earn cash — Pakistan',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-950 text-white min-h-screen`}>
        <main className="pb-20 md:pb-0">{children}</main>
        <BottomNav />
        <WhatsAppWidget />
      </body>
    </html>
  );
}