import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

interface HttpResponse {
  status(code: number): HttpResponse;
  json(body: unknown): void;
  end(): void;
  setHeader(name: string, value: string): void;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<HttpResponse>();
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const details = exception instanceof HttpException ? exception.getResponse() : undefined;
    const body = typeof details === 'object' && details !== null ? details as { message?: string | string[]; errors?: string[] } : undefined;
    const message = statusCode >= 500 ? 'Internal server error' : statusCode === 400 ? 'Malformed request' :
      (typeof details === 'string' ? details : body?.message ?? 'Request failed');
    response.setHeader('Cache-Control', 'no-store');
    response.status(statusCode);
    if (http.getRequest<{ method: string }>().method === 'HEAD') {
      response.end();
      return;
    }
    response.json({ statusCode, message, ...(body?.errors ? { errors: body.errors } : {}) });
  }
}
