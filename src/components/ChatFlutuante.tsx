"use client";

import { useEffect, useRef, useState } from "react";
import { useAutenticacao } from "@/contexts/AutenticacaoContexto";
import { api, Mensagem } from "@/lib/api";

export default function ChatFlutuante() {
  const { cliente, token } = useAutenticacao();
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [naoLidas, setNaoLidas] = useState(0);
  const abertoRef = useRef(aberto);
  const socketRef = useRef<WebSocket | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  abertoRef.current = aberto;

  useEffect(() => {
    if (!token) return;

    api.historicoChat(token).then(setMensagens);

    const urlBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api").replace(/^http/, "ws");
    const socket = new WebSocket(`${urlBase}/chat/ws?token=${token}`);
    socketRef.current = socket;

    socket.onmessage = (evento) => {
      const mensagem: Mensagem = JSON.parse(evento.data);
      setMensagens((atual) => [...atual, mensagem]);
      if (!abertoRef.current) setNaoLidas((n) => n + 1);
    };

    return () => socket.close();
  }, [token]);

  useEffect(() => {
    if (aberto) {
      setNaoLidas(0);
      fimRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [aberto, mensagens]);

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!texto.trim() || !socketRef.current) return;
    socketRef.current.send(JSON.stringify({ texto }));
    setTexto("");
  }

  if (!cliente) return null;

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-3">
      {aberto && (
        <div className="animar-surgir flex h-96 w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-zinc-900 px-4 py-3 text-white">
            <span className="font-[family-name:var(--font-titulo)] font-medium">Fala com a gente</span>
            <button onClick={() => setAberto(false)} className="text-zinc-400 hover:text-white" aria-label="Fechar chat">
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {mensagens.length === 0 && (
              <p className="text-sm text-zinc-400">Manda sua dúvida que a gente te responde por aqui.</p>
            )}
            {mensagens.map((mensagem) => (
              <div
                key={mensagem.id}
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  mensagem.remetente === "cliente"
                    ? "ml-auto bg-gradient-to-r from-marca-vermelho to-[#c23330] text-white"
                    : "bg-zinc-100 text-zinc-800"
                }`}
              >
                {mensagem.texto}
              </div>
            ))}
            <div ref={fimRef} />
          </div>

          <form onSubmit={enviar} className="flex gap-2 border-t border-zinc-100 p-2">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-marca-vermelho"
            />
            <button type="submit" className="botao-primario px-3 py-1.5 text-sm">
              Enviar
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setAberto((atual) => !atual)}
        aria-label="Abrir chat"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-marca-vermelho to-[#c23330] text-white shadow-lg transition-transform hover:brightness-110 active:scale-95"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
          <path
            d="M21 12a8 8 0 1 1-3.4-6.55L21 4l-1 4.2A7.96 7.96 0 0 1 21 12Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {naoLidas > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-marca-laranja text-xs font-bold text-white">
            {naoLidas}
          </span>
        )}
      </button>
    </div>
  );
}
