export interface IResponse<T> {
  data: T;
  metadata?: {};
}

export interface IResponseMessage {
  message: string;
}
