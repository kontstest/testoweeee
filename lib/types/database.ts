export type UserRole = "super_admin" | "client" | "guest"
export type EventStatus = "draft" | "active" | "completed" | "archived"

export interface Profile {
  id: string
  email: string
  role: UserRole
  first_name: string | null
  last_name: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  name: string
  event_date: string
  status: EventStatus
  client_id: string
  qr_code: string | null
  primary_color: string
  secondary_color: string
  hero_image_url: string | null
  hero_image_position: string | null
  background_image_url: string | null
  background_blur: number
  background_opacity: number
  background_brightness: number
  background_position: string
  module_photo_gallery: boolean
  module_schedule: boolean
  module_menu: boolean
  module_survey: boolean
  module_bingo: boolean
  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  event_id: string
  uploaded_by: string | null
  image_url: string
  caption: string | null
  created_at: string
}

export interface ScheduleItem {
  id: string
  event_id: string
  time: string
  title: string
  description: string | null
  order_index: number
  created_at: string
}

export interface MenuItem {
  id: string
  event_id: string
  category: "appetizer" | "main" | "dessert" | "drink"
  name: string
  description: string | null
  order_index: number
  created_at: string
}

export interface Survey {
  id: string
  event_id: string
  title: string
  description: string | null
  is_active: boolean
  created_at: string
}

export interface SurveyQuestion {
  id: string
  survey_id: string
  question_text: string
  question_type: "multiple_choice" | "text" | "rating"
  options: string[] | null
  order_index: number
  created_at: string
}

export interface BingoCard {
  id: string
  event_id: string
  title: string
  items: string[]
  created_at: string
}

export interface BingoProgress {
  id: string
  bingo_card_id: string
  guest_id: string
  completed_items: number[]
  is_winner: boolean
  created_at: string
}
