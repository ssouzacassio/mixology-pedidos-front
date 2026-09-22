const URL_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

interface OpcoesRequisicao extends RequestInit {
  token?: string | null;
}

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requisitar<T>(caminho: string, opcoes: OpcoesRequisicao = {}): Promise<T> {
  const { token, headers, ...resto } = opcoes;

  const cabecalhos = {
    ...(opcoes.body && !(opcoes.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  // O backend gratuito "dorme" depois de um tempo sem uso e pode levar até uns
  // 40-50s pra acordar — insiste várias vezes antes de desistir de vez.
  const atrasos = [0, 3000, 6000, 8000, 10000, 10000];
  let resposta: Response | undefined;
  let ultimoErro: unknown;

  for (const atraso of atrasos) {
    if (atraso > 0) await esperar(atraso);
    try {
      resposta = await fetch(`${URL_BASE}${caminho}`, { ...resto, headers: cabecalhos });
      break;
    } catch (erro) {
      ultimoErro = erro;
    }
  }

  if (!resposta) {
    console.error("Falha ao conectar com o backend após várias tentativas:", ultimoErro);
    throw new Error("Não foi possível conectar ao servidor. Verifique sua internet e tente de novo.");
  }

  if (resposta.status === 204) return undefined as T;

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new Error(dados?.erro || "Erro ao comunicar com o servidor");
  }

  return dados as T;
}

export const api = {
  registrar: (dados: { nome: string; email: string; senha: string; telefone?: string; endereco?: string }) =>
    requisitar<{ token: string; cliente: Cliente }>("/auth/registrar", {
      method: "POST",
      body: JSON.stringify(dados),
    }),

  login: (dados: { email: string; senha: string }) =>
    requisitar<{ token: string; cliente: Cliente }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(dados),
    }),

  listarProdutos: () => requisitar<Produto[]>("/produtos"),

  listarIngredientes: () => requisitar<Ingrediente[]>("/ingredientes"),

  listarDrinksSalvos: (token: string) => requisitar<DrinkSalvo[]>("/drinks-salvos", { token }),

  criarDrinkSalvo: (token: string, dados: { nome: string; ingredientesIds: number[] }) =>
    requisitar<DrinkSalvo>("/drinks-salvos", { method: "POST", token, body: JSON.stringify(dados) }),

  removerDrinkSalvo: (token: string, id: number) =>
    requisitar<void>(`/drinks-salvos/${id}`, { method: "DELETE", token }),

  criarPedido: (
    token: string,
    dados: {
      itens: ItemPedidoEntrada[];
      tipoEntrega: string;
      enderecoId?: number;
      formaPagamento: FormaPagamento;
    }
  ) =>
    requisitar<Pedido>("/pedidos", {
      method: "POST",
      token,
      body: JSON.stringify(dados),
    }),

  listarMeusPedidos: (token: string) => requisitar<Pedido[]>("/pedidos", { token }),

  gerarCobrancaPix: (token: string, pedidoId: number) =>
    requisitar<{ pixTxId: string; valor: number; copiaECola: string }>(`/pedidos/${pedidoId}/pix`, {
      method: "POST",
      token,
    }),

  historicoChat: (token: string) => requisitar<Mensagem[]>("/chat/mensagens", { token }),

  listarConversasAdmin: (token: string) => requisitar<ConversaAdmin[]>("/admin/chats", { token }),

  historicoChatAdmin: (token: string, clienteId: number) =>
    requisitar<Mensagem[]>(`/admin/chats/${clienteId}/mensagens`, { token }),

  enviarChatAdmin: (token: string, clienteId: number, texto: string) =>
    requisitar<Mensagem>(`/admin/chats/${clienteId}/mensagens`, {
      method: "POST",
      token,
      body: JSON.stringify({ texto }),
    }),

  obterPerfil: (token: string) => requisitar<Cliente>("/perfil", { token }),

  atualizarPerfil: (token: string, dados: { nome: string; telefone: string }) =>
    requisitar<Cliente>("/perfil", { method: "PUT", token, body: JSON.stringify(dados) }),

  atualizarFotoPerfil: (token: string, arquivo: File) => {
    const form = new FormData();
    form.append("foto", arquivo);
    return requisitar<{ fotoUrl: string }>("/perfil/foto", { method: "POST", token, body: form });
  },

  criarEndereco: (token: string, dados: { rotulo: string; endereco: string; padrao: boolean }) =>
    requisitar<Endereco>("/perfil/enderecos", { method: "POST", token, body: JSON.stringify(dados) }),

  atualizarEndereco: (token: string, id: number, dados: { rotulo: string; endereco: string; padrao: boolean }) =>
    requisitar<Endereco>(`/perfil/enderecos/${id}`, { method: "PUT", token, body: JSON.stringify(dados) }),

  removerEndereco: (token: string, id: number) =>
    requisitar<void>(`/perfil/enderecos/${id}`, { method: "DELETE", token }),

  loginAdmin: (senha: string) =>
    requisitar<{ token: string }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ senha }),
    }),

  listarPedidosAdmin: (token: string) => requisitar<PedidoAdmin[]>("/admin/pedidos", { token }),

  atualizarStatusPedido: (token: string, pedidoId: number, status: StatusPedido) =>
    requisitar<Pedido>(`/admin/pedidos/${pedidoId}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    }),

  editarPedidoAdmin: (
    token: string,
    pedidoId: number,
    dados: { itens: { produtoId: number; quantidade: number }[]; enderecoEntrega: string }
  ) =>
    requisitar<Pedido>(`/admin/pedidos/${pedidoId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(dados),
    }),

  listarNotificacoesAdmin: (token: string) => requisitar<Notificacao[]>("/admin/notificacoes", { token }),

  marcarNotificacaoLida: (token: string, id: number) =>
    requisitar<void>(`/admin/notificacoes/${id}/lida`, { method: "PATCH", token }),

  obterRelatorioAdmin: (token: string) => requisitar<Relatorio>("/admin/relatorio", { token }),
};

