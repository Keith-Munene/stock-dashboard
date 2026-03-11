

// ── Candle / OHLCV data point ──
export interface OHLCData {
  date: string;       // ISO date string e.g. "2024-01-15"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Same but with a JS Date object (used inside D3 after parsing)
export interface ParsedOHLC extends Omit<OHLCData, 'date'> {
  date: Date;
}

// ── Stock definition (static info) ──
export interface StockDefinition {
  name: string;
  sector: string;
  basePrice: number;
  volatility: number;
}

// ── Live stock data (dynamic, changes with price feed) ──
export interface StockData extends StockDefinition {
  ticker: string;
  price: number;
  prevClose: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  history: OHLCData[];
  lastUpdate: string;
}

// ── Portfolio holding ──
export interface Holding {
  ticker: string;
  shares: number;
  avgCost: number;
}

// ── Price alert ──
export type AlertCondition = 'above' | 'below';

export interface PriceAlert {
  id: number;
  ticker: string;
  condition: AlertCondition;
  targetPrice: number;
  triggered: boolean;
}

// ── News article ──
export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface NewsArticle {
  id: number;
  ticker: string;
  headline: string;
  summary: string;
  source: string;
  sentiment: Sentiment;
  time: string;
  url: string;
}

// ── Global state shape ──
export interface StockState {
  prices: Record<string, StockData>;   // Record<K, V> = object with string keys and StockData values
  watchlist: string[];
  portfolio: Holding[];
  selectedTicker: string;
  alerts: PriceAlert[];
  liveEnabled: boolean;
}

// ── Reducer action types (discriminated union) ──

export type StockAction =
  | { type: 'PRICE_UPDATE'; payload: { ticker: string; price: number; change: number; changePercent: number } }
  | { type: 'SELECT_TICKER'; payload: string }
  | { type: 'ADD_TO_WATCHLIST'; payload: string }
  | { type: 'REMOVE_FROM_WATCHLIST'; payload: string }
  | { type: 'ADD_HOLDING'; payload: { ticker: string; shares: number; avgCost: number } }
  | { type: 'REMOVE_HOLDING'; payload: string }
  | { type: 'ADD_ALERT'; payload: Omit<PriceAlert, 'id' | 'triggered'> }
  | { type: 'REMOVE_ALERT'; payload: number }
  | { type: 'TRIGGER_ALERT'; payload: number }
  | { type: 'TOGGLE_LIVE' };

// ── Context value type ──
export interface StockContextValue extends StockState {
  dispatch: React.Dispatch<StockAction>;
  portfolioValue: number;
  portfolioCost: number;
  portfolioGain: number;
  portfolioGainPct: number;
  allTickers: string[];
}

// ── Chart types ──
export type ChartType = 'line' | 'candle';
export type TimeRange = '1W' | '1M' | '3M';

// ── Tooltip state for D3 chart ──
export interface ChartTooltip {
  x: number;
  y: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isUp: boolean;
}