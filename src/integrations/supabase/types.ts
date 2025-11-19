export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          created_at?: string | null
          description: string
          icon?: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      certificados: {
        Row: {
          bairro: string | null
          data_conquista: string | null
          descricao: string | null
          emitido_em: string | null
          icone: string | null
          id: number
          nivel: string | null
          tipo: string | null
          titulo: string
          usuario_id: string
        }
        Insert: {
          bairro?: string | null
          data_conquista?: string | null
          descricao?: string | null
          emitido_em?: string | null
          icone?: string | null
          id?: number
          nivel?: string | null
          tipo?: string | null
          titulo: string
          usuario_id: string
        }
        Update: {
          bairro?: string | null
          data_conquista?: string | null
          descricao?: string | null
          emitido_em?: string | null
          icone?: string | null
          id?: number
          nivel?: string | null
          tipo?: string | null
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificados_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "ranking_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificados_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      entregas: {
        Row: {
          criado_em: string | null
          descricao: string | null
          id: number
          imagem: string | null
          local: string
          materiais: string[]
          peso: number
          pontos: number
          status: string | null
          titulo: string
          usuario_id: string
          validado_em: string | null
        }
        Insert: {
          criado_em?: string | null
          descricao?: string | null
          id?: number
          imagem?: string | null
          local: string
          materiais: string[]
          peso: number
          pontos: number
          status?: string | null
          titulo: string
          usuario_id: string
          validado_em?: string | null
        }
        Update: {
          criado_em?: string | null
          descricao?: string | null
          id?: number
          imagem?: string | null
          local?: string
          materiais?: string[]
          peso?: number
          pontos?: number
          status?: string | null
          titulo?: string
          usuario_id?: string
          validado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entregas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "ranking_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      locais_compostagem: {
        Row: {
          avaliacao: number | null
          criado_em: string | null
          distancia: string | null
          endereco: string
          esta_aberto: boolean | null
          horario: string | null
          id: number
          imagem: string | null
          latitude: number | null
          longitude: number | null
          materiais: string[] | null
          nome: string
          pontos_por_kg: number | null
          telefone: string | null
          tipo: string | null
        }
        Insert: {
          avaliacao?: number | null
          criado_em?: string | null
          distancia?: string | null
          endereco: string
          esta_aberto?: boolean | null
          horario?: string | null
          id?: number
          imagem?: string | null
          latitude?: number | null
          longitude?: number | null
          materiais?: string[] | null
          nome: string
          pontos_por_kg?: number | null
          telefone?: string | null
          tipo?: string | null
        }
        Update: {
          avaliacao?: number | null
          criado_em?: string | null
          distancia?: string | null
          endereco?: string
          esta_aberto?: boolean | null
          horario?: string | null
          id?: number
          imagem?: string | null
          latitude?: number | null
          longitude?: number | null
          materiais?: string[] | null
          nome?: string
          pontos_por_kg?: number | null
          telefone?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      recompensas: {
        Row: {
          categoria: string
          criado_em: string | null
          descricao: string | null
          id: number
          imagem: string | null
          mercados: string[] | null
          pontos: number
          quantidade_disponivel: number | null
          quantidade_total: number | null
          titulo: string
        }
        Insert: {
          categoria: string
          criado_em?: string | null
          descricao?: string | null
          id?: number
          imagem?: string | null
          mercados?: string[] | null
          pontos: number
          quantidade_disponivel?: number | null
          quantidade_total?: number | null
          titulo: string
        }
        Update: {
          categoria?: string
          criado_em?: string | null
          descricao?: string | null
          id?: number
          imagem?: string | null
          mercados?: string[] | null
          pontos?: number
          quantidade_disponivel?: number | null
          quantidade_total?: number | null
          titulo?: string
        }
        Relationships: []
      }
      resgates: {
        Row: {
          cpf: string
          criado_em: string | null
          id: number
          nome: string
          numero_pedido: string
          recompensa_id: number
          recompensa_mercados: string[] | null
          recompensa_pontos: number
          recompensa_titulo: string
          status: string | null
          telefone: string
          usuario_id: string
        }
        Insert: {
          cpf: string
          criado_em?: string | null
          id?: number
          nome: string
          numero_pedido: string
          recompensa_id: number
          recompensa_mercados?: string[] | null
          recompensa_pontos: number
          recompensa_titulo: string
          status?: string | null
          telefone: string
          usuario_id: string
        }
        Update: {
          cpf?: string
          criado_em?: string | null
          id?: number
          nome?: string
          numero_pedido?: string
          recompensa_id?: number
          recompensa_mercados?: string[] | null
          recompensa_pontos?: number
          recompensa_titulo?: string
          status?: string | null
          telefone?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resgates_recompensa_id_fkey"
            columns: ["recompensa_id"]
            isOneToOne: false
            referencedRelation: "recompensas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resgates_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "ranking_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resgates_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_materiais_organicos: {
        Row: {
          criado_em: string | null
          descricao: string | null
          icone: string | null
          id: number
          nome: string
          peso_por_unidade: number | null
          pontos_por_kg: number | null
        }
        Insert: {
          criado_em?: string | null
          descricao?: string | null
          icone?: string | null
          id?: number
          nome: string
          peso_por_unidade?: number | null
          pontos_por_kg?: number | null
        }
        Update: {
          criado_em?: string | null
          descricao?: string | null
          icone?: string | null
          id?: number
          nome?: string
          peso_por_unidade?: number | null
          pontos_por_kg?: number | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          atualizado_em: string | null
          bairro: string
          criado_em: string | null
          email: string
          entregas_validadas: number | null
          id: string
          nivel: string | null
          nome: string
          peso_total: number | null
          pontos: number | null
          total_entregas: number | null
        }
        Insert: {
          atualizado_em?: string | null
          bairro: string
          criado_em?: string | null
          email: string
          entregas_validadas?: number | null
          id: string
          nivel?: string | null
          nome: string
          peso_total?: number | null
          pontos?: number | null
          total_entregas?: number | null
        }
        Update: {
          atualizado_em?: string | null
          bairro?: string
          criado_em?: string | null
          email?: string
          entregas_validadas?: number | null
          id?: string
          nivel?: string | null
          nome?: string
          peso_total?: number | null
          pontos?: number | null
          total_entregas?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      ranking_bairros: {
        Row: {
          bairro: string | null
          nome_lider: string | null
          pontos_lider: number | null
          posicao: number | null
          total_pontos: number | null
          total_usuarios: number | null
        }
        Relationships: []
      }
      ranking_usuarios: {
        Row: {
          bairro: string | null
          email: string | null
          entregas_validadas: number | null
          id: string | null
          nivel: string | null
          nome: string | null
          pontos: number | null
          posicao: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
