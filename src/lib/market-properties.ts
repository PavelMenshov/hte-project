import { loadDistrictCache } from "@/lib/scraper";
import type { HKDistrict } from "@/lib/scraper/types";
import type { Property } from "@/types/property";
import { loadSquarefootFromCsv } from "@/lib/squarefoot-csv";

const DISTRICTS: HKDistrict[] = ["Kwun Tong", "Mong Kok", "Sha Tin", "Tuen Mun"];
const MAX_PER_DISTRICT = 8;

const ESTATE_NAME_EN: Record<string, string> = {
  "觀塘 凱滙": "Grand Central",
  "凱滙 第一期": "Grand Central Phase 1",
  "凱滙 第二期": "Grand Central Phase 2",
  "凱滙": "Grand Central",
  "源成中心": "Yuen Shing Centre",
  "淘大花園": "Amoy Gardens",
  "德福花園": "Telford Gardens",
  "麗港城": "Laguna City",
  "匯景花園": "Sceneway Garden",
  "翔龍灣": "Grand Waterfront",
  "觀塘花園大廈": "Kwun Tong Garden Estate",
  "凱旋門": "The Arch",
  "天璽": "The Cullinan",
  "君臨天下": "The Harbourside",
  "海名軒": "The Harbourfront Landmark",
  "維港灣": "Island Harbourview",
  "浪澄灣": "The Long Beach",
  "曼克頓山": "Manhattan Hill",
  "美孚新邨": "Mei Foo Sun Chuen",
  "又一居": "Parc Oasis",
  "半島豪庭": "Royal Peninsula",
  "港景峰": "Victoria Towers",
  "黃埔花園": "Whampoa Garden",
  "名鑄": "The Masterpiece",
  "沙田第一城": "City One Shatin",
  "名城": "Festival City",
  "富豪花園": "Belair Gardens",
  "帝堡城": "Castello",
  "御龍山": "The Palazzo",
  "駿景園": "Royal Ascot",
  "聽濤雅苑": "Vista Paradiso",
  "翠擁華庭": "Monte Vista",
  "銀湖·天峰": "Lake Silver",
  "迎海": "Double Cove",
  "新港城": "Sunshine City",
  "雅典居": "Villa Athena",
  "文禮閣": "Man Lai Court",
  "柏傲莊": "The Pavilia Farm",
  "河畔花園": "Garden Rivera",
  "偉華中心": "Wai Wah Centre",
  "沙田中心": "Sha Tin Centre",
  "好運中心": "Lucky Plaza",
  "沙田廣場": "Sha Tin Plaza",
  "世界花園": "Worldwide Gardens",
  "翠湖花園": "Garden Vista",
  "金輝花園": "Glamour Garden",
  "金獅花園": "Golden Lion Gardens",
  "金禧花園": "Grandeur Garden",
  "嘉御山": "The Great Hill",
  "愉景花園": "Greenview Garden",
  "瑞峰花園": "Julimount Garden",
  "湖景花園": "Lakeview Gardens",
  "聚龍居": "Parc Royale",
  "壹號雲頂": "Peak One",
  "曉翠山莊": "Pristine Villa",
  "沙田嶺": "Sha Tin Heights",
  "邁亞美海灣": "Miami Beach Towers",
  "海翠花園": "Pierhead Garden",
  "新屯門中心": "Sun Tuen Mun Centre",
  "大興花園": "Tai Hing Gardens",
  "屯門市廣場": "Tuen Mun Town Plaza",
  "愛琴海岸": "Aegean Coast",
  "星堤": "Avignon",
  "滿名山": "The Bloomsway",
  "香港黃金海岸": "Hong Kong Gold Coast",
  "上源": "Le Pont",
  "春和海景花園": "Spring Seaview Terrace",
  "荃威花園": "Allway Gardens",
  "灣景花園": "Bayview Garden",
  "麗城花園": "Belvedere Garden",
  "環宇海灣": "City Point",
  "愉景新城": "Discovery Park",
  "御凱": "The Dynasty",
  "綠楊新邨": "Luk Yeung Sun Chuen",
  "海濱花園": "Riviera Gardens",
  "韻濤居": "Serenade Cove",
  "荃景花園": "Tsuen King Garden",
  "荃灣中心": "Tsuen Wan Centre",
  "萬景峯": "Vision City",
  "海灣花園": "Waterside Plaza",
  "翠怡花園": "Greenfield Garden",
  "美景花園": "Mayfair Gardens",
  "藍澄灣": "Rambler Crest",
  "盈翠半島": "Tierra Verde",
  "青怡花園": "Tsing Yi Garden",
  "灝景灣": "Villa Esplanada",
  "華景山莊": "Wonderland Villas",
  "君傲灣": "The Grandiose",
  "日出康城": "LOHAS Park",
  "峻瀅": "The Beaumount",
  "海茵莊園": "Manor Hill",
  "維景灣畔": "Ocean Shores",
  "都會駅": "Metro Town",
  "將軍澳廣場": "Tseung Kwan O Plaza",
  "將軍澳中心": "Park Central",
  "天晉": "The Wings",
  "帝景灣": "Corinthia by the Sea",
  "新都城": "Metro City",
  "慧安園": "Well On Garden",
  "富麗花園": "Finery Park",
  "怡心園": "Serenity Place",
  "旭輝臺": "Radiant Towers",
  "東港城": "East Point City",
  "新寶城": "La Cite Noble",
  "蔚藍灣畔": "Residence Oasis",
  "南豐廣場": "Nan Fung Plaza",
  "海悅豪園": "Maritime Bay",
  "海翩匯": "The Papillons",
  "藍塘傲": "Alto Residences",
  "嘉悅": "Twin Peaks",
  "栢慧豪園": "Central Park Towers",
  "嘉湖山莊": "Kingswood Villas",
  "新元朗中心": "Sun Yuen Long Centre",
  "慧景軒": "Vianni Cove",
  "新時代廣場": "YOHO Town",
  "貝沙灣": "Bel-Air",
  "寶翠園": "The Belcher's",
  "比華利山": "Beverly Hill",
  "城市花園": "City Garden",
  "嘉亨灣": "Grand Promenade",
  "杏花邨": "Heng Fa Chuen",
  "康怡花園": "Kornhill",
  "南豐新邨": "Nam Fung Sun Chuen",
  "海怡半島": "South Horizons",
  "太古城": "Taikoo Shing",
};

