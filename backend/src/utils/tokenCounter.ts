import { getEncoding } from "js-tiktoken";

const encoding = getEncoding("cl100k_base");

/**
 * Counts the exact number of tokens in a string using tiktoken.
 * Uses cl100k_base encoding (optimized for most modern LLMs).
 * @param text The string to count tokens for.
 * @returns The number of tokens.
 */
export const countTokens = (text: string | null | undefined): number => {
  if (!text) return 0;
  return encoding.encode(text).length;
};

/**
 * Fallback estimation if tiktoken fails or for very fast rough checks.
 * @param text The string to estimate tokens for.
 * @returns The estimated number of tokens.
 */
export const estimateTokens = (text: string | null | undefined): number => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};
