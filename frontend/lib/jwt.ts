import jwt from 'jsonwebtoken';

export function generateFastApiToken(email: string): string {
  // Always sign a valid JWT. An empty email still produces a parseable token.
  // Returning '' causes `Bearer ` (empty), which the Lambda rejects with 401.
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET environment variable is not set');
  }
  return jwt.sign({ email: email || 'anonymous' }, secret);
}
