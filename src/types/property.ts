export type PropertyStatus = "in_portfolio" | "analyzing" | "rejected" | "from_market";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type AIRecommendation = "BUY" | "HOLD" | "REJECT";

export type Property = {
  id: string;
  name: string;
  address: string;
  district: string;
  type: string;
  status: PropertyStatus;
  acquired_date: string | null;
  acquired_price_hkd: number | null;
  current_valuation_hkd: number | null;
  rooms: number;
  size_sqft: number;
  monthly_rent_hkd: number;
  gross_yield_pct: number;
  net_yield_pct: number;
  ai_score: number;
  ai_recommendation: AIRecommendation;
  ai_growth_forecast_pct: number;
  risk_level: RiskLevel;
  ai_buy_reasons: string[];
  ai_concerns: string[];
  ai_rejected_alternatives: { description: string; reason: string }[];
  tenants_current: number;
  tenants_max: number;
  images: string[];
  features: string[];
  /** When status is from_market, link to listing on Squarefoot */
  listing_url?: string;
};

export type Portfolio = {
  total_aum_hkd: number;
  properties_count: number;
  active_properties: number;
  analyzing_properties: number;
  rejected_properties?: number;
  total_tokens_outstanding: number;
  token_nav_hkd: number;
  token_nav_change_pct?: number;
  avg_portfolio_yield_pct: number;
  avg_ai_score: number;
  total_investors: number;
  quarterly_revenue_hkd: number;
  investor_quarterly_payout_hkd?: number;
  last_nav_update: string;
  inception_date?: string;
};
