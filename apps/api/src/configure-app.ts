import { INestApplication, UnprocessableEntityException, ValidationError, ValidationPipe } from '@nestjs/common';
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
  const allowedMethods: Record<string, string> = {
    '/users': 'POST, OPTIONS',
    '/sessions': 'POST, OPTIONS',
    '/users/me': 'GET, HEAD, OPTIONS',
  };
  app.use((request: { method: string; path: string }, response: {
    setHeader(name: string, value: string): void;
    status(code: number): { end(): void };
  }, next: () => void) => {
    response.setHeader('Cache-Control', 'no-store');
    const methods = allowedMethods[request.path.replace(/\/$/, '')];
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
    .setDescription('In-memory registration and JWT authentication. Users are lost on restart. Sign in and paste the access_token into Authorize.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, { extraModels: [ErrorResponseDto] });
  for (const path of Object.values(document.paths)) {
    for (const operation of [path?.get, path?.post]) {
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
