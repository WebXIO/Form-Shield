export interface FormShieldConfig {
  honeypot?: {
    fieldName?: string;
  };
  
  contentFilter?: {
    minVowelRatio?: number;
    maxConsonantCluster?: number;
    maxUrls?: number;
    allowDigitsInName?: boolean;
    maxNamePunctuation?: number;
    customPatterns?: RegExp[];
  };
  
  capjs: {
    apiEndpoint: string;
    siteKey: string;
    secretKey: string;
  };
}

export interface ContactFormInput {
  name: string;
  email: string;
  message: string;
  capToken: string;
  [honeypotField: string]: string | undefined;
}

export interface SpamDetectionResult {
  isSpam: boolean;
  reasons: string[];
}

export interface HoneypotResult {
  triggered: boolean;
  fieldName: string;
  value?: string;
}

export interface CapVerificationResult {
  success: boolean;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  layer?: 'honeypot' | 'content' | 'captcha';
  reason?: string;
  details?: SpamDetectionResult | HoneypotResult | CapVerificationResult;
}
