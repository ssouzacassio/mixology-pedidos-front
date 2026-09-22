let contexto: AudioContext | null = null;

function obterContexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!contexto) {
    const Construtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    contexto = new Construtor();
  }
  return contexto;
}

// Precisa ser chamado a partir de uma interação do usuário (clique) pra
// desbloquear o áudio no navegador antes do primeiro pedido chegar.
export function prepararSom() {
  const ctx = obterContexto();
  ctx?.resume();
}

function apitar(ctx: AudioContext, frequencia: number, inicioEm: number, duracao: number) {
  const oscilador = ctx.createOscillator();
  const ganho = ctx.createGain();
  oscilador.connect(ganho);
  ganho.connect(ctx.destination);
  oscilador.type = "sine";
  oscilador.frequency.value = frequencia;

  const inicio = ctx.currentTime + inicioEm;
  ganho.gain.setValueAtTime(0.0001, inicio);
  ganho.gain.exponentialRampToValueAtTime(0.3, inicio + 0.02);
  ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);

  oscilador.start(inicio);
  oscilador.stop(inicio + duracao + 0.02);
}

// Som de "novo pedido": dois beeps curtos e agudos.
export function tocarNotificacaoPedido() {
  const ctx = obterContexto();
  if (!ctx) return;
  apitar(ctx, 880, 0, 0.15);
  apitar(ctx, 1100, 0.18, 0.18);
}
