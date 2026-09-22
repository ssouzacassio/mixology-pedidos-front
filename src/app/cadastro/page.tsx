"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAutenticacao } from "@/contexts/AutenticacaoContexto";
import FundoBolhas from "@/components/FundoBolhas";

export default function PaginaCadastro() {
  return (
    <Suspense fallback={null}>
      <FormularioCadastro />
    </Suspense>
  );
}

function FormularioCadastro() {
  const { registrar } = useAutenticacao();
  const router = useRouter();
  const searchParams = useSearchParams();
  const retorno = searchParams.get("retorno") || "/";

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await registrar({ nome, email, senha, telefone, endereco });
      router.push(retorno);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao cadastrar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-57px)] items-center justify-center overflow-hidden bg-gradient-to-br from-marca-azul/15 via-[var(--background)] to-marca-laranja/10 p-4 py-10">
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

        <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-900">Criar conta</h1>

        <Campo rotulo="Nome" valor={nome} aoMudar={setNome} obrigatorio />
        <Campo rotulo="E-mail" tipo="email" valor={email} aoMudar={setEmail} obrigatorio />
        <Campo rotulo="Senha" tipo="password" valor={senha} aoMudar={setSenha} obrigatorio minimo={6} />
        <Campo rotulo="Telefone" valor={telefone} aoMudar={setTelefone} obrigatorio />
        <Campo rotulo="Endereço" valor={endereco} aoMudar={setEndereco} obrigatorio />

        {erro && <p className="text-sm text-marca-vermelho">{erro}</p>}

        <button type="submit" disabled={enviando} className="botao-primario w-full py-2">
          {enviando ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="text-center text-sm text-zinc-500">
          Já tem conta?{" "}
          <Link
            href={`/login${retorno !== "/" ? `?retorno=${encodeURIComponent(retorno)}` : ""}`}
            className="font-medium text-marca-vermelho hover:underline"
          >
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}

function Campo({
  rotulo,
  valor,
  aoMudar,
  tipo = "text",
  obrigatorio = false,
  minimo,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  tipo?: string;
  obrigatorio?: boolean;
  minimo?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-zinc-700">{rotulo}</span>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        required={obrigatorio}
        minLength={minimo}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-marca-vermelho"
      />
    </label>
  );
}
