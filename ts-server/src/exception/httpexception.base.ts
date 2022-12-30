import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HandleException implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const error = exception.message;
    response
      .status(status)
      .json({
        code: status,
        path: request.url,
        error: exception.message,
      });
  }
}

export class BaseException extends HttpException {
  constructor(message, status=HttpStatus.BAD_REQUEST) {
    super({
      status: status,
      error: message
    }, status);
  }
}