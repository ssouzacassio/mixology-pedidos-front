"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { Ingrediente, Produto } from "@/lib/api";

export interface ItemCarrinho {
  chave: string;
  quantidade: number;
  produto?: Produto;
  personalizado?: { ingredientes: Ingrediente[]; nome: string; nomePersonalizado?: string; preco: number };
}

interface CarrinhoContextoTipo {
  itens: ItemCarrinho[];
  adicionar: (produto: Produto) => void;
  adicionarPersonalizado: (ingredientes: Ingrediente[], nomePersonalizado?: string) => void;
  remover: (chave: string) => void;
  definirQuantidade: (chave: string, quantidade: number) => void;
  limpar: () => void;
  total: number;
}

const CarrinhoContexto = createContext<CarrinhoContextoTipo | undefined>(undefined);

const CHAVE_ARMAZENAMENTO = "pedidos_carrinho";

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const carregouDoDisco = useRef(false);

  // Recupera o carrinho salvo assim que a página abre (sobrevive a recarregar
  // a aba, trocar de app no celular, etc.).
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_ARMAZENAMENTO);
      if (salvo) setItens(JSON.parse(salvo));
    } catch {
      // localStorage indisponível (modo privado, etc.) — segue com carrinho vazio
    } finally {
      carregouDoDisco.current = true;
    }
  }, []);

  // Só salva depois de já ter carregado, pra não sobrescrever o que tava salvo
  // com o estado inicial vazio antes da leitura acima terminar.
  useEffect(() => {
    if (!carregouDoDisco.current) return;
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(itens));
    } catch {
      // localStorage indisponível — carrinho segue funcionando só na memória
    }
  }, [itens]);

  function adicionar(produto: Produto) {
    const chave = `produto-${produto.id}`;
    setItens((atual) => {
      const existente = atual.find((item) => item.chave === chave);
      if (existente) {
        return atual.map((item) => (item.chave === chave ? { ...item, quantidade: item.quantidade + 1 } : item));
      }
      return [...atual, { chave, produto, quantidade: 1 }];
    });
  }

  function adicionarPersonalizado(ingredientes: Ingrediente[], nomePersonalizado?: string) {
    const preco = ingredientes.reduce((soma, ingrediente) => soma + ingrediente.preco, 0);
    const nome = ingredientes.map((i) => i.nome).join(" + ");
    const chave = `personalizado-${Date.now()}`;
    setItens((atual) => [
      ...atual,
      { chave, quantidade: 1, personalizado: { ingredientes, nome, nomePersonalizado, preco } },
    ]);
  }

  function remover(chave: string) {
    setItens((atual) => atual.filter((item) => item.chave !== chave));
  }

  function definirQuantidade(chave: string, quantidade: number) {
    if (quantidade <= 0) {
      remover(chave);
      return;
    }
    setItens((atual) => atual.map((item) => (item.chave === chave ? { ...item, quantidade } : item)));
  }

  function limpar() {
    setItens([]);
  }

  const total = itens.reduce((soma, item) => {
    const preco = item.produto?.preco ?? item.personalizado?.preco ?? 0;
    return soma + preco * item.quantidade;
  }, 0);

  return (
    <CarrinhoContexto.Provider
      value={{ itens, adicionar, adicionarPersonalizado, remover, definirQuantidade, limpar, total }}
    >
      {children}
    </CarrinhoContexto.Provider>
  );
}

export function useCarrinho() {
  const contexto = useContext(CarrinhoContexto);
  if (!contexto) {
    throw new Error("useCarrinho precisa estar dentro de um CarrinhoProvider");
  }
  return contexto;
}
