import type { CapVerificationResult } from './types.js';

export interface CapVerifyOptions {
  apiEndpoint: string;
  siteKey: string;
  secretKey: string;
  token: string;
}

/**
 * Verify a Cap.js token with the server
 * @param options - Verification options including endpoint, keys, and token
 * @returns Promise resolving to verification result
 */
export async function verifyCapToken(options: CapVerifyOptions): Promise<CapVerificationResult> {
  try {
    const response = await fetch(
      `${options.apiEndpoint}/${options.siteKey}/siteverify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: options.secretKey,
          response: options.token,
        }),
      }
    );
    
    if (!response.ok) {
      return {
        success: false,
        error: `Cap.js API returned ${response.status}`,
      };
    }
    
    const data = await response.json();
    return {
      success: data.success === true,
      error: data.success ? undefined : (data.error || 'Verification failed'),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}