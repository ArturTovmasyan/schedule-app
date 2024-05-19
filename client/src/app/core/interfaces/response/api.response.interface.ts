export interface ApiResponse<T> {
  data: T | null;
  message: string | null;
  metadata: { [key: string]: any } | null;
}
