// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParser = require('pdf-parse')
import logger from './logger'

const pdfLogger = logger.child({ module: 'pdf-utils' })

/**
 * Extracts raw text from a PDF buffer.
 * @param buffer - The PDF file buffer
 * @returns Promise<string> - The extracted text
 */
export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
  try {
    pdfLogger.info({ bufferSize: buffer.length }, 'Starting PDF text extraction')
    const data = await pdfParser(buffer)
    const text = data.text || ''
    pdfLogger.info({ pages: data.numpages, textLength: text.length }, 'PDF extraction result')
    if (text.length === 0) {
      pdfLogger.warn('PDF extraction returned empty text — file may be image-based (scanned)')
    }
    return text.substring(0, 50000)
  } catch (error) {
    pdfLogger.error({ err: error }, 'Failed to extract text from PDF')
    return ''
  }
}

/**
 * Extracts raw text from a plain text buffer.
 */
export const extractTextFromPlainText = (buffer: Buffer): string => {
  try {
    return buffer.toString('utf8').substring(0, 50000)
  } catch (error) {
    pdfLogger.error({ err: error }, 'Failed to extract text from buffer')
    return ''
  }
}

/**
 * Truncates and cleans text for AI prompt safety.
 * Preserves Unicode characters (accented letters, etc.) while removing only
 * actual control characters (NUL, BEL, etc.)
 */
export const cleanExtractedText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')           // Replace multiple whitespace with single space
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove only control chars, keep Unicode
    .trim()
}
