interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div>
      <h1 className="page-title">{title}</h1>
      <p className="text-muted">Módulo previsto para a Sprint 2 do roadmap — ainda não implementado.</p>
    </div>
  );
}
