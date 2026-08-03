export function currency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function shortDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('pt-BR');
}
