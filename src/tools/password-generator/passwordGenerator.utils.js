const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};
const AMBIGUOUS_CHARS = "il1Lo0O";

export function generatePassword({
  length = 16,
  uppercase = true,
  lowercase = true,
  numbers = true,
  symbols = true,
  excludeAmbiguous = false,
} = {}) {
  let pool = "";
  if (uppercase) pool += CHAR_SETS.uppercase;
  if (lowercase) pool += CHAR_SETS.lowercase;
  if (numbers) pool += CHAR_SETS.numbers;
  if (symbols) pool += CHAR_SETS.symbols;

  if (excludeAmbiguous) {
    pool = Array.from(pool)
      .filter((char) => !AMBIGUOUS_CHARS.includes(char))
      .join("");
  }

  if (!pool) {
    return { success: false, error: "Select at least one character type." };
  }

  const safeLength = Math.min(Math.max(Number(length) || 1, 4), 128);
  const randomValues = new Uint32Array(safeLength);
  crypto.getRandomValues(randomValues);
  const value = Array.from(randomValues, (n) => pool[n % pool.length]).join("");

  return { success: true, value };
}

export function calculatePasswordStrength(password) {
  if (!password) return { score: 0, label: "Weak" };

  const varietyCount = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) => re.test(password)).length;

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (varietyCount >= 3) score += 1;
  if (password.length >= 16 && varietyCount >= 4) score += 1;

  const labels = ["Weak", "Fair", "Good", "Strong", "Very strong"];
  return { score, label: labels[score] };
}
