"use client";

import { useRef, useState } from "react";
import { useAutenticacao } from "@/contexts/AutenticacaoContexto";
import { api, Endereco } from "@/lib/api";

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
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-titulo)] text-lg font-semibold">Fidelidade</h2>
        {ticketsCompletos > 0 && (
          <span className="rounded-full bg-marca-laranja/15 px-2 py-0.5 text-xs font-medium text-marca-laranja">
            {ticketsCompletos} ticket{ticketsCompletos > 1 ? "s" : ""} completo{ticketsCompletos > 1 ? "s" : ""}
          </span>
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
              className={`h-8 w-8 ${preenchida ? "text-marca-vermelho" : "text-zinc-300"}`}
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

      <p className="text-sm text-zinc-500">
        {pedidosFidelidade}/{TOTAL_TICKET} pedidos entregues —{" "}
        {TOTAL_TICKET - pedidosFidelidade === 0
          ? "ticket completo!"
          : `faltam ${TOTAL_TICKET - pedidosFidelidade} pra fechar o ticket`}
      </p>
    </section>
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
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-[family-name:var(--font-titulo)] text-lg font-semibold">Dados pessoais</h2>

      <div className="mb-5 flex items-center gap-4">
        <button
          onClick={() => inputFotoRef.current?.click()}
          disabled={enviandoFoto}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100"
        >
          {fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoUrl} alt={nome} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-zinc-400">
              {nome.charAt(0).toUpperCase()}
            </span>
          )}
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
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-700">Nome</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-marca-vermelho"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-700">E-mail</span>
          <input value={email} disabled className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-500" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-700">Telefone</span>
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-marca-vermelho"
          />
        </label>

        {mensagem && <p className="text-sm text-zinc-500">{mensagem}</p>}

        <button onClick={salvar} disabled={salvando} className="botao-primario px-4 py-2 text-sm">
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </section>
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
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
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
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 p-3 text-sm">
            <div>
              <p className="font-medium">
                {item.rotulo || "Endereço"}
                {item.padrao && (
                  <span className="ml-2 rounded-full bg-marca-vermelho/10 px-2 py-0.5 text-xs text-marca-vermelho">
                    padrão
                  </span>
                )}
              </p>
              <p className="text-zinc-500">{item.endereco}</p>
            </div>
            <div className="flex shrink-0 gap-2 text-xs">
              {!item.padrao && (
                <button onClick={() => definirPadrao(item)} className="text-zinc-500 hover:text-marca-vermelho">
                  Tornar padrão
                </button>
              )}
              <button onClick={() => remover(item.id)} className="text-zinc-400 hover:text-marca-vermelho">
                remover
              </button>
            </div>
          </div>
        ))}
        {enderecos.length === 0 && !criando && <p className="text-sm text-zinc-400">Nenhum endereço cadastrado.</p>}
      </div>

      {criando && (
        <div className="mt-4 space-y-3 rounded-lg border border-zinc-200 p-3">
          <input
            placeholder="Rótulo (ex: Casa, Trabalho)"
            value={rotulo}
            onChange={(e) => setRotulo(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-marca-vermelho"
          />
          <input
            placeholder="Endereço completo"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-marca-vermelho"
          />
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input type="checkbox" checked={padrao} onChange={(e) => setPadrao(e.target.checked)} className="accent-marca-vermelho" />
            Usar como padrão
          </label>

          {erro && <p className="text-sm text-marca-vermelho">{erro}</p>}

          <div className="flex gap-2">
            <button
              onClick={() => setCriando(false)}
              className="flex-1 rounded-md border border-zinc-300 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button onClick={salvarNovo} disabled={salvando} className="botao-primario flex-1 py-2 text-sm">
              {salvando ? "Salvando..." : "Salvar endereço"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
