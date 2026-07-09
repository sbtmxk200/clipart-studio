// API response envelope types
// Design Ref: §6 Error Handling (unified error shape)

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiOk<T> = { data: T };
export type ApiFail = { error: ApiError };
export type ApiResult<T> = ApiOk<T> | ApiFail;

export function isApiOk<T>(result: ApiResult<T>): result is ApiOk<T> {
  return 'data' in result;
}
