import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Response Interfaces
export interface PaginatedResponse<T> {
  items: T[];
  total_items: number;
  total_pages: number;
  current_page: number;
  has_next: boolean;
  has_prev: boolean;
  next_page: number | null;
  prev_page: number | null;
}

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
}

// Segments
export const getSegments = () => api.get<ApiResponse<PaginatedResponse<Segment>>>('/segments');
export const getSegmentById = (id: string) => api.get<ApiResponse<Segment>>(`/segments/${id}`);
export const getRulesBySegment = (segmentId: string) => api.get(`/segments/${segmentId}/rules`);

// Rules
export interface Condition {
    field: string;
    operator: string;
    value: any;
    value2?: any;
}

export interface Segment {
  id: number;
  segment_name: string;
  description: string;
  row_count: number;
  last_refreshed_at: string;
  rule_id?: number;
  table_name: string;
  dependencies: number[];
  operation: string | null;
}

export interface Rule {
  id: number;
  rule_name: string;
  description: string;
  conditions: Condition[];
  dependencies: number[];
  operation: string | null;
  is_active: boolean;
  schedule: string;
  next_run_at: string | null;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RulePayload {
  rule_name: string;
  description: string;
  conditions: Condition[];
  schedule: string;
}

export const getRules = (params?: { page?: number; per_page?: number }) => api.get<ApiResponse<PaginatedResponse<Rule>>>('/rules', { params });
export const getRuleById = (id: string) => api.get<{data: Rule}>(`/rules/${id}`);
export const createRule = (rule: RulePayload) => api.post('/rules', rule);
export const updateRule = (id: string, rule: RulePayload) => api.put(`/rules/${id}`, rule);
export const deleteRule = (id: number) => api.delete(`/rules/${id}`);
export const getSegmentSampleData = (id: string) => api.get<ApiResponse<{ sample_data: any[] }>>(`/segments/${id}/sample_data`);
export const getSegmentLineage = (id: string) => api.get<ApiResponse<{ nodes: any[]; edges: any[] }>>(`/segments/${id}/lineage`);
export const triggerRule = (id: string) => api.post(`/rules/${id}/trigger`);

export default api;
