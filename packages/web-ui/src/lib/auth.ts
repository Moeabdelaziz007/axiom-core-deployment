import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { v4 as uuidv4 } from 'uuid';

// Types for the authentication system
export interface WalletAuthPayload {
  address: string;
  signature: string;
  message: string;
}

export interface JWTPayload {
  sub: string; // Subject (wallet address)
  iat: number; // Issued at (timestamp)
  exp: number; // Expiration time (timestamp)
  jti: string; // JWT ID (unique identifier)
  tenantId: string; // Tenant ID for multi-tenancy
}

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    address: string;
    tenantId: string;
  };
  token?: string;
  error?: string;
}

export interface SessionData {
  user: {
    id: string;
    address: string;
    tenantId: string;
  };
  token: string;
  expiresAt: number;
}

/**
 * Configuration for JWT tokens
 */
const JWT_CONFIG = {
  // Token expiration time (24 hours in seconds)
  EXPIRATION_TIME: 24 * 60 * 60,
  // Algorithm for signing tokens
  ALGORITHM: 'HS256',
  // JWT secret key (in production, this should come from environment variables)
  SECRET_KEY: 'axiom-wallet-auth-secret-key-change-in-production'
};

/**
 * Converts a string to Uint8Array for cryptographic operations
 * @param str - The string to convert
 * @returns Uint8Array representation of the string
 */
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Converts Uint8Array to base64url string (URL-safe base64)
 * @param bytes - The bytes to encode
 * @returns Base64url encoded string
 */
function base64urlEncode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Converts base64url string to Uint8Array
 * @param str - The base64url string to decode
 * @returns Uint8Array representation
 */
function base64urlDecode(str: string): Uint8Array {
  str += '='.repeat((4 - str.length % 4) % 4);
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  return new Uint8Array(
    atob(str)
      .split('')
      .map(char => char.charCodeAt(0))
  );
}

/**
 * Creates a cryptographic signature using HMAC-SHA256
 * @param data - The data to sign
 * @param secret - The secret key for signing
 * @returns Promise resolving to the signature
 */
async function createHMACSignature(data: Uint8Array, secret: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    secret as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data as BufferSource);
  return new Uint8Array(signatureBuffer);
}

/**
 * Verifies a cryptographic signature using HMAC-SHA256
 * @param data - The original data
 * @param signature - The signature to verify
 * @param secret - The secret key used for signing
 * @returns Promise resolving to true if signature is valid
 */
async function verifyHMACSignature(
  data: Uint8Array,
  signature: Uint8Array,
  secret: Uint8Array
): Promise<boolean> {
  try {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      secret as BufferSource,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    return await crypto.subtle.verify('HMAC', cryptoKey, signature as BufferSource, data as BufferSource);
  } catch (error) {
    console.error('Error verifying HMAC signature:', error);
    return false;
  }
}

/**
 * Creates a JWT token for the given wallet address
 * @param address - The Solana wallet address
 * @returns Promise resolving to the JWT token
 */
export async function createSession(address: string): Promise<string> {
  try {
    // Validate the address format
    new PublicKey(address);

    const now = Math.floor(Date.now() / 1000);
    const expirationTime = now + JWT_CONFIG.EXPIRATION_TIME;

    // Create JWT payload
    const payload: JWTPayload = {
      sub: address,
      iat: now,
      exp: expirationTime,
      jti: uuidv4(),
      tenantId: uuidv4() // Generate unique tenant ID for this session
    };

    // Encode header
    const header = { alg: JWT_CONFIG.ALGORITHM, typ: 'JWT' };
    const encodedHeader = base64urlEncode(
      stringToUint8Array(JSON.stringify(header))
    );

    // Encode payload
    const encodedPayload = base64urlEncode(
      stringToUint8Array(JSON.stringify(payload))
    );

    // Create signature
    const message = `${encodedHeader}.${encodedPayload}`;
    const secretKey = stringToUint8Array(JWT_CONFIG.SECRET_KEY);
    const signature = await createHMACSignature(
      stringToUint8Array(message),
      secretKey
    );

    const encodedSignature = base64urlEncode(signature);

    // Combine to create JWT
    const token = `${message}.${encodedSignature}`;

    console.log('✅ JWT session created for address:', address);
    return token;
  } catch (error) {
    console.error('❌ Error creating JWT session:', error);
    throw new Error('Failed to create session');
  }
}

/**
 * Verifies a Solana wallet signature
 * @param address - The wallet address that should have signed the message
 * @param signature - The signature to verify (base58 encoded)
 * @param message - The original message that was signed
 * @returns Promise resolving to true if signature is valid
 */
