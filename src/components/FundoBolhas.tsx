const BOLHAS = [
  { esquerda: "6%", tamanho: 18, duracao: 13, atraso: 0, cor: "rgba(240, 154, 17, 0.25)" },
  { esquerda: "15%", tamanho: 10, duracao: 9, atraso: 2, cor: "rgba(125, 170, 177, 0.35)" },
  { esquerda: "28%", tamanho: 26, duracao: 16, atraso: 5, cor: "rgba(160, 39, 36, 0.18)" },
  { esquerda: "42%", tamanho: 8, duracao: 8, atraso: 1, cor: "rgba(240, 154, 17, 0.3)" },
  { esquerda: "55%", tamanho: 14, duracao: 11, atraso: 4, cor: "rgba(125, 170, 177, 0.3)" },
  { esquerda: "68%", tamanho: 22, duracao: 15, atraso: 0.5, cor: "rgba(240, 154, 17, 0.2)" },
  { esquerda: "78%", tamanho: 9, duracao: 9, atraso: 3, cor: "rgba(160, 39, 36, 0.22)" },
  { esquerda: "88%", tamanho: 16, duracao: 12, atraso: 6, cor: "rgba(125, 170, 177, 0.28)" },
  { esquerda: "94%", tamanho: 12, duracao: 10, atraso: 1.5, cor: "rgba(240, 154, 17, 0.28)" },
];

export default function FundoBolhas() {
  return (
    <>
      {BOLHAS.map((bolha, indice) => (
        <span
          key={indice}
          className="bolha"
          style={{
            left: bolha.esquerda,
            width: bolha.tamanho,
            height: bolha.tamanho,
            background: bolha.cor,
            animationDuration: `${bolha.duracao}s`,
            animationDelay: `${bolha.atraso}s`,
          }}
        />
      ))}
    </>
  );
}
