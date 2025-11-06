export type UserRole = "super_admin" | "client" | "guest"
export type EventStatus = "draft" | "active" | "completed" | "archived"
export type EventType = "wedding" | "event"

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
  event_type: EventType
  primary_color: string
  secondary_color: string
  content_background_color: string
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
  module_photo_overlay: boolean
  module_photo_overlay_visible: boolean
  module_vendors: boolean
  module_photo_gallery_visible: boolean
  module_schedule_visible: boolean
  module_menu_visible: boolean
  module_survey_visible: boolean
  module_bingo_visible: boolean
  module_vendors_visible: boolean
  custom_css: string | null // Added custom CSS field for advanced settings
  custom_js: string | null // Added custom JavaScript field for advanced settings
  guest_template: string | null // Added guest template selection field
  access_code: string | null // Added access code field
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
  title_en: string | null
  items: string[]
  items_en: string[] | null
  descriptions?: string[] | null // Add descriptions for each item
  descriptions_en?: string[] | null // Add English descriptions
  images?: string[] | null // Add images for each item
  actions?: string[]
  actions_en?: string[]
  created_at: string
}

export interface BingoProgress {
  id: string
  bingo_card_id: string
  guest_id: string
  guest_name?: string // Add guest name field
  completed_items: number[]
  is_winner: boolean
  created_at: string
}

export interface Vendor {
  id: string
  event_id: string
  name: string
  category: string
  contact_name: string | null
  phone: string | null
  email: string | null
  website: string | null
  price: number | null
  deposit_paid: number | null
  notes: string | null
  status: "pending" | "confirmed" | "paid" | "cancelled"
  created_at: string
  updated_at: string
}

export interface WeddingBudget {
  id: string
  event_id: string
  total_budget: number
  spent: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WeddingExpense {
  id: string
  event_id: string
  category: string
  name: string
  estimated_cost: number
  actual_cost: number
  paid: number
  due_date: string | null
  status: "pending" | "paid" | "overdue"
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WeddingChecklistItem {
  id: string
  event_id: string
  category: string
  task: string
  description: string | null
  due_date: string | null
  completed: boolean
  priority: "low" | "medium" | "high"
  order_index: number
  created_at: string
  updated_at: string
}

export interface QRTemplate {
  id: string
  event_id: string
  name: string
  style: string
  primary_color: string
  secondary_color: string
  background_type: "color" | "image"
  background_value: string | null
  qr_background_color: string | null
  custom_text: string | null
  decor_image: string | null
  include_vendors: boolean
  elements: Array<{
    id: string
    type: string
    x: number
    y: number
    content?: string
  }>
  created_at: string
  updated_at: string
}

export interface PhotoOverlay {
  id: string
  event_id: string
  name: string
  description: string | null
  template_type: "simple" | "elegant" | "festive"
  overlay_svg: string
  text_positions: Array<{
    id: string
    x: number
    y: number
    fontSize: number
    defaultText: string
  }> | null
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
}
