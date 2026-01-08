import i18n from './i18n.js';

export class SecurityGuardrails {
  /**
   * Sanitizes input to prevent XSS and other injection attacks.
   * Although we use safe DOM methods, this adds an extra layer.
   * @param {string} input 
   * @returns {string}
   */
  static sanitize(input) {
    if (typeof input !== 'string') return input;
    // Basic HTML entity encoding
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Redacts sensitive information from the input.
   * @param {string} input 
   * @returns {string}
   */
  static redactSensitiveInfo(input) {
    if (typeof input !== 'string') return input;
    
    // Redact OpenAI-style API keys
    let redacted = input.replace(/sk-[a-zA-Z0-9]{20,}/g, i18n.t('sec_redacted_key'));
    
    // Redact potential Email addresses
    // redacted = redacted.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED EMAIL]');
    
    return redacted;
  }

  /**
   * Validates input against common prompt injection patterns.
   * @param {string} input 
   * @returns {{valid: boolean, reason?: string}}
   */
  static validateInput(input) {
    if (typeof input !== 'string') return { valid: true };

    // Example checks for Prompt Injection
    // These are very basic and should be expanded based on threat model
    const injectionPatterns = [
      { pattern: /ignore previous instructions/i, reason: i18n.t('sec_ignore_instructions') },
      { pattern: /system prompt/i, reason: i18n.t('sec_system_prompt') }
    ];

    for (const check of injectionPatterns) {
      if (check.pattern.test(input)) {
        return { valid: false, reason: check.reason };
      }
    }

    return { valid: true };
  }

  /**
   * Process user input through all guardrails.
   * @param {string} input 
   * @returns {{safe: boolean, content: string, error?: string}}
   */
  static process(input) {
    // 1. Validate
    const validation = this.validateInput(input);
    if (!validation.valid) {
      return { safe: false, content: input, error: validation.reason };
    }

    // 2. Redact
    const redacted = this.redactSensitiveInfo(input);

    // 3. Sanitize (Optional here depending on usage, but good for display)
    // We don't sanitize for LLM consumption usually as it needs raw text, 
    // but for storage or display it is good. 
    // For this context, we return the redacted version as the 'safe' content for processing.
    
    return { safe: true, content: redacted };
  }
}
