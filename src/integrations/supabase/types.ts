export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          image_url: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          chat_id: string
          created_at: string
          id: number
          is_from_admin: boolean
          is_read: boolean
          message: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          id?: number
          is_from_admin?: boolean
          is_read?: boolean
          message: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: number
          is_from_admin?: boolean
          is_read?: boolean
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_credentials: {
        Row: {
          api_key: string | null
          client_id: string | null
          created_at: string
          id: number
          marketplace: string
          updated_at: string
          user_id: string
          warehouse_id: string | null
        }
        Insert: {
          api_key?: string | null
          client_id?: string | null
          created_at?: string
          id?: number
          marketplace: string
          updated_at?: string
          user_id: string
          warehouse_id?: string | null
        }
        Update: {
          api_key?: string | null
          client_id?: string | null
          created_at?: string
          id?: number
          marketplace?: string
          updated_at?: string
          user_id?: string
          warehouse_id?: string | null
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          email: string
          id: string
          name: string | null
          subscribed_at: string
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          name?: string | null
          subscribed_at?: string
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          name?: string | null
          subscribed_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_method: string
          id: string
          items: Json
          order_number: number
          source: string
          status: string
          total: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_method: string
          id: string
          items: Json
          order_number?: number
          source?: string
          status?: string
          total: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          delivery_method?: string
          id?: string
          items?: Json
          order_number?: number
          source?: string
          status?: string
          total?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          additional_images: Json | null
          archived: boolean | null
          article_number: string | null
          avito_url: string | null
          barcode: string | null
          category: string
          color_variants: Json | null
          colors: Json | null
          country_of_origin: string
          created_at: string
          description: string
          discount_price: number | null
          id: string
          image_url: string
          in_stock: boolean
          is_bestseller: boolean | null
          is_new: boolean | null
          material: string | null
          model_name: string | null
          ozon_url: string | null
          price: number
          rating: number
          sizes: Json | null
          specifications: Json | null
          stock_quantity: number | null
          title: string
          updated_at: string
          video_type: string | null
          video_url: string | null
          wildberries_url: string | null
        }
        Insert: {
          additional_images?: Json | null
          archived?: boolean | null
          article_number?: string | null
          avito_url?: string | null
          barcode?: string | null
          category: string
          color_variants?: Json | null
          colors?: Json | null
          country_of_origin: string
          created_at?: string
          description: string
          discount_price?: number | null
          id?: string
          image_url?: string
          in_stock?: boolean
          is_bestseller?: boolean | null
          is_new?: boolean | null
          material?: string | null
          model_name?: string | null
          ozon_url?: string | null
          price: number
          rating?: number
          sizes?: Json | null
          specifications?: Json | null
          stock_quantity?: number | null
          title: string
          updated_at?: string
          video_type?: string | null
          video_url?: string | null
          wildberries_url?: string | null
        }
        Update: {
          additional_images?: Json | null
          archived?: boolean | null
          article_number?: string | null
          avito_url?: string | null
          barcode?: string | null
          category?: string
          color_variants?: Json | null
          colors?: Json | null
          country_of_origin?: string
          created_at?: string
          description?: string
          discount_price?: number | null
          id?: string
          image_url?: string
          in_stock?: boolean
          is_bestseller?: boolean | null
          is_new?: boolean | null
          material?: string | null
          model_name?: string | null
          ozon_url?: string | null
          price?: number
          rating?: number
          sizes?: Json | null
          specifications?: Json | null
          stock_quantity?: number | null
          title?: string
          updated_at?: string
          video_type?: string | null
          video_url?: string | null
          wildberries_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["name"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          preferredcontactmethod: string | null
          savedaddresses: Json | null
          status: Database["public"]["Enums"]["user_status"]
          telegramnickname: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          preferredcontactmethod?: string | null
          savedaddresses?: Json | null
          status?: Database["public"]["Enums"]["user_status"]
          telegramnickname?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          preferredcontactmethod?: string | null
          savedaddresses?: Json | null
          status?: Database["public"]["Enums"]["user_status"]
          telegramnickname?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          is_super_admin: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      manage_admin_privileges: {
        Args: { admin_email: string; target_email: string; action: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
      user_status: "pending" | "approved"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "user"],
      user_status: ["pending", "approved"],
    },
  },
} as const
