export interface ApiResponse<T> {
  data: T;
  message: string | null;
  metadata: { [key: string]: any } | null;
}
