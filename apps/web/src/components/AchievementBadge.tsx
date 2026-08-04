interface AchievementBadgeProps {
  label: string;
  unlocked: boolean;
}

// Selo de conquista — círculo com ícone de escudo, dourado quando
// desbloqueado (mesma cor reservada só pra gamificação, ver
// docs/design-system.md), contorno neutro apagado quando ainda não.
export function AchievementBadge({ label, unlocked }: AchievementBadgeProps) {
  return (
    <div className={`achievement-badge${unlocked ? ' is-unlocked' : ''}`}>
      <div className="achievement-badge__seal">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 4.5 6v5.5c0 4.2 2.9 7.4 7.5 9.5 4.6-2.1 7.5-5.3 7.5-9.5V6L12 3Z" />
          {unlocked && <path d="M9 12.2 11.2 14.5 15.5 9.5" />}
        </svg>
      </div>
      <span className="achievement-badge__label">{label}</span>
    </div>
  );
}
