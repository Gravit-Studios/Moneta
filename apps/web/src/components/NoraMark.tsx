interface NoraMarkProps {
  size?: number;
}

// Símbolo da Nora — balão de conversa formando a letra N, conforme o
// briefing de marca (evitar cifrão/carteira/moeda/gráficos no logotipo;
// explorar "letra N" + "balão de conversa formando um N").
export function NoraMark({ size = 32 }: NoraMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M4 8a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H12l-6 5v-5a4 4 0 0 1-2-3.4V8Z"
        fill="var(--color-emphasis)"
      />
      <path
        d="M11 20V10.5L20 20V10.5"
        stroke="var(--color-on-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
