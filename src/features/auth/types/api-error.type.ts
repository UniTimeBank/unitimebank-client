// API Error Response type
export interface ApiErrorResponse {
  statusCode?: number;
  message?: string;
  error?: string;
  data?: {
    message?: string;
  };
}

// Common Auth Operation Result
export interface AuthOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
