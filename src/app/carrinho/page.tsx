"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCarrinho } from "@/contexts/CarrinhoContexto";
import { useAutenticacao } from "@/contexts/AutenticacaoContexto";
import { api, FormaPagamento, ItemPedidoEntrada, Pedido } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const OPCOES_PAGAMENTO: { valor: FormaPagamento; texto: string }[] = [
  { valor: "pix", texto: "Pix" },
  { valor: "credito", texto: "Crédito" },
  { valor: "debito", texto: "Débito" },
];

export default function PaginaCarrinho() {
  const { itens, definirQuantidade, remover, limpar, total } = useCarrinho();
  const { cliente, token } = useAutenticacao();
  const router = useRouter();

  const enderecoPadrao = cliente?.enderecos.find((e) => e.padrao) || cliente?.enderecos[0];
  const [enderecoId, setEnderecoId] = useState<number | undefined>(enderecoPadrao?.id);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [pedidoCriado, setPedidoCriado] = useState<Pedido | null>(null);
  const [cobrancaPix, setCobrancaPix] = useState<{ copiaECola: string; valor: number } | null>(null);

  async function finalizarPedido() {
    if (!token) {
      router.push("/cadastro?retorno=/carrinho");
      return;
    }

    setErro("");
    setEnviando(true);
    try {
      const itensEntrada: ItemPedidoEntrada[] = itens.map((item) =>
        item.produto
          ? { produtoId: item.produto.id, quantidade: item.quantidade }
          : {
              personalizado: true,
              ingredientesIds: item.personalizado!.ingredientes.map((i) => i.id),
              nomePersonalizado: item.personalizado!.nomePersonalizado,
              quantidade: item.quantidade,
            }
      );

      const pedido = await api.criarPedido(token, {
        itens: itensEntrada,
        tipoEntrega: "delivery",
        enderecoId,
        formaPagamento,
      });

      if (formaPagamento === "pix") {
        const pix = await api.gerarCobrancaPix(token, pedido.id);
        setCobrancaPix(pix);
      }

      setPedidoCriado(pedido);
      limpar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao finalizar pedido");
    } finally {
      setEnviando(false);
    }
  }

  if (pedidoCriado) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Pedido #{pedidoCriado.id} recebido!</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Itens: R$ {(pedidoCriado.valorTotal - pedidoCriado.valorFrete).toFixed(2).replace(".", ",")} + Entrega: R${" "}
          {pedidoCriado.valorFrete.toFixed(2).replace(".", ",")} = <strong>R$ {pedidoCriado.valorTotal.toFixed(2).replace(".", ",")}</strong>
        </p>

        {cobrancaPix ? (
          <>
            <p className="mb-6 text-muted-foreground">Finalize o pagamento via Pix para confirmar.</p>
            <Card className="animar-surgir gap-0 overflow-hidden py-0 shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-marca-vermelho via-marca-laranja to-marca-azul" />
              <div className="p-6">
                <p className="text-sm text-muted-foreground">Valor a pagar</p>
                <p className="mb-4 text-2xl font-semibold text-marca-vermelho">
                  R$ {cobrancaPix.valor.toFixed(2).replace(".", ",")}
                </p>
                <p className="mb-1 text-sm text-muted-foreground">Pix copia e cola</p>
                <p className="break-all rounded-md bg-muted p-3 font-mono text-xs">{cobrancaPix.copiaECola}</p>
              </div>
            </Card>
          </>
        ) : (
          <p className="mb-6 text-muted-foreground">
            Pagamento no {formaPagamento === "credito" ? "crédito" : "débito"} na maquininha, na hora da entrega.
          </p>
        )}

        <Link href="/pedidos" className="mt-6 inline-block font-medium text-marca-vermelho hover:underline">
          Acompanhar meus pedidos
        </Link>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <p className="mb-4 text-muted-foreground">Seu carrinho está vazio.</p>
        <Link href="/" className="font-medium text-marca-vermelho hover:underline">
          Ver cardápio
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Carrinho</h1>

      <div className="mb-6 space-y-3">
        {itens.map((item) => {
          const nome = item.produto?.nome || item.personalizado?.nomePersonalizado || item.personalizado?.nome || "Item";
          const preco = item.produto?.preco ?? item.personalizado?.preco ?? 0;
          const subtitulo = item.personalizado?.nomePersonalizado ? item.personalizado.nome : null;
          return (
            <Card key={item.chave} className="flex-row items-center justify-between gap-3 p-3 shadow-sm">
              <div>
                <p className="font-medium">{nome}</p>
                {subtitulo && <p className="text-xs text-muted-foreground">{subtitulo}</p>}
                <p className="text-sm text-muted-foreground">R$ {preco.toFixed(2).replace(".", ",")} cada</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={item.quantidade}
                  onChange={(e) => definirQuantidade(item.chave, Number(e.target.value))}
                  className="w-14 text-center"
                />
                <button onClick={() => remover(item.chave)} className="text-sm text-muted-foreground hover:text-marca-vermelho">
                  remover
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mb-6 gap-2 p-4 shadow-sm">
        <p className="text-sm font-medium text-foreground">
          Entrega <span className="font-normal text-muted-foreground">— por enquanto só fazemos delivery</span>
        </p>
        {cliente && cliente.enderecos.length > 0 ? (
          <select
            value={enderecoId}
            onChange={(e) => setEnderecoId(Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
          >
            {cliente.enderecos.map((endereco) => (
              <option key={endereco.id} value={endereco.id}>
                {endereco.rotulo ? `${endereco.rotulo} — ` : ""}
                {endereco.endereco}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-muted-foreground">
            {cliente ? (
              <>
                Nenhum endereço cadastrado.{" "}
                <Link href="/perfil" className="font-medium text-marca-vermelho hover:underline">
                  Adicione um no seu perfil
                </Link>
                .
              </>
            ) : (
              "O endereço do seu cadastro será usado na entrega."
            )}
          </p>
        )}
      </Card>

      <Card className="mb-6 gap-3 p-4 shadow-sm">
        <p className="text-sm font-medium text-foreground">Forma de pagamento</p>
        <RadioGroup
          value={formaPagamento}
          onValueChange={(valor) => setFormaPagamento(valor as FormaPagamento)}
          className="grid-flow-col justify-start gap-4"
        >
          {OPCOES_PAGAMENTO.map((opcao) => (
            <div key={opcao.valor} className="flex items-center gap-2">
              <RadioGroupItem value={opcao.valor} id={`pagamento-${opcao.valor}`} />
              <Label htmlFor={`pagamento-${opcao.valor}`} className="font-normal">
                {opcao.texto}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {formaPagamento !== "pix" && (
          <p className="text-xs text-muted-foreground">Pagamento na maquininha, na hora da entrega.</p>
        )}
      </Card>

      <div className="mb-2 flex items-center justify-between text-lg font-semibold">
        <span>Subtotal</span>
        <span className="text-marca-vermelho">R$ {total.toFixed(2).replace(".", ",")}</span>
      </div>
      <p className="mb-6 text-xs text-muted-foreground">+ taxa de entrega, calculada ao confirmar o pedido</p>

      {erro && <p className="mb-4 text-sm text-destructive">{erro}</p>}

      <Button onClick={finalizarPedido} disabled={enviando || (!!cliente && !enderecoId)} className="w-full">
        {enviando ? "Enviando pedido..." : cliente ? "Finalizar pedido" : "Criar conta e finalizar pedido"}
      </Button>
    </div>
  );
}
