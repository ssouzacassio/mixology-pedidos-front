import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AutenticacaoProvider } from "@/contexts/AutenticacaoContexto";
import { CarrinhoProvider } from "@/contexts/CarrinhoContexto";
import ProtegerRotas from "@/components/ProtegerRotas";
import SiteChrome from "@/components/SiteChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mixology Drinkeria — Peça seu drink",
  description: "Cardápio online e pedidos da Mixology Drinkeria",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <AutenticacaoProvider>
          <CarrinhoProvider>
            <SiteChrome>
              <ProtegerRotas>{children}</ProtegerRotas>
            </SiteChrome>
          </CarrinhoProvider>
        </AutenticacaoProvider>
      </body>
    </html>
  );
}
