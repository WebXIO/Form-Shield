import type { SpamDetectionResult, FormShieldConfig } from './types.js';

const DEFAULT_SPAM_PATTERNS = [
  /\b(viagra|cialis|casino|lottery|winner|congratulations.*won)\b/i,
  /\b(crypto.*invest|bitcoin.*opportunity|nft.*sale)\b/i,
];

/**
 * Detect spam in form input based on content analysis
 * @param input - The form input to check
 * @param config - Optional configuration for spam detection
 * @returns SpamDetectionResult with isSpam flag and reasons
 */
export function detectSpam(
  input: { name: string; email: string; message: string },
  config?: FormShieldConfig['contentFilter']
): SpamDetectionResult {
  const reasons: string[] = [];
  
  const minVowelRatio = config?.minVowelRatio ?? 0.15;
  const maxConsonantCluster = config?.maxConsonantCluster ?? 5;
  const maxUrls = config?.maxUrls ?? 2;
  const allowDigitsInName = config?.allowDigitsInName ?? false;
  const maxNamePunctuation = config?.maxNamePunctuation ?? 2;

  // Check for random string patterns in message (low vowel ratio)
  if (input.message.length > 5) {
    const vowelRatio = (input.message.match(/[aeiouAEIOU]/g) || []).length / input.message.length;
    if (vowelRatio < minVowelRatio) {
      reasons.push(`Message has suspicious low vowel ratio (${(vowelRatio * 100).toFixed(1)}%)`);
    }
  }

  // Check for consecutive consonants (random strings often have long consonant clusters)
  const consonantPattern = new RegExp(`[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{${maxConsonantCluster + 1},}`, 'g');
  const consonantCluster = input.message.match(consonantPattern);
  if (consonantCluster) {
    reasons.push(`Message contains suspicious consonant clusters: ${consonantCluster.join(", ")}`);
  }

  // Check for gibberish name (contains digits or excessive punctuation)
  if (!allowDigitsInName && /\d/.test(input.name)) {
    reasons.push("Name contains digits");
  }
  
  const punctuationCount = (input.name.match(/[.\-_]/g) || []).length;
  if (punctuationCount > maxNamePunctuation) {
    reasons.push(`Name has excessive punctuation (${punctuationCount} occurrences)`);
  }

  // Check for excessive URLs in message
  const urlCount = (input.message.match(/https?:\/\/[^\s]+/gi) || []).length;
  if (urlCount > maxUrls) {
    reasons.push(`Message contains too many URLs (${urlCount})`);
  }

  // Check for common spam patterns
  const patterns = [...DEFAULT_SPAM_PATTERNS, ...(config?.customPatterns || [])];
  for (const pattern of patterns) {
    if (pattern.test(input.message)) {
      reasons.push("Message contains known spam keywords");
      break;
    }
  }

  return { isSpam: reasons.length > 0, reasons };
}

/**
 * Log spam detection for debugging
 * @param result - The spam detection result
 * @param input - The original input
 */
export function logSpamDetection(
  result: SpamDetectionResult,
  input: { name: string; email: string; message: string }
): void {
  if (result.isSpam) {
    const preview = input.message.length > 100 
      ? `${input.message.substring(0, 100)}...` 
      : input.message;
    console.log(
      `[SPAM] Content filter triggered | Email: ${input.email} | Name: ${input.name} | ` +
      `Reasons: ${result.reasons.join("; ")} | Message preview: ${preview}`
    );
  }
}