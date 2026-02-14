import type { 
  FormShieldConfig, 
  ValidationResult, 
  ContactFormInput,
  SpamDetectionResult,
  HoneypotResult,
  CapVerificationResult 
} from './types.js';
import { checkHoneypot, logHoneypotTrigger } from './honeypot.js';
import { detectSpam, logSpamDetection } from './spam-detection.js';
import { verifyCapToken } from './capjs.js';

/**
 * FormShield - Layered spam protection for contact forms
 * 
 * @example
 * ```typescript
 * const shield = new FormShield({
 *   capjs: {
 *     apiEndpoint: process.env.CAP_API_ENDPOINT,
 *     siteKey: process.env.CAP_SITE_KEY,
 *     secretKey: process.env.CAP_SECRET_KEY,
 *   },
 * });
 * 
 * const result = await shield.validate(formInput);
 * if (!result.valid) {
 *   throw new Error(result.reason);
 * }
 * ```
 */
export class FormShield {
  private config: FormShieldConfig;
  private honeypotFieldName: string;

  constructor(config: FormShieldConfig) {
    this.config = config;
    this.honeypotFieldName = config.honeypot?.fieldName ?? 'website';
  }

  /**
   * Validate form input through all protection layers
   * @param input - The form input to validate
   * @param options - Additional options
   * @returns ValidationResult
   */
  async validate(
    input: ContactFormInput,
    options?: { log?: boolean }
  ): Promise<ValidationResult> {
    const shouldLog = options?.log ?? true;

    // Layer 1: Honeypot check
    const honeypotValue = input[this.honeypotFieldName];
    const honeypotResult = checkHoneypot(
      typeof honeypotValue === 'string' ? honeypotValue : undefined,
      this.honeypotFieldName
    );
    
    if (honeypotResult.triggered) {
      if (shouldLog) {
        logHoneypotTrigger(honeypotResult, { email: input.email, name: input.name });
      }
      return {
        valid: false,
        layer: 'honeypot',
        reason: `Honeypot field '${this.honeypotFieldName}' was filled`,
        details: honeypotResult,
      };
    }

    // Layer 2: Content-based spam detection
    const spamResult = detectSpam(input, this.config.contentFilter);
    
    if (spamResult.isSpam) {
      if (shouldLog) {
        logSpamDetection(spamResult, input);
      }
      return {
        valid: false,
        layer: 'content',
        reason: spamResult.reasons.join(', '),
        details: spamResult,
      };
    }

    // Layer 3: Cap.js verification
    if (!input.capToken) {
      return {
        valid: false,
        layer: 'captcha',
        reason: 'Captcha token is required',
      };
    }

    const capResult = await verifyCapToken({
      apiEndpoint: this.config.capjs.apiEndpoint,
      siteKey: this.config.capjs.siteKey,
      secretKey: this.config.capjs.secretKey,
      token: input.capToken,
    });

    if (!capResult.success) {
      if (shouldLog) {
        console.log(`[SPAM] Cap.js verification failed | Email: ${input.email} | Error: ${capResult.error}`);
      }
      return {
        valid: false,
        layer: 'captcha',
        reason: capResult.error || 'Captcha verification failed',
        details: capResult,
      };
    }

    return { valid: true };
  }

  /**
   * Check only the honeypot layer
   */
  checkHoneypot(value: string | undefined): HoneypotResult {
    return checkHoneypot(value, this.honeypotFieldName);
  }

  /**
   * Check only the content filter layer
   */
  checkContent(input: { name?: string; email?: string; message?: string }): SpamDetectionResult {
    return detectSpam(input, this.config.contentFilter);
  }

  /**
   * Verify only the Cap.js token
   */
  async verifyCaptcha(token: string): Promise<CapVerificationResult> {
    return verifyCapToken({
      apiEndpoint: this.config.capjs.apiEndpoint,
      siteKey: this.config.capjs.siteKey,
      secretKey: this.config.capjs.secretKey,
      token,
    });
  }
}
