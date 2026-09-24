"use client";

import { useRef, useState } from "react";
import { useAutenticacao } from "@/contexts/AutenticacaoContexto";
import { api, Endereco } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TOTAL_TICKET = 10;

export default function PaginaPerfil() {
  const { cliente, token, recarregarPerfil } = useAutenticacao();

  if (!cliente || !token) return null;

  return (
    <div>
      <section className="bg-zinc-900 text-white">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <h1 className="text-3xl font-semibold tracking-tight">Meu perfil</h1>
        </div>
      </section>

      <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
        <SecaoFidelidade pedidosFidelidade={cliente.pedidosFidelidade} ticketsCompletos={cliente.ticketsCompletos} />
        <SecaoDadosPessoais token={token} nome={cliente.nome} email={cliente.email} telefone={cliente.telefone} fotoUrl={cliente.fotoUrl} recarregar={recarregarPerfil} />
        <SecaoEnderecos token={token} enderecos={cliente.enderecos} recarregar={recarregarPerfil} />
      </div>
    </div>
  );
}

function SecaoFidelidade({ pedidosFidelidade, ticketsCompletos }: { pedidosFidelidade: number; ticketsCompletos: number }) {
  return (
    <Card className="p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-titulo)] text-lg font-semibold">Fidelidade</h2>
        {ticketsCompletos > 0 && (
          <Badge className="bg-marca-laranja/15 text-marca-laranja hover:bg-marca-laranja/15">
            {ticketsCompletos} ticket{ticketsCompletos > 1 ? "s" : ""} completo{ticketsCompletos > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <div className="mb-2 flex flex-wrap gap-2">
        {Array.from({ length: TOTAL_TICKET }).map((_, indice) => {
          const preenchida = indice < pedidosFidelidade;
          return (
            <svg
              key={indice}
              viewBox="0 0 24 24"
              fill="none"
              stroke={preenchida ? "var(--color-marca-vermelho)" : "currentColor"}
              strokeWidth="1.8"
              className={`h-8 w-8 ${preenchida ? "text-marca-vermelho" : "text-muted-foreground/40"}`}
            >
              <path
                d="M5 4h14l-6 8.5V19h3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={preenchida ? "var(--color-marca-vermelho)" : "none"}
                fillOpacity={preenchida ? 0.15 : 0}
              />
              <path d="M9.5 19H16" strokeLinecap="round" />
            </svg>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground">
        {pedidosFidelidade}/{TOTAL_TICKET} pedidos entregues —{" "}
        {TOTAL_TICKET - pedidosFidelidade === 0
          ? "ticket completo!"
          : `faltam ${TOTAL_TICKET - pedidosFidelidade} pra fechar o ticket`}
      </p>
    </Card>
  );
}

function SecaoDadosPessoais({
  token,
  nome: nomeInicial,
  email,
  telefone: telefoneInicial,
  fotoUrl,
  recarregar,
}: {
  token: string;
  nome: string;
  email: string;
  telefone: string;
  fotoUrl: string;
  recarregar: () => Promise<void>;
}) {
  const [nome, setNome] = useState(nomeInicial);
  const [telefone, setTelefone] = useState(telefoneInicial);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const inputFotoRef = useRef<HTMLInputElement>(null);

  async function salvar() {
    setSalvando(true);
    setMensagem("");
    try {
      await api.atualizarPerfil(token, { nome, telefone });
      await recarregar();
      setMensagem("Dados atualizados!");
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  async function aoEscolherFoto(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    setEnviandoFoto(true);
    try {
      await api.atualizarFotoPerfil(token, arquivo);
      await recarregar();
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : "Erro ao enviar foto");
    } finally {
      setEnviandoFoto(false);
    }
  }

  return (
    <Card className="p-5 shadow-sm">
      <h2 className="mb-4 font-[family-name:var(--font-titulo)] text-lg font-semibold">Dados pessoais</h2>

      <div className="mb-5 flex items-center gap-4">
        <button onClick={() => inputFotoRef.current?.click()} disabled={enviandoFoto} className="shrink-0 rounded-full">
          <Avatar className="h-16 w-16">
            <AvatarImage src={fotoUrl} alt={nome} />
            <AvatarFallback className="text-lg font-semibold">{nome.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </button>
        <div>
          <button
            onClick={() => inputFotoRef.current?.click()}
            disabled={enviandoFoto}
            className="text-sm font-medium text-marca-vermelho hover:underline"
          >
            {enviandoFoto ? "Enviando..." : "Trocar foto"}
          </button>
          <input ref={inputFotoRef} type="file" accept="image/*" onChange={aoEscolherFoto} className="hidden" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>E-mail</Label>
          <Input value={email} disabled />
        </div>
        <div className="space-y-1.5">
          <Label>Telefone</Label>
          <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        </div>

        {mensagem && <p className="text-sm text-muted-foreground">{mensagem}</p>}

        <Button onClick={salvar} disabled={salvando} size="sm">
          {salvando ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </Card>
  );
}

function SecaoEnderecos({
  token,
  enderecos,
  recarregar,
}: {
  token: string;
  enderecos: Endereco[];
  recarregar: () => Promise<void>;
}) {
  const [criando, setCriando] = useState(false);
  const [rotulo, setRotulo] = useState("");
  const [endereco, setEndereco] = useState("");
  const [padrao, setPadrao] = useState(enderecos.length === 0);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvarNovo() {
    if (!endereco.trim()) return;
    setSalvando(true);
    setErro("");
    try {
      await api.criarEndereco(token, { rotulo, endereco, padrao });
      await recarregar();
      setCriando(false);
      setRotulo("");
      setEndereco("");
      setPadrao(false);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao adicionar endereço");
    } finally {
      setSalvando(false);
    }
  }

  async function definirPadrao(item: Endereco) {
    await api.atualizarEndereco(token, item.id, { rotulo: item.rotulo, endereco: item.endereco, padrao: true });
    recarregar();
  }

  async function remover(id: number) {
    if (!confirm("Remover esse endereço?")) return;
    await api.removerEndereco(token, id);
    recarregar();
  }

  return (
    <Card className="p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-titulo)] text-lg font-semibold">Meus endereços</h2>
        {!criando && (
          <button onClick={() => setCriando(true)} className="text-sm font-medium text-marca-vermelho hover:underline">
            + Adicionar
          </button>
        )}
      </div>

      <div className="space-y-2">
        {enderecos.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
            <div>
              <p className="flex items-center gap-2 font-medium">
                {item.rotulo || "Endereço"}
                {item.padrao && (
                  <Badge variant="outline" className="border-marca-vermelho/30 text-marca-vermelho">
                    padrão
                  </Badge>
                )}
              </p>
              <p className="text-muted-foreground">{item.endereco}</p>
            </div>
            <div className="flex shrink-0 gap-2 text-xs">
              {!item.padrao && (
                <button onClick={() => definirPadrao(item)} className="text-muted-foreground hover:text-marca-vermelho">
                  Tornar padrão
                </button>
              )}
              <button onClick={() => remover(item.id)} className="text-muted-foreground hover:text-marca-vermelho">
                remover
              </button>
            </div>
          </div>
        ))}
        {enderecos.length === 0 && !criando && <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado.</p>}
      </div>

      {criando && (
        <div className="mt-4 space-y-3 rounded-lg border p-3">
          <Input placeholder="Rótulo (ex: Casa, Trabalho)" value={rotulo} onChange={(e) => setRotulo(e.target.value)} />
          <Input placeholder="Endereço completo" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={padrao} onCheckedChange={(valor) => setPadrao(valor === true)} />
            Usar como padrão
          </label>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCriando(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={salvarNovo} disabled={salvando} className="flex-1">
              {salvando ? "Salvando..." : "Salvar endereço"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
