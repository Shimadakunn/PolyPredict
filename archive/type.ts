export interface Market {
  id: string;
  question: string;
  startDate: Date;
  endDate: Date;
  volume: number;
  liquidity: number;
  eventId?: string;
  eventTitle?: string;
}

export interface MarketAPIResponse {
  id: string;
  question: string;
  description: string;
  startDate: string;
  endDate: string;
  closed: boolean;
  active: boolean;
  volume: string;
  liquidity: string;
}

export interface EventAPIResponse {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  closed: boolean;
  markets: MarketAPIResponse[];
}
