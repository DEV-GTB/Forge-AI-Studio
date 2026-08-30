export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasTwoNumbers: boolean;
  numberCount: number;
  errorMessage: string | null;
}

export function validatePasswordRules(password: string): PasswordValidationResult {
  const pass = password || "";
  const hasMinLength = pass.length >= 5;
  const hasLowercase = /[a-z]/.test(pass);
  const hasUppercase = /[A-Z]/.test(pass);
  const numberMatches = pass.match(/[0-9]/g) || [];
  const hasTwoNumbers = numberMatches.length >= 2;

  const isValid = hasMinLength && hasLowercase && hasUppercase && hasTwoNumbers;

  let errorMessage: string | null = null;
  if (!hasMinLength) {
    errorMessage = "Password must be at least 5 characters long.";
  } else if (!hasLowercase) {
    errorMessage = "Password must contain at least 1 lowercase letter (a-z).";
  } else if (!hasUppercase) {
    errorMessage = "Password must contain at least 1 uppercase letter (A-Z).";
  } else if (!hasTwoNumbers) {
    errorMessage = `Password must contain at least 2 numbers (0-9).`;
  }

  return {
    isValid,
    hasMinLength,
    hasLowercase,
    hasUppercase,
    hasTwoNumbers,
    numberCount: numberMatches.length,
    errorMessage
  };
}
