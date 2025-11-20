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
      people: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          credit_balance: number
          youtube_slots: number
          icloud_slots: number
          is_group: boolean
          is_active: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          credit_balance?: number
          youtube_slots?: number
          icloud_slots?: number
          is_group?: boolean
          is_active?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          credit_balance?: number
          youtube_slots?: number
          icloud_slots?: number
          is_group?: boolean
          is_active?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          name: string
          account_type_id: string
          current_balance: number
          credit_limit: number | null
          shared_limit: boolean
          parent_account_id: string | null
          cashback_eligible: boolean
          cashback_rate: number | null
          cashback_max: number | null
          cashback_min_spend: number | null
          cycle_type: string | null
          statement_day: number | null
          currency: string
          is_active: boolean
          exclude_from_totals: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          account_type_id: string
          current_balance?: number
          credit_limit?: number | null
          shared_limit?: boolean
          parent_account_id?: string | null
          cashback_eligible?: boolean
          cashback_rate?: number | null
          cashback_max?: number | null
          cashback_min_spend?: number | null
          cycle_type?: string | null
          statement_day?: number | null
          currency?: string
          is_active?: boolean
          exclude_from_totals?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          account_type_id?: string
          current_balance?: number
          credit_limit?: number | null
          shared_limit?: boolean
          parent_account_id?: string | null
          cashback_eligible?: boolean
          cashback_rate?: number | null
          cashback_max?: number | null
          cashback_min_spend?: number | null
          cycle_type?: string | null
          statement_day?: number | null
          currency?: string
          is_active?: boolean
          exclude_from_totals?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          date: string
          type: string
          status: string
          amount: number
          fee_amount: number
          final_amount: number | null
          category_id: string | null
          person_id: string | null
          shop_id: string | null
          description: string | null
          notes: string | null
          tags: string[] | null
          is_cashback_eligible: boolean
          discount_percent: number
          discount_fixed: number
          repayment_tag: string | null
          is_checked: boolean
          is_recurring: boolean
          run: boolean
          user_id: string
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          date: string
          type: string
          status?: string
          amount: number
          fee_amount?: number
          final_amount?: number | null
          category_id?: string | null
          person_id?: string | null
          shop_id?: string | null
          description?: string | null
          notes?: string | null
          tags?: string[] | null
          is_cashback_eligible?: boolean
          discount_percent?: number
          discount_fixed?: number
          repayment_tag?: string | null
          is_checked?: boolean
          is_recurring?: boolean
          run?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          date?: string
          type?: string
          status?: string
          amount?: number
          fee_amount?: number
          final_amount?: number | null
          category_id?: string | null
          person_id?: string | null
          shop_id?: string | null
          description?: string | null
          notes?: string | null
          tags?: string[] | null
          is_cashback_eligible?: boolean
          discount_percent?: number
          discount_fixed?: number
          repayment_tag?: string | null
          is_checked?: boolean
          is_recurring?: boolean
          run?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      // Add other tables as needed...
    }
    Views: {
      v_account_balances: {
        Row: {
          id: string
          name: string
          account_type_id: string
          account_type_name: string
          calculated_balance: number
          current_balance: number
          credit_limit: number | null
          user_id: string
        }
      }
    }
  }
}