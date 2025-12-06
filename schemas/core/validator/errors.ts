// /schemas/core/validator/errors.ts

// -----------------------------------------------------------
// This file defines a tiny helper for collecting validation
// errors and formatting them as strings for output.
// -----------------------------------------------------------

import { ValidationResult } from './types';

// 1. ErrorCollector accumulates human-readable error messages.
export class ErrorCollector {
  // Internal list of error strings.
  private readonly errors: string[] = [];

  // 2. Add an error message for a specific path.
  //    - path: e.g., "fields.title.default" or "" (root).
  //    - message: a short description of the problem.
  add(path: string, message: string): void {
    const location = path && path.trim().length > 0 ? path : '<root>';
    this.errors.push(`${location}: ${message}`);
  }

  // 3. Check if any errors were collected.
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  // 4. Get a shallow copy of the errors array (for safety).
  toArray(): string[] {
    return [...this.errors];
  }

  // 5. Convert the collected errors into a ValidationResult.
  //    - If no errors, return { status: 'valid' }.
  //    - Otherwise, return { status: 'invalid', errors: [...] }.
  toValidationResult(): ValidationResult {
    if (!this.hasErrors()) {
      return { status: 'valid' };
    }
    return {
      status: 'invalid',
      errors: this.toArray(),
    };
  }
}

// 6. Utility function to join a parent path and a child key.
//    - Example: joinPath("fields.title", "default") -> "fields.title.default"
//    - If parent is empty, returns child.
export function joinPath(parentPath: string, keyOrIndex: string): string {
  if (!parentPath || parentPath.trim().length === 0) {
    return keyOrIndex;
  }
  return `${parentPath}.${keyOrIndex}`;
}
