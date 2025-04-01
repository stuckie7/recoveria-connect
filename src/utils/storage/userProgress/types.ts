// Add this to your Database interface in types.ts
user_presence: {
  Row: {
    id: string
    is_online: boolean
    last_seen: string
    created_at: string
  }
  Insert: {
    id: string
    is_online?: boolean
    last_seen?: string
    created_at?: string
  }
  Update: {
    id?: string
    is_online?: boolean
    last_seen?: string
    created_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "user_presence_id_fkey"
      columns: ["id"]
      isOneToOne: true
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
  ]
}
