"use client";

import Image from "next/image";
import Link from "next/link";
import { useAutenticacao } from "@/contexts/AutenticacaoContexto";
import { useCarrinho } from "@/contexts/CarrinhoContexto";

function IconeCardapio() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M4 19.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 7h8M8 10.5h8" strokeLinecap="round" />
    </svg>
  );
}

function IconeCarrinho() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path
        d="M3 4h2l2.4 11.4a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 8H6.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconePedidos() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path
        d="M6 3.5h12v17l-3-2-3 2-3-2-3 2v-17Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 8h6M9 11.5h6" strokeLinecap="round" />
    </svg>
  );
}

function IconeEntrar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 8l4 4-4 4M14 12H3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconePerfil() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeSair() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 16l4-4-4-4M18 12H8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BarraNavegacao() {
  const { cliente, sair } = useAutenticacao();
  const { itens } = useCarrinho();

  const quantidadeCarrinho = itens.reduce((soma, item) => soma + item.quantidade, 0);

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-zinc-900 text-zinc-200">
      <nav className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center rounded-md bg-white/95 px-3 py-1.5">
          <Image
            src="/marca/logo-colorida.png"
            alt="Mixology Drinkeria"
            width={200}
            height={58}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-marca-laranja">
            <IconeCardapio />
            Cardápio
          </Link>
          <Link href="/carrinho" className="relative flex items-center gap-1.5 transition-colors hover:text-marca-laranja">
            <IconeCarrinho />
            Carrinho
            {quantidadeCarrinho > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-marca-vermelho text-[10px] font-semibold text-white">
                {quantidadeCarrinho}
              </span>
            )}
          </Link>

          {cliente ? (
            <>
              <Link href="/pedidos" className="flex items-center gap-1.5 transition-colors hover:text-marca-laranja">
                <IconePedidos />
                Meus pedidos
              </Link>
              <span className="hidden text-zinc-600 sm:inline">|</span>
              <Link
                href="/perfil"
                className="hidden items-center gap-1.5 text-zinc-400 transition-colors hover:text-marca-laranja sm:flex"
              >
                <IconePerfil />
                {cliente.nome.split(" ")[0]}
              </Link>
              <button onClick={sair} className="flex items-center gap-1.5 text-zinc-400 transition-colors hover:text-marca-laranja">
                <IconeSair />
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="flex items-center gap-1.5 transition-colors hover:text-marca-laranja">
                <IconeEntrar />
                Entrar
              </Link>
              <Link href="/cadastro" className="botao-primario px-3 py-1.5 text-sm">
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
