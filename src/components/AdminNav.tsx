"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NotificacoesAdmin from "@/components/NotificacoesAdmin";

export default function AdminNav({ adminToken }: { adminToken: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  function sair() {
    localStorage.removeItem("pedidos_admin_token");
    router.push("/admin/login");
  }

  const linkClasse = (rota: string) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      pathname === rota ? "bg-marca-vermelho/10 text-marca-vermelho" : "text-zinc-600 hover:bg-zinc-100"
    }`;

  return (
    <div className="mb-6 flex items-center justify-between">
      <nav className="flex items-center gap-2">
        <Link href="/admin/pedidos" className={linkClasse("/admin/pedidos")}>
          Pedidos
        </Link>
        <Link href="/admin/relatorios" className={linkClasse("/admin/relatorios")}>
          Relatórios
        </Link>
        <Link href="/admin/chat" className={linkClasse("/admin/chat")}>
          Chat
        </Link>
      </nav>
      <div className="flex items-center gap-3">
        {adminToken && <NotificacoesAdmin token={adminToken} />}
        <button onClick={sair} className="text-sm text-zinc-500 hover:text-marca-vermelho">
          Sair
        </button>
      </div>
    </div>
  );
}
