"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAutenticacao } from "@/contexts/AutenticacaoContexto";
import FundoBolhas from "@/components/FundoBolhas";

export default function PaginaLogin() {
  return (
    <Suspense fallback={null}>
      <FormularioLogin />
    </Suspense>
  );
}

function FormularioLogin() {
  const { login } = useAutenticacao();
  const router = useRouter();
  const searchParams = useSearchParams();
  const retorno = searchParams.get("retorno") || "/";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await login(email, senha);
      router.push(retorno);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao entrar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-57px)] items-center justify-center overflow-hidden bg-gradient-to-br from-marca-azul/15 via-[var(--background)] to-marca-laranja/10 p-4">
      <FundoBolhas />

      <form
        onSubmit={aoEnviar}
        className="animar-surgir relative flex w-full max-w-sm flex-col gap-4 overflow-hidden rounded-xl bg-white p-8 shadow-xl"
      >
        <div className="-mx-8 -mt-8 mb-2 h-1.5 bg-gradient-to-r from-marca-vermelho via-marca-laranja to-marca-azul" />

        <Image
          src="/marca/logo-colorida.png"
          alt="Mixology Drinkeria"
          width={200}
          height={58}
          className="mx-auto mb-2 mt-4"
          priority
        />

        <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-900">Entrar</h1>

        <label className="block text-sm">
          <span className="mb-1 block text-zinc-700">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-marca-vermelho"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-zinc-700">Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-marca-vermelho"
          />
        </label>

        {erro && <p className="text-sm text-marca-vermelho">{erro}</p>}

        <button type="submit" disabled={enviando} className="botao-primario w-full py-2">
          {enviando ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-center text-sm text-zinc-500">
          Ainda não tem conta?{" "}
          <Link
            href={`/cadastro${retorno !== "/" ? `?retorno=${encodeURIComponent(retorno)}` : ""}`}
            className="font-medium text-marca-vermelho hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}
