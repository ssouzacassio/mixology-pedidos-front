"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, DrinkSalvo, Ingrediente } from "@/lib/api";
import { useCarrinho } from "@/contexts/CarrinhoContexto";
import { useAutenticacao } from "@/contexts/AutenticacaoContexto";

const MAX_MIXERS = 3;

export default function PaginaMonteSeuDrink() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [drinksSalvos, setDrinksSalvos] = useState<DrinkSalvo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [base, setBase] = useState<Ingrediente | undefined>();
  const [mixers, setMixers] = useState<Ingrediente[]>([]);
  const [extra, setExtra] = useState<Ingrediente | undefined>();
  const [nomeDrink, setNomeDrink] = useState("");
  const [adicionado, setAdicionado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSalvar, setMensagemSalvar] = useState("");
  const { adicionarPersonalizado } = useCarrinho();
  const { token } = useAutenticacao();
  const router = useRouter();

  useEffect(() => {
    api
      .listarIngredientes()
      .then(setIngredientes)
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    if (token) api.listarDrinksSalvos(token).then(setDrinksSalvos).catch(() => {});
  }, [token]);

  const escolhidos = [base, ...mixers, extra].filter(Boolean) as Ingrediente[];
  const total = escolhidos.reduce((soma, i) => soma + i.preco, 0);
  const completo = !!base && mixers.length > 0 && !!extra;

  function alternarMixer(ingrediente: Ingrediente) {
    setAdicionado(false);
    setMixers((atual) => {
      const jaEscolhido = atual.some((i) => i.id === ingrediente.id);
      if (jaEscolhido) return atual.filter((i) => i.id !== ingrediente.id);
      if (atual.length >= MAX_MIXERS) return atual;
      return [...atual, ingrediente];
    });
  }

  function carregarSalvo(drink: DrinkSalvo) {
    setBase(drink.ingredientes.find((i) => i.categoria === "base"));
    setMixers(drink.ingredientes.filter((i) => i.categoria === "mixer"));
    setExtra(drink.ingredientes.find((i) => i.categoria === "extra"));
    setNomeDrink(drink.nome);
    setAdicionado(false);
  }

  async function removerSalvo(id: number, evento: React.MouseEvent) {
    evento.stopPropagation();
    if (!token) return;
    setDrinksSalvos((atual) => atual.filter((d) => d.id !== id));
    await api.removerDrinkSalvo(token, id).catch(() => {});
  }

  function adicionarAoCarrinho() {
    if (!completo) return;
    adicionarPersonalizado(escolhidos, nomeDrink.trim() || undefined);
    setAdicionado(true);
  }

  async function salvarDrink() {
    if (!completo || !token || !nomeDrink.trim()) return;
    setSalvando(true);
    setMensagemSalvar("");
    try {
      const novo = await api.criarDrinkSalvo(token, {
        nome: nomeDrink.trim(),
        ingredientesIds: escolhidos.map((i) => i.id),
      });
      setDrinksSalvos((atual) => [novo, ...atual]);
      setMensagemSalvar("Salvo no seu perfil!");
    } catch (e) {
      setMensagemSalvar(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <section className="bg-zinc-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <h1 className="text-3xl font-semibold tracking-tight">Monte seu drink</h1>
          <p className="mt-1 text-zinc-400">Escolha uma base, até 3 frutas de mixer e um extra — e dê um nome só seu.</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {carregando && <p className="text-zinc-500">Carregando ingredientes...</p>}

        {drinksSalvos.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-marca-vermelho">
              Seus drinks salvos
            </h2>
            <div className="flex flex-wrap gap-2">
              {drinksSalvos.map((drink) => (
                <button
                  key={drink.id}
                  onClick={() => carregarSalvo(drink)}
                  className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:border-marca-vermelho hover:text-marca-vermelho"
                >
                  {drink.nome}
                  <span onClick={(e) => removerSalvo(drink.id, e)} className="text-zinc-400 hover:text-marca-vermelho">
                    ×
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-marca-vermelho">Base</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {ingredientes
              .filter((i) => i.categoria === "base")
              .map((ingrediente) => (
                <BotaoIngrediente
                  key={ingrediente.id}
                  ingrediente={ingrediente}
                  selecionado={base?.id === ingrediente.id}
                  onClick={() => {
                    setBase(ingrediente);
                    setAdicionado(false);
                  }}
                />
              ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-marca-vermelho">
            Mixer (frutas) <span className="font-normal normal-case text-zinc-400">— escolha até 3, selecionadas: {mixers.length}/{MAX_MIXERS}</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {ingredientes
              .filter((i) => i.categoria === "mixer")
              .map((ingrediente) => (
                <BotaoIngrediente
                  key={ingrediente.id}
                  ingrediente={ingrediente}
                  selecionado={mixers.some((i) => i.id === ingrediente.id)}
                  desabilitado={mixers.length >= MAX_MIXERS && !mixers.some((i) => i.id === ingrediente.id)}
                  onClick={() => alternarMixer(ingrediente)}
                />
              ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-marca-vermelho">Extra</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {ingredientes
              .filter((i) => i.categoria === "extra")
              .map((ingrediente) => (
                <BotaoIngrediente
                  key={ingrediente.id}
                  ingrediente={ingrediente}
                  selecionado={extra?.id === ingrediente.id}
                  onClick={() => {
                    setExtra(ingrediente);
                    setAdicionado(false);
                  }}
                />
              ))}
          </div>
        </section>

        <div className="sticky bottom-4 mt-6 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg">
          <input
            type="text"
            value={nomeDrink}
            onChange={(e) => setNomeDrink(e.target.value)}
            placeholder="Dê um nome pro seu drink (opcional)"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-marca-vermelho"
          />

          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span className="text-marca-vermelho">R$ {total.toFixed(2).replace(".", ",")}</span>
          </div>

          {adicionado ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">Adicionado ao carrinho!</p>
              <button onClick={() => router.push("/carrinho")} className="botao-primario px-4 py-2 text-sm">
                Ver carrinho
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={adicionarAoCarrinho}
                disabled={!completo}
                className="botao-primario flex-1 py-2 disabled:opacity-40"
              >
                {completo ? "Adicionar ao carrinho" : "Escolha base, ao menos 1 fruta e um extra"}
              </button>
              {token && (
                <button
                  onClick={salvarDrink}
                  disabled={!completo || !nomeDrink.trim() || salvando}
                  title={!nomeDrink.trim() ? "Dê um nome pra poder salvar" : undefined}
                  className="rounded-md border border-marca-vermelho px-4 py-2 text-sm font-medium text-marca-vermelho hover:bg-marca-vermelho/5 disabled:opacity-40"
                >
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              )}
            </div>
          )}
          {mensagemSalvar && <p className="text-sm text-zinc-500">{mensagemSalvar}</p>}
        </div>
      </div>
    </div>
  );
}

function BotaoIngrediente({
  ingrediente,
  selecionado,
  desabilitado,
  onClick,
}: {
  ingrediente: Ingrediente;
  selecionado: boolean;
  desabilitado?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={desabilitado}
      className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        selecionado ? "border-marca-vermelho bg-marca-vermelho/5" : "border-zinc-200 bg-white hover:border-zinc-300"
      }`}
    >
      <span className={selecionado ? "font-medium text-marca-vermelho" : "text-zinc-700"}>{ingrediente.nome}</span>
      <span className="text-xs text-zinc-400">
        {ingrediente.preco > 0 ? `R$ ${ingrediente.preco.toFixed(2).replace(".", ",")}` : "grátis"}
      </span>
    </button>
  );
}
