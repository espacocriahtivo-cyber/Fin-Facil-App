import { TransactionContext } from '../types';

export interface CategoryDefinition {
  id: string;
  name: string;
  context: TransactionContext;
  iconName: string;
  color: string;
  defaultType: 'income' | 'expense';
}

export const CATEGORIES: CategoryDefinition[] = [
  // PESSOAL - RECEITAS
  { id: 'p_salario', name: 'Salário Principal', context: 'personal', iconName: 'Briefcase', color: '#10B981', defaultType: 'income' },
  { id: 'p_renda_extra', name: 'Renda Extra & Bicos', context: 'personal', iconName: 'Sparkles', color: '#06B6D4', defaultType: 'income' },
  { id: 'p_investimentos', name: 'Rendimentos & Dividendos', context: 'personal', iconName: 'TrendingUp', color: '#3B82F6', defaultType: 'income' },
  { id: 'p_outras_receitas', name: 'Outras Entradas', context: 'personal', iconName: 'ArrowDownLeft', color: '#8B5CF6', defaultType: 'income' },

  // PESSOAL - DESPESAS
  { id: 'p_alimentacao', name: 'Alimentação & Mercado', context: 'personal', iconName: 'ShoppingCart', color: '#F59E0B', defaultType: 'expense' },
  { id: 'p_moradia', name: 'Moradia (Aluguel, Luz, Água)', context: 'personal', iconName: 'Home', color: '#EF4444', defaultType: 'expense' },
  { id: 'p_transporte', name: 'Transporte & Combustível', context: 'personal', iconName: 'Car', color: '#6366F1', defaultType: 'expense' },
  { id: 'p_saude', name: 'Saúde & Farmácia', context: 'personal', iconName: 'HeartPulse', color: '#EC4899', defaultType: 'expense' },
  { id: 'p_lazer', name: 'Lazer & Restaurantes', context: 'personal', iconName: 'Coffee', color: '#14B8A6', defaultType: 'expense' },
  { id: 'p_educacao', name: 'Educação & Livros', context: 'personal', iconName: 'GraduationCap', color: '#8B5CF6', defaultType: 'expense' },
  { id: 'p_outras_despesas', name: 'Outras Despesas Pessoais', context: 'personal', iconName: 'Receipt', color: '#64748B', defaultType: 'expense' },

  // MICRO NEGÓCIO - RECEITAS
  { id: 'b_vendas', name: 'Venda de Produtos', context: 'business', iconName: 'ShoppingBag', color: '#10B981', defaultType: 'income' },
  { id: 'b_servicos', name: 'Prestação de Serviços', context: 'business', iconName: 'Wrench', color: '#059669', defaultType: 'income' },
  { id: 'b_contratos', name: 'Contratos & Recorrência', context: 'business', iconName: 'FileCheck', color: '#0284C7', defaultType: 'income' },
  { id: 'b_outras_entradas', name: 'Outras Entradas PJ', context: 'business', iconName: 'BadgePercent', color: '#6366F1', defaultType: 'income' },

  // MICRO NEGÓCIO - CUSTOS E DESPESAS
  { id: 'b_cmv', name: 'Custos de Mercadoria / Insumos', context: 'business', iconName: 'Boxes', color: '#EA580C', defaultType: 'expense' },
  { id: 'b_fornecedores', name: 'Fornecedores & Parceiros', context: 'business', iconName: 'Truck', color: '#DC2626', defaultType: 'expense' },
  { id: 'b_impostos', name: 'Impostos (DAS-MEI / Tributos)', context: 'business', iconName: 'FileText', color: '#B91C1C', defaultType: 'expense' },
  { id: 'b_pro_labore', name: 'Pró-Labore (Retirada Sócios)', context: 'business', iconName: 'Coins', color: '#7C3AED', defaultType: 'expense' },
  { id: 'b_marketing', name: 'Marketing & Anúncios', context: 'business', iconName: 'Megaphone', color: '#D946EF', defaultType: 'expense' },
  { id: 'b_ferramentas', name: 'Softwares & Ferramentas', context: 'business', iconName: 'Laptop', color: '#2563EB', defaultType: 'expense' },
  { id: 'b_espaco', name: 'Aluguel Comercial / Espaço', context: 'business', iconName: 'Building', color: '#475569', defaultType: 'expense' },
  { id: 'b_outros_custos', name: 'Outros Custos Operacionais', context: 'business', iconName: 'ReceiptText', color: '#64748B', defaultType: 'expense' },
];

export const PAYMENT_METHODS = [
  'Pix',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Dinheiro',
  'Boleto Bancário',
  'Transferência (TED)',
  'Outro',
];
