import { get, post, put } from "./apiClient";

export type CurrencyCode = "INR" | "USD";
export type InvestmentType = "STOCK" | "MUTUAL_FUND" | "ETF";
export type TransactionType = "BUY" | "SELL";

export interface Portfolio {
  portfolioId: string;
  name: string;
  currency: CurrencyCode;
}

export interface Holding {
  holdingId: string;
  portfolioId: string;
  name: string;
  symbol: string;
  type: InvestmentType;
  currentPrice: number;
}

export interface HoldingView extends Holding {
  quantity: number;
  averagePrice: number;
  currentValue: number;
}

export interface Transaction {
  transactionId: string;
  holdingId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  value: number;
}

export interface PriceUpdateResult {
  holdingId: string;
  currentPrice: number;
}

export interface PortfolioSummary {
  portfolioId: string;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

export function createPortfolio(name: string, currency: CurrencyCode) {
  return post<Portfolio>("/portfolios", { name, currency });
}

export function listPortfolios() {
  return get<Portfolio[]>("/portfolios");
}

export function addHolding(
  portfolioId: string,
  name: string,
  symbol: string,
  type: InvestmentType
) {
  return post<Holding>(`/portfolios/${portfolioId}/holdings`, {
    name,
    symbol,
    type,
  });
}

export function listHoldings(portfolioId: string) {
  return get<HoldingView[]>(`/portfolios/${portfolioId}/holdings`);
}

export function recordTransaction(
  holdingId: string,
  type: TransactionType,
  quantity: number,
  price: number,
  transactionDate: string
) {
  return post<Transaction>(`/holdings/${holdingId}/transactions`, {
    type,
    quantity,
    price,
    transactionDate,
  });
}

export function updateCurrentPrice(holdingId: string, currentPrice: number) {
  return put<PriceUpdateResult>(`/holdings/${holdingId}/price`, {
    currentPrice,
  });
}

export function getPortfolioSummary(portfolioId: string) {
  return get<PortfolioSummary>(`/portfolios/${portfolioId}/summary`);
}
