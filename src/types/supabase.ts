
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
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          role: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      sessions: {
        Row: {
          id: string
          title: string
          professor_id: string
          start_time: string | null
          end_time: string | null
          quiz_frequency_minutes: number
          topic_tags: string[] | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          professor_id: string
          start_time?: string | null
          end_time?: string | null
          quiz_frequency_minutes?: number
          topic_tags?: string[] | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          professor_id?: string
          start_time?: string | null
          end_time?: string | null
          quiz_frequency_minutes?: number
          topic_tags?: string[] | null
          created_at?: string | null
        }
      }
      questions: {
        Row: {
          id: string
          session_id: string
          question: string
          options: Json
          correct_option_index: number
          topic_tag: string | null
          transcript_segment: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          question: string
          options: Json
          correct_option_index: number
          topic_tag?: string | null
          transcript_segment?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          question?: string
          options?: Json
          correct_option_index?: number
          topic_tag?: string | null
          transcript_segment?: string | null
          created_at?: string | null
        }
      }
      responses: {
        Row: {
          id: string
          question_id: string
          student_id: string
          selected_option_index: number
          is_correct: boolean
          response_time: number
          created_at: string | null
        }
        Insert: {
          id?: string
          question_id: string
          student_id: string
          selected_option_index: number
          is_correct: boolean
          response_time: number
          created_at?: string | null
        }
        Update: {
          id?: string
          question_id?: string
          student_id?: string
          selected_option_index?: number
          is_correct?: boolean
          response_time?: number
          created_at?: string | null
        }
      }
    }
  }
}