export async function verifyWalletSignature(
  address: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    console.log('🔐 Verifying wallet signature for address:', address);

    // Convert address to PublicKey
    const publicKey = new PublicKey(address);

    // Convert signature from base58 to Uint8Array
    const signatureBytes = bs58.decode(signature);

    // Convert message to Uint8Array
    const messageBytes = new TextEncoder().encode(message);

    // Verify the signature using tweetnacl
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKey.toBytes()
    );

    if (isValid) {
      console.log('✅ Wallet signature verified successfully');
    } else {
      console.log('❌ Invalid wallet signature');
    }

    return isValid;
  } catch (error) {
    console.error('❌ Error verifying wallet signature:', error);
    return false;
  }
}

/**
 * Authenticates a wallet using signature verification and creates a session
 * @param payload - The authentication payload containing address, signature, and message
 * @returns Promise resolving to authentication result
 */
export async function authenticateWallet(
  payload: WalletAuthPayload
): Promise<AuthResult> {
  try {
    const { address, signature, message } = payload;

    // Step 1: Verify the wallet signature
    const isSignatureValid = await verifyWalletSignature(
      address,
      signature,
      message
    );

    if (!isSignatureValid) {
      return {
        success: false,
        error: 'Invalid wallet signature'
      };
    }

    // Step 2: Create JWT session
    const token = await createSession(address);

    // Step 3: Parse token to get user data
    const [, payloadPart] = token.split('.');
    const decodedPayload = JSON.parse(
      new TextDecoder().decode(base64urlDecode(payloadPart))
    ) as JWTPayload;

    const user = {
      id: decodedPayload.jti,
      address: decodedPayload.sub,
      tenantId: decodedPayload.tenantId
    };

    console.log('✅ Wallet authentication successful for address:', address);

    return {
      success: true,
      user,
      token
    };
  } catch (error) {
    console.error('❌ Error during wallet authentication:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Verifies a JWT token and returns the payload if valid
 * @param token - The JWT token to verify
 * @returns Promise resolving to the payload if valid, null otherwise
 */
export async function verifyJWTToken(token: string): Promise<JWTPayload | null> {
  try {
    const [headerPart, payloadPart, signaturePart] = token.split('.');

    if (!headerPart || !payloadPart || !signaturePart) {
      throw new Error('Invalid token format');
    }

    // Verify signature
    const message = `${headerPart}.${payloadPart}`;
    const signature = base64urlDecode(signaturePart);
    const secretKey = stringToUint8Array(JWT_CONFIG.SECRET_KEY);

    const isSignatureValid = await verifyHMACSignature(
      stringToUint8Array(message),
      signature,
      secretKey
    );

    if (!isSignatureValid) {
      throw new Error('Invalid token signature');
    }

    // Decode and validate payload
    const payload = JSON.parse(
      new TextDecoder().decode(base64urlDecode(payloadPart))
    ) as JWTPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new Error('Token has expired');
    }

    return payload;
  } catch (error) {
    console.error('❌ Error verifying JWT token:', error);
    return null;
  }
}

/**
 * Creates a challenge message for wallet signing
 * @param address - The wallet address
 * @returns A unique challenge message
 */
export function createChallengeMessage(address: string): string {
  const timestamp = Date.now();
  const nonce = uuidv4();

  return `Sign this message to authenticate with Axiom Network.\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nThis signature will be used to verify your identity and create a secure session.`;
}

/**
 * Stores session data in localStorage
 * @param sessionData - The session data to store
 */
export function storeSession(sessionData: SessionData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('axiom_auth_session', JSON.stringify(sessionData));
  }
}

/**
 * Retrieves session data from localStorage
 * @returns The stored session data or null
 */
export function retrieveSession(): SessionData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem('axiom_auth_session');
    if (!stored) {
      return null;
    }

    const sessionData = JSON.parse(stored) as SessionData;

    // Check if session has expired
    if (sessionData.expiresAt < Date.now()) {
      clearSession();
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error('Error retrieving session:', error);
    return null;
  }
}

/**
 * Clears the stored session
 */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('axiom_auth_session');
  }
}

/**
 * Checks if the current session is valid
 * @returns Promise resolving to true if session is valid
 */
export async function isSessionValid(): Promise<boolean> {
  const session = retrieveSession();
  if (!session) {
    return false;
  }

  const payload = await verifyJWTToken(session.token);
  return payload !== null;
}