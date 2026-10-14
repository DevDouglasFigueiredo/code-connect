// Explicit test configuration: application code never supplies a secret fallback.
process.env.JWT_SECRET = 'code-connect-e2e-only-secret';
