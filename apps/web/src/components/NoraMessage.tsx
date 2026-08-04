import { NoraMark, NoraState } from './NoraMark';

interface NoraMessageProps {
  message: string;
  state?: NoraState;
}

export function NoraMessage({ message, state }: NoraMessageProps) {
  return (
    <div className="nora-message">
      <NoraMark size={36} state={state} />
      <div className="nora-message__bubble">{message}</div>
    </div>
  );
}
