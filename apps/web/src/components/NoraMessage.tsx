import { NoraMark } from './NoraMark';

interface NoraMessageProps {
  message: string;
}

export function NoraMessage({ message }: NoraMessageProps) {
  return (
    <div className="nora-message">
      <NoraMark size={36} />
      <div className="nora-message__bubble">{message}</div>
    </div>
  );
}
