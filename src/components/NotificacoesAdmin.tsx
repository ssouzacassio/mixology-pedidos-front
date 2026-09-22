"use client";

import { useEffect, useState } from "react";
import { api, Notificacao } from "@/lib/api";

export default function NotificacoesAdmin({ token }: { token: string }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [aberto, setAberto] = useState(false);

  async function carregar() {
    try {
      const dados = await api.listarNotificacoesAdmin(token);
      setNotificacoes(dados);
    } catch {
      // silencioso: sino não é crítico pra operação
    }
  }

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, 20000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  async function marcarLida(id: number) {
    setNotificacoes((atual) => atual.map((n) => (n.id === id ? { ...n, lida: true } : n)));
    try {
      await api.marcarNotificacaoLida(token, id);
    } catch {
      carregar();
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setAberto((a) => !a)}
        className="relative rounded-md border border-zinc-300 p-2 text-zinc-600 hover:bg-zinc-50"
        aria-label="Notificações"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path
            d="M18 16v-5a6 6 0 1 0-12 0v5l-1.5 2.5h15L18 16Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M10 21h4" strokeLinecap="round" />
        </svg>
        {naoLidas > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-marca-vermelho text-[10px] font-semibold text-white">
            {naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="animar-surgir absolute right-0 z-20 mt-2 w-80 rounded-xl border border-zinc-200 bg-white shadow-lg">
          <div className="border-b border-zinc-100 px-4 py-3 text-sm font-medium">Notificações</div>
          <div className="max-h-80 overflow-y-auto">
            {notificacoes.length === 0 && <p className="p-4 text-sm text-zinc-400">Nenhuma notificação ainda.</p>}
            {notificacoes.map((n) => (
              <button
                key={n.id}
                onClick={() => marcarLida(n.id)}
                className={`block w-full border-b border-zinc-50 p-3 text-left text-sm last:border-0 hover:bg-zinc-50 ${
                  n.lida ? "text-zinc-400" : "font-medium text-zinc-800"
                }`}
              >
                {n.mensagem}
                <div className="mt-1 text-xs font-normal text-zinc-400">
                  {new Date(n.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
