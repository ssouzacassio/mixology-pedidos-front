"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, ConversaAdmin, Mensagem } from "@/lib/api";
import AdminNav from "@/components/AdminNav";

function formatarHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function PaginaChatAdmin() {
  const router = useRouter();
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [conversas, setConversas] = useState<ConversaAdmin[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  const carregarConversas = useCallback(async () => {
    const token = localStorage.getItem("pedidos_admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    try {
      const dados = await api.listarConversasAdmin(token);
      setConversas(dados);
    } catch {
      // silencioso: lista atualiza de novo no próximo ciclo
    }
  }, [router]);

  useEffect(() => {
    setAdminToken(localStorage.getItem("pedidos_admin_token"));
    carregarConversas();
    const intervalo = setInterval(carregarConversas, 8000);
    return () => clearInterval(intervalo);
  }, [carregarConversas]);

  const carregarMensagens = useCallback(async () => {
    if (!adminToken || clienteSelecionado === null) return;
    const dados = await api.historicoChatAdmin(adminToken, clienteSelecionado);
    setMensagens(dados);
  }, [adminToken, clienteSelecionado]);

  useEffect(() => {
    carregarMensagens();
    const intervalo = setInterval(carregarMensagens, 5000);
    return () => clearInterval(intervalo);
  }, [carregarMensagens]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!adminToken || clienteSelecionado === null || !texto.trim()) return;

    setEnviando(true);
    try {
      const nova = await api.enviarChatAdmin(adminToken, clienteSelecionado, texto.trim());
      setMensagens((atual) => [...atual, nova]);
      setTexto("");
    } finally {
      setEnviando(false);
    }
  }

  const conversaAtual = conversas.find((c) => c.clienteId === clienteSelecionado);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <AdminNav adminToken={adminToken} />

      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Chat</h1>

      <div className="grid gap-4 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm md:grid-cols-[280px_1fr]">
        <div className="max-h-[70vh] overflow-y-auto border-b border-zinc-100 md:border-b-0 md:border-r">
          {conversas.length === 0 && <p className="p-4 text-sm text-zinc-400">Nenhuma conversa ainda.</p>}
          {conversas.map((conversa) => (
            <button
              key={conversa.clienteId}
              onClick={() => setClienteSelecionado(conversa.clienteId)}
              className={`block w-full border-b border-zinc-50 p-3 text-left text-sm hover:bg-zinc-50 ${
                clienteSelecionado === conversa.clienteId ? "bg-marca-vermelho/5" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-800">{conversa.nomeCliente}</span>
                {conversa.naoLidas > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-marca-vermelho text-xs font-semibold text-white">
                    {conversa.naoLidas}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-zinc-500">{conversa.ultimaMensagem}</p>
            </button>
          ))}
        </div>

        <div className="flex h-[70vh] flex-col">
          {clienteSelecionado === null ? (
            <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">
              Escolha uma conversa pra visualizar
            </div>
          ) : (
            <>
              <div className="border-b border-zinc-100 p-3 text-sm font-medium">{conversaAtual?.nomeCliente}</div>
              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {mensagens.map((mensagem) => (
                  <div key={mensagem.id}>
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                        mensagem.remetente === "atendente"
                          ? "ml-auto bg-gradient-to-r from-marca-vermelho to-[#c23330] text-white"
                          : "bg-zinc-100 text-zinc-800"
                      }`}
                    >
                      {mensagem.texto}
                    </div>
                    <p
                      className={`mt-0.5 text-[11px] text-zinc-400 ${
                        mensagem.remetente === "atendente" ? "text-right" : ""
                      }`}
                    >
                      {formatarHora(mensagem.criadoEm)}
                    </p>
                  </div>
                ))}
                <div ref={fimRef} />
              </div>
              <form onSubmit={enviar} className="flex gap-2 border-t border-zinc-100 p-3">
                <input
                  type="text"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Responder..."
                  className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-marca-vermelho"
                />
                <button type="submit" disabled={enviando} className="botao-primario px-4 py-2 text-sm">
                  Enviar
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
