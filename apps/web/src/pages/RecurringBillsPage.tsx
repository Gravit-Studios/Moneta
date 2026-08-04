import { FormEvent, useEffect, useState } from 'react';
import { listCategories } from '../lib/categories';
import { currency } from '../lib/format';
import {
  createRecurringBill,
  deleteRecurringBill,
  generateExpenseForCurrentMonth,
  listRecurringBills,
  RecurringBill,
} from '../lib/recurringBills';
import { Category, PaymentMethod } from '../lib/types';

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: 'Dinheiro',
  debit: 'Débito',
  credit_card: 'Cartão de crédito',
  pix: 'Pix',
  bank_transfer: 'Transferência',
  other: 'Outro',
};

export function RecurringBillsPage() {
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dueDay, setDueDay] = useState('10');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  async function refresh() {
    setLoading(true);
    try {
      const [billList, categoryList] = await Promise.all([listRecurringBills(), listCategories('expense')]);
      setBills(billList);
      setCategories(categoryList);
      if (!categoryId && categoryList.length > 0) setCategoryId(categoryList[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contas recorrentes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createRecurringBill({ name, value: Number(value), categoryId, dueDay: Number(dueDay), paymentMethod });
      setName('');
      setValue('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta recorrente.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteRecurringBill(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir.');
    }
  }

  async function handleGenerate(bill: RecurringBill) {
    setError(null);
    setNotice(null);
    try {
      await generateExpenseForCurrentMonth(bill);
      setNotice(`Lançamento de "${bill.name}" gerado em Despesas.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível gerar o lançamento.');
    }
  }

  function categoryName(id: string) {
    return categories.find((c) => c.id === id)?.name ?? '—';
  }

  return (
    <div>
      <h1 className="page-title">Contas recorrentes</h1>
      <p className="text-muted" style={{ marginBottom: 16 }}>
        Geração automática mensal ainda é manual nesta versão (clique em "Gerar lançamento") — a geração
        agendada por cron é uma pendência de infraestrutura, registrada no roadmap.
      </p>

      <form className="profile-section" onSubmit={handleSubmit}>
        <h2>Nova conta recorrente</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="form-field" style={{ flex: 2, minWidth: 160 }}>
            <label htmlFor="bill-name">Nome</label>
            <input id="bill-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 120 }}>
            <label htmlFor="bill-value">Valor</label>
            <input id="bill-value" type="number" step="0.01" min="0" value={value} onChange={(e) => setValue(e.target.value)} required />
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 100 }}>
            <label htmlFor="bill-day">Dia do vencimento</label>
            <input id="bill-day" type="number" min="1" max="31" value={dueDay} onChange={(e) => setDueDay(e.target.value)} required />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
            <label htmlFor="bill-category">Categoria</label>
            <select
              id="bill-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
            <label htmlFor="bill-payment">Forma de pagamento</label>
            <select
              id="bill-payment"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              {Object.entries(PAYMENT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <button className="btn btn--primary" type="submit">Adicionar</button>
        </div>
        {error && <p style={{ color: 'var(--color-status-danger)', marginTop: 8 }}>{error}</p>}
        {notice && <p style={{ color: 'var(--color-status-done)', marginTop: 8 }}>{notice}</p>}
      </form>

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : bills.length === 0 ? (
        <p className="text-muted">Nenhuma conta recorrente cadastrada ainda.</p>
      ) : (
        <div className="list-card">
          {bills.map((bill) => (
            <div className="list-row" key={bill.id}>
              <span>
                {bill.name} <span className="text-muted">· {categoryName(bill.category_id)} · dia {bill.due_day}</span>
              </span>
              <span className="list-row__value">{currency(bill.value)}</span>
              <button className="btn btn--ghost" onClick={() => handleGenerate(bill)}>Gerar lançamento</button>
              <button className="btn btn--ghost" onClick={() => handleDelete(bill.id)}>Excluir</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
