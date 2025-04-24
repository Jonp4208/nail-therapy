export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string
          created_at: string
          user_id: string
          service_id: string
          appointment_date: string
          appointment_time: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes: string | null
          payment_id: string | null
          deposit_paid: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          service_id: string
          appointment_date: string
          appointment_time: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string | null
          payment_id?: string | null
          deposit_paid?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          service_id?: string
          appointment_date?: string
          appointment_time?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string | null
          payment_id?: string | null
          deposit_paid?: boolean
        }
      }
      services: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          price: number
          duration: number
          category: 'nails' | 'waxing' | 'eyebrows'
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          price: number
          duration: number
          category: 'nails' | 'waxing' | 'eyebrows'
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          price?: number
          duration?: number
          category?: 'nails' | 'waxing' | 'eyebrows'
          image_url?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          created_at: string
          user_id: string
          appointment_id: string | null
          amount: number
          status: 'pending' | 'succeeded' | 'failed'
          stripe_payment_id: string
          is_deposit: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          appointment_id?: string | null
          amount: number
          status?: 'pending' | 'succeeded' | 'failed'
          stripe_payment_id: string
          is_deposit: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          appointment_id?: string | null
          amount?: number
          status?: 'pending' | 'succeeded' | 'failed'
          stripe_payment_id?: string
          is_deposit?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          user_id: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          email?: string | null
          is_admin?: boolean | string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          email?: string | null
          is_admin?: boolean | string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          email?: string | null
          is_admin?: boolean | string | null
        }
      }
      gallery: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          image_url: string
          category: 'nails' | 'waxing' | 'eyebrows'
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          image_url: string
          category: 'nails' | 'waxing' | 'eyebrows'
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          image_url?: string
          category?: 'nails' | 'waxing' | 'eyebrows'
        }
      }
    }
  }
}
