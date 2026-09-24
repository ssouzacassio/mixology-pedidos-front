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

          <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground">Entrar</h1>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="senha">Senha</Label>
            <Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <Button type="submit" disabled={enviando} className="w-full">
            {enviando ? "Entrando..." : "Entrar"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link
              href={`/cadastro${retorno !== "/" ? `?retorno=${encodeURIComponent(retorno)}` : ""}`}
              className="font-medium text-marca-vermelho hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
