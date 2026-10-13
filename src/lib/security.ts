import crypto from "crypto";

/**
 * Generates an OWASP-compliant random password:
 * - At least 14 characters
 * - Contains uppercase, lowercase, numbers, and special characters
 * - High entropy cryptographically secure random bytes
 */
export function generateOwaspCompliantPassword(length: number = 14): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*()_+~|}{[]:;?><=";
  const allChars = upper + lower + digits + special;

  // Ensure at least one character from each character class
  const passwordChars = [
    upper[crypto.randomInt(0, upper.length)],
    lower[crypto.randomInt(0, lower.length)],
    digits[crypto.randomInt(0, digits.length)],
    special[crypto.randomInt(0, special.length)],
  ];

  // Fill the remainder of the length
  for (let i = passwordChars.length; i < length; i++) {
    const randomIndex = crypto.randomInt(0, allChars.length);
    passwordChars.push(allChars[randomIndex]);
  }

  // Shuffle array using Fisher-Yates with crypto random indices
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join("");
}
