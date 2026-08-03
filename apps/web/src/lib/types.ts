export type CategoryType = 'income' | 'expense';
export type Recurrence = 'none' | 'weekly' | 'monthly' | 'yearly';
export type PaymentMethod = 'cash' | 'debit' | 'credit_card' | 'pix' | 'bank_transfer' | 'other';
export type AlertType =
  | 'bill_due_tomorrow'
  | 'bill_overdue'
  | 'card_closing_today'
  | 'goal_overdue'
  | 'goal_completed'
  | 'insufficient_balance'
  | 'income_expected'
  | 'installment_completed';

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: CategoryType;
  is_default: boolean;
  created_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  value: number;
  date: string;
  recurrence: Recurrence;
  notes: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  card_id: string | null;
  recurring_bill_id: string | null;
  installment_id: string | null;
  installment_seq: number | null;
  name: string;
  value: number;
  due_date: string;
  paid: boolean;
  payment_method: PaymentMethod;
  cost_center: string | null;
  notes: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_value: number;
  current_value: number;
  target_date: string;
  created_at: string;
}
