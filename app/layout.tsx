import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#244734'};

export const metadata: Metadata = {
  title: '테일즈 시티 | 강아지와 떠나는 모험',
  applicationName: '테일즈 시티',
  other: {'apple-mobile-web-app-capable':'yes'},
  manifest: '/manifest.webmanifest',
  appleWebApp: {capable: true, title: '테일즈 시티', statusBarStyle: 'black-translucent'},
  icons: {icon: [{url:'/icons/game-32.png',sizes:'32x32',type:'image/png'},{url:'/icons/game-192.png',sizes:'192x192',type:'image/png'}],apple:[{url:'/apple-touch-icon.png',sizes:'180x180',type:'image/png'}]},
  description: '여섯 지역을 탐험하고 강아지 동료와 함께 도시를 구하는 RPG.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
