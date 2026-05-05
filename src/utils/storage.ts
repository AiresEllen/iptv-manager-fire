import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { AppLink, Client } from '../types';
import { db, isConfigured } from '../lib/firebase';

export function getExpiringTomorrow(clients: Client[]): Client[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const t = tomorrow.toISOString().slice(0, 10);
  return clients.filter((c) => c.active && c.expiresAt === t);
}

export function getExpiredClients(clients: Client[]): Client[] {
  const today = new Date().toISOString().slice(0, 10);
  return clients.filter((c) => c.active && c.expiresAt < today);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const LS_KEY = 'iptv_clients';
const COLLECTION_NAME = 'clients';
const APPS_COLLECTION_NAME = 'apps';
const LS_APPS_KEY = 'iptv_apps';


export async function loadApps(): Promise<AppLink[]> {
  if (isConfigured && db) {
    const q = query(collection(db, APPS_COLLECTION_NAME), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => dbToAppLink(item.id, item.data()));
  }

  try {
    const r = localStorage.getItem(LS_APPS_KEY);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
}

export async function insertAppLink(app: Omit<AppLink, 'id' | 'createdAt'>): Promise<AppLink> {
  if (isConfigured && db) {
    const newApp = { ...app, createdAt: new Date().toISOString() };
    const ref = await addDoc(collection(db, APPS_COLLECTION_NAME), newApp);
    return { ...newApp, id: ref.id, createdAt: newApp.createdAt.slice(0, 10) };
  }

  const newApp: AppLink = { ...app, id: generateId(), createdAt: new Date().toISOString().slice(0, 10) };
  const all = await loadApps();
  const next = [...all, newApp].sort((a, b) => a.name.localeCompare(b.name));
  localStorage.setItem(LS_APPS_KEY, JSON.stringify(next));
  return newApp;
}

export async function updateAppLink(id: string, app: Partial<AppLink>): Promise<void> {
  if (isConfigured && db) {
    await updateDoc(doc(db, APPS_COLLECTION_NAME, id), appToDb(app));
    return;
  }

  const all = await loadApps();
  localStorage.setItem(LS_APPS_KEY, JSON.stringify(all.map((x) => x.id === id ? { ...x, ...app } : x)));
}

export async function deleteAppLink(id: string): Promise<void> {
  if (isConfigured && db) {
    await deleteDoc(doc(db, APPS_COLLECTION_NAME, id));
    return;
  }

  const all = await loadApps();
  localStorage.setItem(LS_APPS_KEY, JSON.stringify(all.filter((x) => x.id !== id)));
}

function dbToAppLink(id: string, row: Record<string, unknown>): AppLink {
  return {
    id,
    name: (row.name as string) ?? '',
    url: (row.url as string) ?? '',
    description: (row.description as string) ?? '',
    createdAt: String(row.createdAt ?? '').slice(0, 10),
  };
}

function appToDb(app: Partial<AppLink>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (app.name !== undefined) out.name = app.name;
  if (app.url !== undefined) out.url = app.url;
  if (app.description !== undefined) out.description = app.description;
  if (app.createdAt !== undefined) out.createdAt = app.createdAt;
  return out;
}

export async function loadClients(): Promise<Client[]> {
  if (isConfigured && db) {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => dbToClient(item.id, item.data()));
  }

  try {
    const r = localStorage.getItem(LS_KEY);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
}

export async function insertClient(c: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  if (isConfigured && db) {
    const newClient = {
      ...c,
      createdAt: new Date().toISOString(),
    };
    const ref = await addDoc(collection(db, COLLECTION_NAME), newClient);
    return { ...newClient, id: ref.id, createdAt: newClient.createdAt.slice(0, 10) };
  }

  const newClient: Client = { ...c, id: generateId(), createdAt: new Date().toISOString().slice(0, 10) };
  const all = await loadClients();
  const next = [newClient, ...all];
  localStorage.setItem(LS_KEY, JSON.stringify(next));
  return newClient;
}

export async function updateClient(id: string, c: Partial<Client>): Promise<void> {
  if (isConfigured && db) {
    await updateDoc(doc(db, COLLECTION_NAME, id), clientToDb(c));
    return;
  }

  const all = await loadClients();
  localStorage.setItem(LS_KEY, JSON.stringify(all.map((x) => x.id === id ? { ...x, ...c } : x)));
}

export async function deleteClient(id: string): Promise<void> {
  if (isConfigured && db) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return;
  }

  const all = await loadClients();
  localStorage.setItem(LS_KEY, JSON.stringify(all.filter((x) => x.id !== id)));
}

function dbToClient(id: string, row: Record<string, unknown>): Client {
  return {
    id,
    name: row.name as string,
    phone: row.phone as string,
    plan: row.plan as Client['plan'],
    expiresAt: String(row.expiresAt ?? '').slice(0, 10),
    createdAt: String(row.createdAt ?? '').slice(0, 10),
    notes: (row.notes as string) ?? '',
    active: Boolean(row.active),
    username: (row.username as string) ?? '',
    server: (row.server as string) ?? '',
    player: (row.player as string) ?? '',
    mac: (row.mac as string) ?? '',
    code: (row.code as string) ?? '',
    siteUrl: (row.siteUrl as string) ?? '',
    value: (row.value as string) ?? '',
    appLinkId: (row.appLinkId as string) ?? '',
    appLinkName: (row.appLinkName as string) ?? '',
  };
}

function clientToDb(c: Partial<Client>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (c.name !== undefined) out.name = c.name;
  if (c.phone !== undefined) out.phone = c.phone;
  if (c.plan !== undefined) out.plan = c.plan;
  if (c.expiresAt !== undefined) out.expiresAt = c.expiresAt;
  if (c.createdAt !== undefined) out.createdAt = c.createdAt;
  if (c.notes !== undefined) out.notes = c.notes;
  if (c.active !== undefined) out.active = c.active;
  if (c.username !== undefined) out.username = c.username;
  if (c.server !== undefined) out.server = c.server;
  if (c.player !== undefined) out.player = c.player;
  if (c.mac !== undefined) out.mac = c.mac;
  if (c.code !== undefined) out.code = c.code;
  if (c.siteUrl !== undefined) out.siteUrl = c.siteUrl;
  if (c.value !== undefined) out.value = c.value;
  if (c.appLinkId !== undefined) out.appLinkId = c.appLinkId;
  if (c.appLinkName !== undefined) out.appLinkName = c.appLinkName;
  return out;
}
