export interface AdminChatbotQueryBody {
  message: string
  conversationId?: string
}

export interface GetAppointmentsIntent {
  intent: 'get_appointments'
  startDate?: string
  endDate?: string
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  doctorId?: string
  patientId?: string
}

export interface GetRevenueIntent {
  intent: 'get_appointment_revenue'
  startDate?: string
  endDate?: string
}

export interface ExportAppointmentsIntent {
  intent: 'export_appointments'
  format: 'excel' | 'pdf' | 'csv'
  startDate?: string
  endDate?: string
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

export interface SearchAppointmentsIntent {
  intent: 'search_appointments'
  query: string
  searchBy: 'patient_name' | 'patient_phone' | 'doctor_name'
}

export type ChatbotIntent =
  | GetAppointmentsIntent
  | GetRevenueIntent
  | ExportAppointmentsIntent
  | SearchAppointmentsIntent

export interface ChatbotResponse {
  message: string
  data?: any
  intent?: string
  requiresAction?: boolean
  actionType?: string
  actionData?: any
}
