import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AllConfigType } from '@src/config/config.type';
import { IPasswordService } from '../interfaces';

/**
 * Password Service Implementation
 *
 * SRP: Handles all password-related operations:
 * - Hashing passwords
 * - Comparing passwords
 * - Generating reset tokens
 */
@Injectable()
export class PasswordService implements IPasswordService {
  private readonly saltRounds: number;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.saltRounds = this.configService.getOrThrow('auth.bcryptSaltRounds', {
      infer: true,
    });
  }

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
