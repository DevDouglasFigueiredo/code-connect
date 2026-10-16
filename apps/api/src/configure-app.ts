import { INestApplication, UnprocessableEntityException, ValidationError, ValidationPipe } from '@nestjs/common';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { ErrorResponseDto } from './common/response.dto';

function validationMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...validationMessages(error.children ?? []),
  ]);
}

export function configureApp(app: INestApplication): void {
  // Accept the documented 50k-character code limit even for multibyte Unicode/JSON escapes.
  (app as NestExpressApplication).useBodyParser('json', { limit: '1mb' });
  const allowedMethods: Record<string, string> = {
    '/users': 'POST, OPTIONS',
    '/sessions': 'POST, OPTIONS',
    '/users/me': 'GET, HEAD, OPTIONS',
  };
  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean),
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Location'],
    preflightContinue: true,
  });
  app.use((request: { method: string; path: string }, response: {
    setHeader(name: string, value: string): void;
    status(code: number): { end(): void };
  }, next: () => void) => {
    response.setHeader('Cache-Control', 'no-store');
    const path = request.path.replace(/\/$/, '');
    const methods = allowedMethods[path] ?? (
      path === '/posts' ? 'GET, HEAD, POST, OPTIONS' :
      /^\/posts\/[^/]+\/likes\/me$/.test(path) ? 'PUT, DELETE, OPTIONS' :
      /^\/posts\/[^/]+\/comments$/.test(path) ? 'GET, HEAD, POST, OPTIONS' :
      /^\/posts\/[^/]+(?:\/comments\/[^/]+)?$/.test(path) ? 'GET, HEAD, OPTIONS' : undefined
    );
    if (request.method === 'OPTIONS' && methods) {
      response.setHeader('Allow', methods);
      response.status(204).end();
      return;
    }
    next();
  });
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => new UnprocessableEntityException({ message: 'Validation failed', errors: validationMessages(errors) }),
  }));
  app.useGlobalFilters(new HttpExceptionFilter());
  const config = new DocumentBuilder()
    .setTitle('Code Connect API')
    .setDescription('Public post feed, full-text search, registration and JWT authentication. Sign in and paste the access_token into Authorize to publish, like and comment.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, { extraModels: [ErrorResponseDto] });
  for (const path of Object.values(document.paths)) {
    for (const operation of [path?.get, path?.post, path?.put, path?.delete]) {
      if (!operation) continue;
      operation.responses['400'] = { description: 'Malformed request', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponseDto' } } } };
      operation.responses['500'] = { description: 'Unexpected server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponseDto' } } } };
      for (const response of Object.values(operation.responses)) {
        if (!response || '$ref' in response) continue;
        response.headers = { ...response.headers, 'Cache-Control': { description: 'Responses must not be cached', schema: { type: 'string', example: 'no-store' } } };
      }
    }
  }
  SwaggerModule.setup('docs', app, document, { jsonDocumentUrl: 'docs-json' });
}
