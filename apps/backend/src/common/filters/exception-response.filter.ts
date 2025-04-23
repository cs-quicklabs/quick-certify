import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../dto/api-response';

interface HttpExceptionResponseInterface {
  statusCode: number;
  message: string | string[];
  error?: string;
  [key: string]: unknown;
}

@Catch(HttpException)
export class ExceptionResponseFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const r: HttpExceptionResponseInterface =
      exception.getResponse() as HttpExceptionResponseInterface;
    let message: string;
    if (exception.message) {
      if (typeof r === 'string') {
        message = r;
      } else if (typeof r.message === 'string') {
        message = r.message;
      } else {
        const firstNonEmptyMessage = r.message?.find((msg) => msg.length !== 0);
        message = firstNonEmptyMessage;
      }
    }

    if (!message) {
      if (r && Object.keys(r).includes('errors')) {
        const firstError = r.errors[Object.keys(r.errors)[0]];
        message = firstError;
      }
    }

    response.status(status).json(new ApiResponse(status, message));
  }
}
