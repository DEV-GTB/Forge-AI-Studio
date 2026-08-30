/**
 * Forge AI Intelligence - Response Quality and Fallback Validation Engine
 * 
 * This module parses AI responses and streaming chat chunks to detect quality failures
 * such as incomplete code blocks, broken markdown formatting, or typical AI hallucinations/loops.
 */

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  code?: 'incomplete_code' | 'broken_markdown' | 'hallucination' | 'empty' | 'too_short';
}

export const AIResponseValidator = {
  /**
   * Validate a completed text response for common structural, layout, and content quality issues.
   */
  validate(text: string): ValidationResult {
    const trimmed = text.trim();
    
    // 1. Check for empty or near-empty responses
    if (trimmed.length === 0) {
      return { isValid: false, reason: "Response is completely empty", code: 'empty' };
    }
    
    if (trimmed.length < 5) {
      return { isValid: false, reason: "Response is suspiciously short", code: 'too_short' };
    }

    // 2. Incomplete code blocks: check for odd number of triple backticks
    // (meaning a code block was started with ``` but never closed)
    const backtickCount = (text.match(/```/g) || []).length;
    if (backtickCount % 2 !== 0) {
      return { 
        isValid: false, 
        reason: "Truncated or unclosed code block detected (odd count of triple backticks)", 
        code: 'incomplete_code' 
      };
    }

    // 3. Broken markdown: check for unclosed bold markers (**)
    const boldAsteriskCount = (text.match(/\*\*/g) || []).length;
    if (boldAsteriskCount % 2 !== 0) {
      return { 
        isValid: false, 
        reason: "Broken bold markdown styling detected (unmatched double asterisks)", 
        code: 'broken_markdown' 
      };
    }

    // 4. Hallucination & Infinite Looping checks
    // If a long word or character sequence is repeating continuously (infinite generation loops)
    const consecutiveRepeats = text.match(/(.{15,})\1{3,}/s);
    if (consecutiveRepeats) {
      return { 
        isValid: false, 
        reason: "Repetitive phrase looping detected (potential AI hallucination or state loop)", 
        code: 'hallucination' 
      };
    }

    // Check for raw developer template tags left over, e.g., [Insert your code here] or [Your Name]
    if (/\[Insert\s+.*here\]/gi.test(text) || /<insert\s+.*>/gi.test(text)) {
      return { 
        isValid: false, 
        reason: "Unresolved developer placeholders/template tags detected in production content", 
        code: 'hallucination' 
      };
    }

    return { isValid: true };
  }
};
