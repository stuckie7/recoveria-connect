
export interface UserPresence {
  id: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
}

export interface UserPresenceInsert {
  id: string;
  is_online?: boolean;
  last_seen?: string;
  created_at?: string;
}

export interface UserPresenceUpdate {
  id?: string;
  is_online?: boolean;
  last_seen?: string;
  created_at?: string;
}

// Database relationship type
export interface UserPresenceRelationship {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
}
