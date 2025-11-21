export enum TradeType {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export enum TradeStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING'
}

export interface Trade {
  id: string;
  ticker: string;
  entryDate: string; // ISO Date string YYYY-MM-DD
  exitDate?: string;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  type: TradeType;
  status: TradeStatus;
  pnl?: number; // Profit and Loss
  notes?: string;
  setup?: string;
  screenshotUrl?: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  trades: Trade[];
  dailyPnL: number;
}

export interface ViewState {
  currentView: 'DASHBOARD' | 'CALENDAR' | 'STATS' | 'SETTINGS';
}