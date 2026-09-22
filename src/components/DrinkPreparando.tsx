export default function DrinkPreparando() {
  return (
    <div className="flex items-center gap-2" title="Seu drink está sendo preparado">
      <svg viewBox="0 0 40 40" className="h-8 w-8 animar-coquetel">
        <path
          d="M8 6h24l-10 14v12h5a1 1 0 0 1 0 2H13a1 1 0 0 1 0-2h5V20L8 6z"
          fill="none"
          stroke="var(--color-marca-vermelho)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <clipPath id="copoClip">
          <path d="M9.5 8h21l-8.5 12.2V19H18v1.2L9.5 8z" />
        </clipPath>
        <g clipPath="url(#copoClip)">
          <rect x="8" y="14" width="24" height="10" fill="var(--color-marca-laranja)" className="animar-liquido" />
          <circle cx="17" cy="17" r="1" fill="white" opacity="0.7" className="animar-bolha-copo" style={{ animationDelay: "0s" }} />
          <circle cx="21" cy="19" r="0.8" fill="white" opacity="0.7" className="animar-bolha-copo" style={{ animationDelay: "0.4s" }} />
          <circle cx="24" cy="16" r="0.9" fill="white" opacity="0.7" className="animar-bolha-copo" style={{ animationDelay: "0.8s" }} />
        </g>
      </svg>
      <span className="text-sm font-medium text-marca-laranja">Preparando seu drink...</span>
    </div>
  );
}
