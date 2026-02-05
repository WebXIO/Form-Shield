export { FormShield } from './form-shield.js';

export { detectSpam, logSpamDetection } from './spam-detection.js';
export { checkHoneypot, logHoneypotTrigger } from './honeypot.js';
export { verifyCapToken } from './capjs.js';
export { escapeHtml } from './sanitize.js';

export type {
  FormShieldConfig,
  ContactFormInput,
  SpamDetectionResult,
  HoneypotResult,
  CapVerificationResult,
  ValidationResult,
} from './types.js';
