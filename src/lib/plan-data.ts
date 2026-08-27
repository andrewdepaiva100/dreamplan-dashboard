export type PlanState = {
  budget: {
    venue: number;
    honeymoon: number;
    dress: number;
    desserts: number;
    makeup: number;
  };
  funds: {
    checking: number;
    checkingAcct: string;
    savings: number;
    savingsAcct: string;
    herParents: number;
    yourParents: number;
  };
  monthly: {
    spotify: number;
    cinemark: number;
    phone: number;
    health: number;
    life: number;
    groceries: number;
    lifestyle: number;
  };
  lease: {
    saved: number;
    goal: number;
    rent: number;
    depositLastMonth: number;
  };
  milestones: {
    leaseDate: string;
    leaseAmount: number;
    honeymoonAmount: number;
    weddingAmount: number;
    furnishingDate: string;
    furnishingLow: number;
    furnishingHigh: number;
  };
  furnishing: {
    key: string;
    room: string;
    detail: string;
    conservative: number;
    mid: number;
  }[];
  emergency: {
    goal: number;
    date: string;
  };
  log: { id: string; label: string; from: string; to: string; at: number }[];
  comments: { id: string; author: string; text: string; at: number }[];
};

export const DEFAULT_PLAN: PlanState = {
  budget: {
    venue: 24000,
    honeymoon: 8000,
    dress: 1000,
    desserts: 1000,
    makeup: 1000,
  },
  funds: {
    checking: 20146,
    checkingAcct: "****3574",
    savings: 8013.05,
    savingsAcct: "****7748",
    herParents: 7864.12,
    yourParents: 6079.13,
  },
  monthly: {
    spotify: 7,
    cinemark: 24,
    phone: 68,
    health: 112,
    life: 55,
    groceries: 131.78,
    lifestyle: 185,
  },
  lease: {
    saved: 3075,
    goal: 5000,
    rent: 1800,
    depositLastMonth: 3200,
  },
  milestones: {
    leaseDate: "2026-09-30",
    leaseAmount: 5000,
    honeymoonAmount: 8000,
    weddingAmount: 24000,
    furnishingDate: "2026-11-30",
    furnishingLow: 5000,
    furnishingHigh: 8000,
  },
  furnishing: [
    {
      key: "bedroom",
      room: "Bedroom",
      detail: "Queen mattress, frame, 2 nightstands, dresser, bedding",
      conservative: 1400,
      mid: 2200,
    },
    {
      key: "living",
      room: "Living Room",
      detail: "Sofa, media console, coffee table, rug, lamp",
      conservative: 1200,
      mid: 2000,
    },
    {
      key: "dining",
      room: "Dining Room & Kitchen",
      detail: "4-person table, cookware, cutlery, small appliances",
      conservative: 750,
      mid: 1200,
    },
    {
      key: "bath",
      room: "Bathroom & Cleaning",
      detail: "Towels, storage, vacuum, mop",
      conservative: 350,
      mid: 550,
    },
    {
      key: "work",
      room: "Work & Essentials",
      detail: "Desk, ergonomic chair, lighting, blinds",
      conservative: 450,
      mid: 750,
    },
    {
      key: "misc",
      room: "Delivery, Tax (6–7%) & Misc",
      detail: "Freight, assembly, sales tax, incidentals",
      conservative: 450,
      mid: 700,
    },
  ],
  emergency: {
    goal: 20000,
    date: "2027-01-31",
  },
  log: [],
  comments: [],
};

export const STORAGE_KEY = "financial-master-plan-v1";

export const currency = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const signedCurrency = (n: number) =>
  `${n >= 0 ? "+" : "-"}${currency(Math.abs(n))}`;

export const sum = (o: Record<string, number>) =>
  Object.values(o).reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);

export const daysUntil = (iso: string) => {
  const target = new Date(`${iso}T00:00:00`).getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / 86_400_000);
};

export const countdownLabel = (iso: string) => {
  const d = daysUntil(iso);
  if (d === null) return "no date set";
  if (d > 1) return `in ${d.toLocaleString()} days`;
  if (d === 1) return "tomorrow";
  if (d === 0) return "today";
  return `${Math.abs(d).toLocaleString()} days ago`;
};

export const formatDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const relativeTime = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
