export const ENTITY_TYPES = [
  "sports_team",
  "tournament",
  "sports_player",
  "menu",
  "catalog",
  "vcard",
  "emergency_id",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  sports_team: "Equipo de fútbol",
  tournament: "Campeonato / Torneo",
  sports_player: "Ficha de jugador",
  menu: "Menú digital",
  catalog: "Catálogo de productos",
  vcard: "Tarjeta de presentación",
  emergency_id: "Identificación de emergencia",
};

export interface PublicEntity {
  id: string;
  slug: string;
  entityType: EntityType;
  title: string;
  isActive: boolean;
  isClaimed: boolean;
  payload: Record<string, unknown>;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResolveResult {
  exists: boolean;
  isClaimed: boolean;
  slug?: string;
  entityType?: EntityType;
  title?: string;
  entity?: PublicEntity;
}

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

// --- Payload shapes (loosely typed to match the backend's flexible JSONB schemas) ---

export interface SportsTeamPayload {
  crestUrl?: string;
  players?: Array<{ number?: number; name: string; position?: string; photoUrl?: string }>;
  staff?: Array<{ name: string; role?: string }>;
  nextMatch?: { opponent?: string; date?: string; venue?: string };
  standingsPosition?: number;
  socialLinks?: Record<string, string>;
}

export interface TournamentPayload {
  standings?: Array<{
    team: string;
    played?: number;
    won?: number;
    drawn?: number;
    lost?: number;
    points?: number;
  }>;
  fixture?: Array<{ date?: string; time?: string; homeTeam: string; awayTeam: string; venue?: string }>;
  topScorers?: Array<{ player: string; team?: string; goals: number }>;
}

export interface SportsPlayerPayload {
  photoUrl?: string;
  number?: number;
  position?: string;
  stats?: Record<string, number | string>;
  medicalNotes?: string;
  insurance?: { provider?: string; policyNumber?: string };
  emergencyContact?: { name: string; phone: string; relationship?: string };
}

export interface MenuPayload {
  categories: Array<{
    name: string;
    items: Array<{ name: string; price: number; description?: string }>;
  }>;
}

export interface CatalogPayload {
  products: Array<{ name: string; price: number; imageUrl?: string; description?: string }>;
}

export interface VCardPayload {
  fullName: string;
  jobTitle?: string;
  company?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialLinks?: Record<string, string>;
}

export interface EmergencyIdPayload {
  fullName?: string;
  bloodType?: string;
  medicalNotes?: string;
  emergencyContacts: Array<{ name: string; phone: string; relationship?: string }>;
  whatsappNumber?: string;
  rewardOffered?: boolean;
}
