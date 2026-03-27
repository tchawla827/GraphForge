export type ApiErrorCode =
  | "AUTH_REQUIRED"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONSTRAINT_ERROR"
  | "SERVER_ERROR";

export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ApiSuccess<T> {
  data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function isApiError(res: ApiResponse<unknown>): res is ApiError {
  return "error" in res;
}
