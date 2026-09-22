"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAutenticacao } from "@/contexts/AutenticacaoContexto";

// Cardápio e carrinho ficam abertos pra qualquer visitante navegar e montar o
// pedido; só essas telas exigem conta já criada.
const ROTAS_PROTEGIDAS = ["/pedidos", "/perfil"];

export default function ProtegerRotas({ children }: { children: React.ReactNode }) {
  const { token, carregando } = useAutenticacao();
  const pathname = usePathname();
  const router = useRouter();

  const rotaProtegida = ROTAS_PROTEGIDAS.includes(pathname);

  useEffect(() => {
    if (!carregando && !token && rotaProtegida) {
      router.replace(`/cadastro?retorno=${encodeURIComponent(pathname)}`);
    }
  }, [carregando, token, rotaProtegida, pathname, router]);

  if (rotaProtegida && (carregando || !token)) return null;

  return <>{children}</>;
}
