// backend/src/users/password.service.ts

import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

/**
 * PasswordService
 *
 * Provides secure password hashing and comparison helpers.
 * Uses bcrypt with a fixed salt rounds configuration.
 */
@Injectable()
export class PasswordService {
  // Salt rounds for bcrypt hashing.
  private readonly saltRounds = 12;

  /**
   * Hashes a plain-text password using bcrypt.
   * Never store the plain value; only store the returned hash.
   */
  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  /**
   * Compares a plain-text password against a stored bcrypt hash.
   * Returns true when the password matches the hash.
   */
  async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
