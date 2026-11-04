export type ConversationFilterStatus =
  | 'all'
  | 'waiting_agent'
  | 'waiting_customer'
  | 'closed'
  | 'unassigned'
  | 'assigned_to_me'

export interface ConversationFilterCounts {
  all: number
  waiting_agent: number
  waiting_customer: number
  closed: number
  unassigned: number
  assigned_to_me: number
}
