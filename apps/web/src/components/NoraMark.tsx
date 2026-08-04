import { useId } from 'react';

export type NoraState =
  | 'welcome'
  | 'analyzing'
  | 'informing'
  | 'alert'
  | 'success'
  | 'goal-complete';

interface NoraMarkProps {
  size?: number;
  state?: NoraState;
}

// Símbolo da Nora — núcleo orbital, conforme o Documento Técnico de
// Identidade Visual: anel incompleto em faixa espessa (não linha fina),
// esfera central com gradiente (núcleo "glossy") e satélite no vão do
// anel — sem mascote humano/robótico. "state" muda a animação pra
// refletir o que a Nora está "fazendo" (ver lib/noraMessage.ts).
export function NoraMark({ size = 32, state = 'welcome' }: NoraMarkProps) {
  const uid = useId().replace(/:/g, '');
  const coreId = `nora-core-${uid}`;
  const ringId = `nora-ring-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={`nora-mark nora-mark--${state}`}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={coreId} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="var(--color-strong)" />
          <stop offset="100%" stopColor="var(--color-emphasis)" />
        </radialGradient>
        <linearGradient id={ringId} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-strong)" />
          <stop offset="100%" stopColor="var(--color-emphasis)" />
        </linearGradient>
      </defs>

      <circle
        className="nora-mark__halo"
        cx="16"
        cy="16"
        r="14.5"
        fill="none"
        stroke="var(--color-status-warn)"
        strokeWidth="1.5"
      />

      <g className="nora-mark__orbit">
        {/* Anel em faixa espessa, com um vão onde o satélite "encaixa". */}
        <circle
          className="nora-mark__ring"
          cx="16"
          cy="16"
          r="11.5"
          fill="none"
          stroke={`url(#${ringId})`}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray="60 12.2"
          strokeDashoffset="-6"
        />
        <circle className="nora-mark__satellite" cx="24.3" cy="24.3" r="2.6" fill="var(--color-highlight)" />
      </g>

      <circle className="nora-mark__core" cx="15" cy="15" r="6.4" fill={`url(#${coreId})`} />
    </svg>
  );
}