export type StatusPedido = "recebido" | "preparando" | "saiu_para_entrega" | "entregue" | "cancelado";
export type FormaPagamento = "credito" | "debito" | "pix";
export type CategoriaIngrediente = "base" | "mixer" | "extra";

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  fotoUrl: string;
  enderecos: Endereco[];
  pedidosFidelidade: number;
  ticketsCompletos: number;
}

export interface Endereco {
  id: number;
  clienteId: number;
  rotulo: string;
  endereco: string;
  padrao: boolean;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  imagemUrl: string;
  disponivel: boolean;
}

export interface Ingrediente {
  id: number;
  nome: string;
  categoria: CategoriaIngrediente;
  preco: number;
  disponivel: boolean;
}

export interface ItemPedidoEntrada {
  produtoId?: number;
  quantidade: number;
  personalizado?: boolean;
  ingredientesIds?: number[];
  nomePersonalizado?: string;
}

export interface DrinkSalvo {
  id: number;
  clienteId: number;
  nome: string;
  ingredientes: Ingrediente[];
  criadoEm: string;
}

export interface ItemPedido {
  id: number;
  produtoId: number;
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
  personalizado?: boolean;
  descricaoPersonalizada?: string;
}

export interface Pedido {
  id: number;
  itens: ItemPedido[];
  tipoEntrega: "retirada" | "delivery";
  enderecoEntrega: string;
  distanciaKm?: number;
  valorFrete: number;
  formaPagamento: FormaPagamento;
  valorTotal: number;
  status: StatusPedido;
  statusPagamento: string;
  criadoEm: string;
}

export interface PedidoAdmin extends Pedido {
  cliente: {
    nome: string;
    email: string;
    telefone: string;
  };
}

export interface Mensagem {
  id: number;
  clienteId: number;
  remetente: "cliente" | "atendente";
  texto: string;
  criadoEm: string;
}

export interface ConversaAdmin {
  clienteId: number;
  nomeCliente: string;
  ultimaMensagem: string;
  ultimaEm: string;
  naoLidas: number;
}

export interface ProdutoVendido {
  nome: string;
  quantidade: number;
}

export interface Relatorio {
  faturamentoHoje: number;
  faturamentoMes: number;
  faturamentoAno: number;
  pedidosHoje: number;
  maisVendidos: ProdutoVendido[];
}

export interface Notificacao {
  id: number;
  tipo: string;
  mensagem: string;
  lida: boolean;
  criadoEm: string;
}
