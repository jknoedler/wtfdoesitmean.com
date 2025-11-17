import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const westendRidge = localFont({
  src: "../public/fonts/WestendRidgeTexturedRough-E4Ban.ttf",
  variable: "--font-westend-ridge",
  display: "swap",
});

const hardcore = localFont({
  src: "../public/fonts/hardcore-font.otf",
  variable: "--font-hardcore",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WTF Does It Mean? | Answers to Your Questions",
  description: "Find answers to real questions people search for. SEO-optimized articles covering everything you need to know.",
  keywords: "questions, answers, explanations, definitions, what does it mean",
  openGraph: {
    title: "WTF Does It Mean?",
    description: "Answers to your questions",
    url: "https://wtfdoesitmean.com",
    siteName: "WTF Does It Mean?",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${westendRidge.variable} ${hardcore.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
