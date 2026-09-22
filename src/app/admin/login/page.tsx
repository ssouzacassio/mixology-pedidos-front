"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function PaginaLoginAdmin() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const resposta = await api.loginAdmin(senha);
      localStorage.setItem("pedidos_admin_token", resposta.token);
      router.push("/admin/pedidos");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao entrar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-57px)] max-w-sm items-center justify-center px-4">
      <form onSubmit={aoEnviar} className="w-full space-y-4 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-xl font-semibold tracking-tight">Painel administrativo</h1>

        <label className="block text-sm">
          <span className="mb-1 block text-zinc-700">Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            autoFocus
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-marca-vermelho"
          />
        </label>

        {erro && <p className="text-sm text-marca-vermelho">{erro}</p>}

        <button type="submit" disabled={enviando} className="botao-primario w-full py-2">
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
