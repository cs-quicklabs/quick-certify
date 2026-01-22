import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import * as crypto from 'crypto';
import { AllConfigType } from '@src/config/config.type';

/**
 * Google User Info extracted from OAuth
 */
export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
}

/**
 * OAuth state data for CSRF protection
 */
export interface OAuthStateData {
  action: 'login' | 'signup';
  redirectUrl?: string;
  timestamp: number;
}

/**
 * Google OAuth Service
 *
 * Handles Google OAuth authentication using google-auth-library.
 * Supports both:
 * - ID Token Flow (for SPAs/mobile apps)
 * - Authorization Code Flow (server-side OAuth)
 *
 * SRP: Single responsibility for Google OAuth operations
 * DIP: Uses ConfigService for configuration injection
 */
@Injectable()
export class GoogleOAuthService {
  private readonly oAuth2Client: OAuth2Client | null;
  private readonly googleClientId: string | undefined;
  private readonly googleClientSecret: string | undefined;
  private readonly googleCallbackUrl: string | undefined;
  private readonly stateSecret: string;
  private readonly STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.googleClientId = this.configService.get('auth.googleClientId', { infer: true });
    this.googleClientSecret = this.configService.get('auth.googleClientSecret', { infer: true });
    this.googleCallbackUrl = this.configService.get('auth.googleCallbackUrl', { infer: true });

    // Use JWT secret for signing state tokens (survives restarts)
    this.stateSecret =
      this.configService.get('auth.jwtSecret', { infer: true }) || 'default-secret';

    // Initialize OAuth2Client only if credentials are configured
    if (this.googleClientId) {
      this.oAuth2Client = new OAuth2Client(
        this.googleClientId,
        this.googleClientSecret,
        this.googleCallbackUrl,
      );
    } else {
      this.oAuth2Client = null;
    }
  }

  /**
   * Check if Google OAuth is properly configured
   */
  isConfigured(): boolean {
    return !!this.googleClientId && !!this.oAuth2Client;
  }

  /**
   * Verify Google ID Token (for ID Token Flow)
   * Used when frontend sends ID token directly
   *
   * @param idToken - Google ID token from client-side authentication
   * @returns Google user information
   */
  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    if (!this.oAuth2Client || !this.googleClientId) {
      throw new UnauthorizedException('Google OAuth is not configured');
    }

    try {
      const ticket = await this.oAuth2Client.verifyIdToken({
        idToken,
        audience: this.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google ID token payload');
      }

      return this.extractUserInfo(payload);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Google ID token verification failed:', error);
      throw new UnauthorizedException('Failed to verify Google ID token');
    }
  }

  /**
   * Generate Authorization URL (for Authorization Code Flow)
   * Redirects user to Google for authentication
   *
   * Uses signed state tokens that survive server restarts
   *
   * @param action - Whether this is for login or signup
   * @param redirectUrl - URL to redirect after successful auth
   * @returns Authorization URL and state parameter
   */
  generateAuthUrl(
    action: 'login' | 'signup',
    redirectUrl?: string,
  ): { url: string; state: string } {
    if (!this.oAuth2Client) {
      throw new UnauthorizedException('Google OAuth is not configured');
    }

    // Create state data and sign it (no server-side storage needed)
    const stateData: OAuthStateData = {
      action,
      redirectUrl,
      timestamp: Date.now(),
    };

    const state = this.signState(stateData);

    const url = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline', // Get refresh token
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'consent', // Force consent screen to get refresh token
    });

    return { url, state };
  }

  /**
   * Validate state parameter for CSRF protection
   * Verifies signature and expiration
   *
   * @param state - State parameter from callback
   * @returns State data if valid
   */
  validateState(state: string): OAuthStateData | null {
    try {
      const stateData = this.verifyState(state);

      if (!stateData) {
        return null;
      }

      // Check if state has expired
      if (Date.now() - stateData.timestamp > this.STATE_EXPIRY_MS) {
        return null;
      }

      return stateData;
    } catch (error) {
      console.error('State validation failed:', error);
      return null;
    }
  }

  /**
   * Sign state data into a URL-safe token
   */
  private signState(data: OAuthStateData): string {
    const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.stateSecret)
      .update(payload)
      .digest('base64url');
    return `${payload}.${signature}`;
  }

  /**
   * Verify and decode a signed state token
   */
  private verifyState(state: string): OAuthStateData | null {
    const parts = state.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [payload, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', this.stateSecret)
      .update(payload)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    try {
      const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
      return data as OAuthStateData;
    } catch {
      return null;
    }
  }

  /**
   * Exchange Authorization Code for tokens (for Authorization Code Flow)
   * Called when Google redirects back with auth code
   *
   * @param code - Authorization code from Google callback
   * @returns Google user information
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleUserInfo> {
    if (!this.oAuth2Client) {
      throw new UnauthorizedException('Google OAuth is not configured');
    }

    try {
      // Exchange code for tokens
      const { tokens } = await this.oAuth2Client.getToken(code);

      if (!tokens.id_token) {
        throw new UnauthorizedException('No ID token received from Google');
      }

      // Verify the ID token and get user info
      const ticket = await this.oAuth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: this.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }

      return this.extractUserInfo(payload);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Google code exchange failed:', error);
      throw new UnauthorizedException('Failed to exchange authorization code');
    }
  }

  /**
   * Extract user info from Google token payload
   */
  private extractUserInfo(payload: TokenPayload): GoogleUserInfo {
    if (!payload.email) {
      throw new UnauthorizedException('No email in Google token');
    }

    if (!payload.email_verified) {
      throw new UnauthorizedException('Google email is not verified');
    }

    return {
      id: payload.sub,
      email: payload.email,
      verified_email: payload.email_verified,
      name: payload.name || '',
      given_name: payload.given_name || '',
      family_name: payload.family_name || '',
      picture: payload.picture,
    };
  }
}
