import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leftover Recipe AI - Generate Recipes from Your Kitchen",
  description: "Upload images of your leftover ingredients and get AI-generated recipe suggestions instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
