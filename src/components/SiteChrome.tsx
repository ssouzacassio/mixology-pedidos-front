"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import BarraNavegacao from "@/components/BarraNavegacao";
import ChatFlutuante from "@/components/ChatFlutuante";

// O painel admin tem sua própria navegação (AdminNav) e não deve mostrar a
// barra/chat do site de clientes por cima.
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");

  if (admin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <BarraNavegacao />
      <main className="flex-1">{children}</main>
      <ChatFlutuante />
    </>
  );
}
