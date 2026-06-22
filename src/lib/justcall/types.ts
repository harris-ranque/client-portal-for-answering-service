export interface JustCallPaginatedMeta {
  page?: number;
  per_page?: number;
  count?: number;
  next_page_link?: string | null;
}

export interface JustCallApiResponse<T> {
  status?: string;
  data?: T;
  count?: number;
  page?: number;
  per_page?: number;
  next_page_link?: string | null;
  message?: string;
}

export interface JustCallCallInfo {
  direction?: string;
  type?: string;
  notes?: string;
  recording?: string;
}

export interface JustCallCallDuration {
  total_duration?: number;
  conversation_time?: number;
}

export interface JustCallCall {
  id: number;
  call_sid?: string;
  contact_number?: string;
  contact_name?: string;
  contact_email?: string;
  justcall_number?: string;
  justcall_line_name?: string;
  agent_id?: number;
  agent_name?: string;
  call_date?: string;
  call_time?: string;
  call_info?: JustCallCallInfo;
  call_duration?: JustCallCallDuration;
}

export interface JustCallUser {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  available?: string;
  owned_numbers?: string[];
  shared_numbers?: string[];
}

export interface JustCallContact {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  title?: string;
}

export type JustCallSyncType = "calls" | "contacts" | "agents" | "all";
