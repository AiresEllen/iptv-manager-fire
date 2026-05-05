export type Plan = "Basic" | "Standard" | "Premium" | "Ultra";

export interface AppLink {
  id: string;
  name: string;
  url: string;
  description: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  plan: Plan;
  expiresAt: string; // ISO date string YYYY-MM-DD
  createdAt: string;
  notes: string;
  active: boolean;
  username?: string;
  server?: string;
  player?: string;
  mac?: string;
  code?: string;
  siteUrl?: string;
  value?: string;
  appLinkId?: string;
  appLinkName?: string;
}

export type Page = "dashboard" | "clients" | "apps" | "alerts" | "messages";
