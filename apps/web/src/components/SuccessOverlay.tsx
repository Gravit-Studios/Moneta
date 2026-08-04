import { useEffect } from 'react';

interface SuccessOverlayProps {
  message: string;
  onDone: () => void;
}

// Tela de transição reutilizável — aparece depois de salvar algo (despesa,
// receita, meta, cartão) como um momento de confirmação, não só um toast
// silencioso. Fecha sozinha depois de um tempo, ou no toque do usuário.
export function SuccessOverlay({ message, onDone }: SuccessOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1600);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="success-overlay" role="status" onClick={onDone}>
      <div className="success-burst">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5 10 17.5 19 7" />
        </svg>
      </div>
      <p className="success-message">{message}</p>
    </div>
  );
}
