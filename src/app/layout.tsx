// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import GNB from '@/app/components/navbar/GNB';
import styles from './layout.module.css';
import { Providers } from './providers';
import Footer from '@/app/components/navbar/FNB';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '멜로',
  description: '일상속 멜로디를 멜로와 함께',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <Providers>
      <body className={`${inter.className} ${styles.body}`}>
        <GNB />
        <main className={styles.main}>{children}</main>
        <Footer 
          logoUrl="/images/logo-horizontal.png"
          discordUrl="https://discord.gg/studioharu"
          emailAddress="contact@studioharu.com"
        />
      </body>
      </Providers>
    </html>
  );
}