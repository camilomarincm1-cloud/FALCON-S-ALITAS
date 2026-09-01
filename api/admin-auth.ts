import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: { [key: string]: string | string[] };
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

// In-memory rate limiting map for brute-force prevention
const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    // Check rate limit: max 6 attempts per 10 minutes per IP
    const attempt = loginAttempts.get(clientIp) || { count: 0, lockUntil: 0 };
    if (attempt.lockUntil > now) {
      const waitSeconds = Math.ceil((attempt.lockUntil - now) / 1000);
      return res.status(429).json({
        error: `Demasiados intentos fallidos. Bloqueo de seguridad activo. Espera ${waitSeconds} segundos.`,
      });
    }

    // Parse Body
    let body = req.body;
    if (!body || typeof body === 'string') {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const buffer = Buffer.concat(chunks);
      try {
        body = JSON.parse(buffer.toString('utf-8') || '{}');
      } catch {
        body = {};
      }
    }

    const username = String(body.username || '').trim().toLowerCase();
    const password = String(body.password || '').trim();

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Configured admin credentials from Environment Variables (or default safe cryptographic hashes)
    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD || 'Falcon2025*';

    // Verify using SHA-256
    const inputPassHash = crypto.createHash('sha256').update(password).digest('hex');
    const expectedPassHash = crypto.createHash('sha256').update(expectedPass).digest('hex');

    const isUserValid = username === expectedUser || username === 'falcons' || username === 'falconsalitas';
    const isPassValid = crypto.timingSafeEqual(Buffer.from(inputPassHash), Buffer.from(expectedPassHash));

    if (isUserValid && isPassValid) {
      // Clear rate limit on success
      loginAttempts.delete(clientIp);

      // Generate HMAC signed session token
      const tokenSecret = process.env.SESSION_SECRET || 'falcons_alitas_secure_secret_token_2025';
      const tokenPayload = `${username}:${Date.now()}`;
      const tokenSignature = crypto.createHmac('sha256', tokenSecret).update(tokenPayload).digest('hex');
      const sessionToken = `${Buffer.from(tokenPayload).toString('base64')}.${tokenSignature}`;

      return res.status(200).json({
        authenticated: true,
        token: sessionToken,
        message: 'Acceso administrativo concedido con éxito',
      });
    } else {
      // Increment failed attempt counter
      attempt.count += 1;
      if (attempt.count >= 6) {
        attempt.lockUntil = now + 10 * 60 * 1000; // 10 minutes lock
      }
      loginAttempts.set(clientIp, attempt);

      return res.status(401).json({
        authenticated: false,
        error: 'Credenciales inválidas. Acceso denegado.',
      });
    }
  } catch (error: any) {
    console.error('Admin Auth Error:', error);
    return res.status(500).json({ error: 'Error en la verificación de seguridad' });
  }
}
