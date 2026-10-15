// Force the isolated Compose test service: never inherit development database settings.
process.env.JWT_SECRET = 'code-connect-e2e-only-secret';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '3307';
process.env.DB_NAME = 'code_connect_test';
process.env.DB_USER = 'code_connect_test';
process.env.DB_PASSWORD = 'test-only-password';
process.env.CORS_ORIGINS = 'http://localhost:5173';