function displayNameFromAddress(address: string, district: string, fallbackId: string): string {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  const first = parts[0] ?? "";
  const looksLikeUnit = /^\d+\s*\d*$/.test(first) || (first.length <= 4 && /[\d\s]/.test(first));
  if (!looksLikeUnit && first.length > 2 && !/[\u4e00-\u9fa5]/.test(first)) return first;
  for (const part of parts) {
    for (const [cn, en] of Object.entries(ESTATE_NAME_EN)) {
      if (part.includes(cn)) return en;
    }
  }
  return `${district} listing ${fallbackId}`;
}

function listingToProperty(
  listing: {
    id: string;
    address: string;
    district: HKDistrict;
    price_hkd: number;
    size_sqft: number;
    price_per_sqft_hkd: number;
    rooms: number;
    monthly_rent_hkd: number | null;
    gross_yield_pct: number | null;
    listing_status: string;
    url: string;
    image_url?: string;
  },
  districtAvgGrossYieldPct: number = 0
): Property {
  const rent = listing.monthly_rent_hkd ?? 0;
  const yieldPct =
    listing.gross_yield_pct ??
    (listing.price_hkd > 0 && rent > 0 ? (rent * 12) / listing.price_hkd * 100 : 0);
  const netYield =
    yieldPct > 0 ? yieldPct * 0.85 : districtAvgGrossYieldPct > 0 ? districtAvgGrossYieldPct * 0.85 : 0;
  const name = displayNameFromAddress(listing.address, listing.district, listing.id.replace(/^market-/, ""));
  return {
    id: "market-" + listing.id,
    name,
    address: listing.address,
    district: listing.district,
    type: "residential",
    status: "from_market",
    acquired_date: null,
    acquired_price_hkd: null,
    current_valuation_hkd: listing.price_hkd,
    rooms: listing.rooms,
    size_sqft: listing.size_sqft,
    monthly_rent_hkd: rent,
    gross_yield_pct: yieldPct || districtAvgGrossYieldPct,
    net_yield_pct: netYield,
    ai_score: 0,
    ai_recommendation: "HOLD",
    ai_growth_forecast_pct: 0,
    risk_level: "MEDIUM",
    ai_buy_reasons: [],
    ai_concerns: [],
    ai_rejected_alternatives: [],
    tenants_current: 0,
    tenants_max: listing.rooms,
    images: listing.image_url ? [listing.image_url] : [],
    features: [],
    listing_url: listing.url || undefined,
  };
}

export async function getMarketProperties(): Promise<Property[]> {
  const all: Property[] = [];
  for (const district of DISTRICTS) {
    const cache = await loadDistrictCache(district);
    if (!cache?.listings.length) continue;
    const districtAvgYield = cache.market_stats?.avg_gross_yield_pct ?? 0;
    for (const listing of cache.listings.slice(0, MAX_PER_DISTRICT)) {
      all.push(listingToProperty(listing, districtAvgYield));
    }
  }
  const squarefootListings = loadSquarefootFromCsv();
  all.push(...squarefootListings);
  return all;
}

export async function getMarketProperty(id: string): Promise<Property | null> {
  const all = await getMarketProperties();
  return all.find((p) => p.id === id) ?? null;
}
