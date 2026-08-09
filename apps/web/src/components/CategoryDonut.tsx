interface DonutSlice {
  colorVar: string;
  value: number;
}

interface CategoryDonutProps {
  slices: DonutSlice[];
  centerLabel: string;
  centerValue: string;
  size?: number;
}

// Donut de categorias — "destaque" pedido pelo usuário (referências de
// fintech), mantendo a estética da Nora: sem preenchimento sólido cinza,
// gap entre fatias (respiro), rótulo central com o total, cores vindas da
// paleta de categoria já existente (--color-cat-1..8).
export function CategoryDonut({ slices, centerLabel, centerValue, size = 132 }: CategoryDonutProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const gap = 3; // graus de respiro entre fatias
  let offsetDeg = -90;

  return (
    <div className="category-donut" style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-subtle)" strokeWidth="14" />
        {total > 0 &&
          slices.map((slice, i) => {
            const pct = slice.value / total;
            const arcDeg = pct * 360 - gap;
            const dash = (arcDeg / 360) * circumference;
            const rotate = offsetDeg;
            offsetDeg += pct * 360;
            return (
              <circle
                key={i}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={slice.colorVar}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${Math.max(dash, 0)} ${circumference}`}
                transform={`rotate(${rotate} 60 60)`}
                className="bar-fill"
              />
            );
          })}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div className="text-muted" style={{ fontSize: 11 }}>{centerLabel}</div>
        <div style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontWeight: 700, fontSize: 15 }}>
          {centerValue}
        </div>
      </div>
    </div>
  );
}
