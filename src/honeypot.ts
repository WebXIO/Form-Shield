import type { HoneypotResult } from './types.js';

/**
 * Check if honeypot field was filled (indicating bot behavior)
 * @param value - The value of the honeypot field
 * @param fieldName - The name of the honeypot field
 * @returns HoneypotResult indicating if honeypot was triggered
 */
export function checkHoneypot(
  value: string | undefined | null,
  fieldName: string = 'website'
): HoneypotResult {
  const triggered = value !== undefined && value !== null && value.trim() !== '';
  
  return {
    triggered,
    fieldName,
    value: triggered ? value : undefined,
  };
}

/**
 * Log honeypot trigger for debugging
 * @param result - The honeypot check result
 * @param metadata - Additional metadata to log
 */
export function logHoneypotTrigger(
  result: HoneypotResult,
  metadata?: { email?: string; name?: string; ip?: string }
): void {
  if (result.triggered) {
    const meta = metadata 
      ? ` | Email: ${metadata.email} | Name: ${metadata.name}${metadata.ip ? ` | IP: ${metadata.ip}` : ''}`
      : '';
    console.log(`[SPAM] Honeypot triggered | Field: ${result.fieldName} | Value: ${result.value}${meta}`);
  }
}
