"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, Cliente } from "@/lib/api";

interface AutenticacaoContextoTipo {
  cliente: Cliente | null;
  token: string | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  registrar: (dados: { nome: string; email: string; senha: string; telefone?: string; endereco?: string }) => Promise<void>;
  sair: () => void;
  recarregarPerfil: () => Promise<void>;
}

const AutenticacaoContexto = createContext<AutenticacaoContextoTipo | undefined>(undefined);

export function AutenticacaoProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const tokenSalvo = localStorage.getItem("pedidos_token");
    const clienteSalvo = localStorage.getItem("pedidos_cliente");
    if (tokenSalvo && clienteSalvo) {
      setToken(tokenSalvo);
      setCliente(JSON.parse(clienteSalvo));
    }
    setCarregando(false);
  }, []);

  function salvarSessao(novoToken: string, novoCliente: Cliente) {
    localStorage.setItem("pedidos_token", novoToken);
    localStorage.setItem("pedidos_cliente", JSON.stringify(novoCliente));
    setToken(novoToken);
    setCliente(novoCliente);
  }

  async function login(email: string, senha: string) {
    const resposta = await api.login({ email, senha });
    salvarSessao(resposta.token, resposta.cliente);
  }

  async function registrar(dados: { nome: string; email: string; senha: string; telefone?: string; endereco?: string }) {
    const resposta = await api.registrar(dados);
    salvarSessao(resposta.token, resposta.cliente);
  }

  function sair() {
    localStorage.removeItem("pedidos_token");
    localStorage.removeItem("pedidos_cliente");
    setToken(null);
    setCliente(null);
  }

  async function recarregarPerfil() {
    if (!token) return;
    const clienteAtualizado = await api.obterPerfil(token);
    localStorage.setItem("pedidos_cliente", JSON.stringify(clienteAtualizado));
    setCliente(clienteAtualizado);
  }

  return (
    <AutenticacaoContexto.Provider value={{ cliente, token, carregando, login, registrar, sair, recarregarPerfil }}>
      {children}
    </AutenticacaoContexto.Provider>
  );
}

export function useAutenticacao() {
  const contexto = useContext(AutenticacaoContexto);
  if (!contexto) {
    throw new Error("useAutenticacao precisa estar dentro de um AutenticacaoProvider");
  }
  return contexto;
}
