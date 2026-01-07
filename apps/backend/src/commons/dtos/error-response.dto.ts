import { ResponseInterface } from '../interfaces';

export class ErrorResponse implements ResponseInterface {
  constructor(message: string, data?: unknown | unknown[], errCode?: number) {
    this.success = false;
    this.message = message;
    this.error = data;
    this.errorCode = errCode ?? 500;
  }
  success: boolean;
  message: string;
  data: unknown | unknown[];
  error: unknown;
  errorCode: number;
}
