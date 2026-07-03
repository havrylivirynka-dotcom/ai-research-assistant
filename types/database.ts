export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_chats: {
        Row: {
          created_at: string
          id: string
          mode: string
          project_id: string
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mode?: string
          project_id: string
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mode?: string
          project_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chats_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          chat_id: string
          citations: Json | null
          content: string
          created_at: string
          id: string
          role: string
          tokens: number
        }
        Insert: {
          chat_id: string
          citations?: Json | null
          content: string
          created_at?: string
          id?: string
          role: string
          tokens?: number
        }
        Update: {
          chat_id?: string
          citations?: Json | null
          content?: string
          created_at?: string
          id?: string
          role?: string
          tokens?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "ai_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage: {
        Row: {
          cost: number
          created_at: string
          endpoint: string
          id: string
          tokens: number
          user_id: string
        }
        Insert: {
          cost?: number
          created_at?: string
          endpoint: string
          id?: string
          tokens?: number
          user_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          endpoint?: string
          id?: string
          tokens?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bibliography: {
        Row: {
          ai_analysis: Json | null
          ai_score: number | null
          created_at: string
          id: string
          project_id: string
          recommendation: string | null
          reference_text: string
          search_vector: unknown
          source_type: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          ai_score?: number | null
          created_at?: string
          id?: string
          project_id: string
          recommendation?: string | null
          reference_text: string
          search_vector?: unknown
          source_type?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          ai_score?: number | null
          created_at?: string
          id?: string
          project_id?: string
          recommendation?: string | null
          reference_text?: string
          search_vector?: unknown
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bibliography_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding: string
          id: string
          section_ref: string | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding: string
          id?: string
          section_ref?: string | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string
          id?: string
          section_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          created_at: string
          effective_date: string | null
          id: string
          issuing_authority: string | null
          order_number: string | null
          source: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          effective_date?: string | null
          id?: string
          issuing_authority?: string | null
          order_number?: string | null
          source?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          effective_date?: string | null
          id?: string
          issuing_authority?: string | null
          order_number?: string | null
          source?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          science_field: string | null
          status: string
          title: string
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          science_field?: string | null
          status?: string
          title: string
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          science_field?: string | null
          status?: string
          title?: string
          topic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_articles: {
        Row: {
          abstract: string | null
          ai_evaluation: Json | null
          ai_score: number | null
          ai_summary: string | null
          authors: Json
          citations: number
          created_at: string
          doi: string | null
          id: string
          journal: string | null
          project_id: string
          publication_year: number | null
          publisher: string | null
          search_vector: unknown
          title: string
          url: string | null
        }
        Insert: {
          abstract?: string | null
          ai_evaluation?: Json | null
          ai_score?: number | null
          ai_summary?: string | null
          authors?: Json
          citations?: number
          created_at?: string
          doi?: string | null
          id?: string
          journal?: string | null
          project_id: string
          publication_year?: number | null
          publisher?: string | null
          search_vector?: unknown
          title: string
          url?: string | null
        }
        Update: {
          abstract?: string | null
          ai_evaluation?: Json | null
          ai_score?: number | null
          ai_summary?: string | null
          authors?: Json
          citations?: number
          created_at?: string
          doi?: string | null
          id?: string
          journal?: string | null
          project_id?: string
          publication_year?: number | null
          publisher?: string | null
          search_vector?: unknown
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_articles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string
          filters: Json
          id: string
          query: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          query: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          query?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          ai_analysis: Json | null
          extracted_text: string | null
          file_name: string
          file_path: string
          id: string
          mime_type: string
          project_id: string
          size: number
          status: string
          uploaded_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          extracted_text?: string | null
          file_name: string
          file_path: string
          id?: string
          mime_type: string
          project_id: string
          size: number
          status?: string
          uploaded_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          extracted_text?: string | null
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string
          project_id?: string
          size?: number
          status?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          ai_model: string
          created_at: string
          id: string
          language: string
          plan: string
          theme: string
          user_id: string
        }
        Insert: {
          ai_model?: string
          created_at?: string
          id?: string
          language?: string
          plan?: string
          theme?: string
          user_id: string
        }
        Update: {
          ai_model?: string
          created_at?: string
          id?: string
          language?: string
          plan?: string
          theme?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_knowledge_chunks: {
        Args: {
          match_count?: number
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          content: string
          document_id: string
          id: string
          section_ref: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

