// backend/src/users/users.dto.ts

import type { UserRole } from "./user.entity";

/**
 * DTO for creating a new user.
 *
 * Note:
 * - password is plain-text here and must be hashed before persistence.
 * - isActive is included for future use; it may not map directly to the entity yet.
 */
export class CreateUserDto {
  email!: string;
  password!: string;
  role!: UserRole;
  isActive?: boolean;
}

/**
 * DTO for updating an existing user.
 *
 * All fields are optional; only provided fields should be updated.
 * If password is provided, it must be re-hashed before persistence.
 */
export class UpdateUserDto {
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}
