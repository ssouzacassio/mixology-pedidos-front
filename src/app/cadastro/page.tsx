"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAutenticacao } from "@/contexts/AutenticacaoContexto";
import FundoBolhas from "@/components/FundoBolhas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

      <Card className="animar-surgir relative w-full max-w-sm gap-0 py-0 shadow-xl">
        <form onSubmit={aoEnviar} className="flex flex-col gap-4 p-8">
          <div className="-mx-8 -mt-8 mb-2 h-1.5 bg-gradient-to-r from-marca-vermelho via-marca-laranja to-marca-azul" />

          <Image
            src="/marca/logo-colorida.png"
            alt="Mixology Drinkeria"
            width={200}
            height={58}
            className="mx-auto mb-2 mt-4"
            priority
          />

          <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground">Criar conta</h1>

          <Campo rotulo="Nome" valor={nome} aoMudar={setNome} obrigatorio />
          <Campo rotulo="E-mail" tipo="email" valor={email} aoMudar={setEmail} obrigatorio />
          <Campo rotulo="Senha" tipo="password" valor={senha} aoMudar={setSenha} obrigatorio minimo={6} />
          <Campo rotulo="Telefone" valor={telefone} aoMudar={setTelefone} obrigatorio />
          <Campo rotulo="Endereço" valor={endereco} aoMudar={setEndereco} obrigatorio />

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <Button type="submit" disabled={enviando} className="w-full">
            {enviando ? "Criando conta..." : "Criar conta"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link
              href={`/login${retorno !== "/" ? `?retorno=${encodeURIComponent(retorno)}` : ""}`}
              className="font-medium text-marca-vermelho hover:underline"
            >
              Entrar
            </Link>
          </p>
        </form>
      </Card>
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
    <div className="space-y-1.5">
      <Label>{rotulo}</Label>
      <Input
        type={tipo}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        required={obrigatorio}
        minLength={minimo}
      />
    </div>
  );
}
