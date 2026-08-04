const PALETTE_SIZE = 8;

// Hash simples e estável: a mesma categoria sempre cai na mesma cor da
// paleta (--color-cat-1..8, ver _colors.scss), sem precisar guardar a cor
// no banco — deriva do id, que nunca muda.
export function categoryColorVar(categoryId: string): string {
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = (hash * 31 + categoryId.charCodeAt(i)) >>> 0;
  }
  const index = (hash % PALETTE_SIZE) + 1;
  return `var(--color-cat-${index})`;
}
