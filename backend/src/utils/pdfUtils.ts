import pdfParser from 'pdf-parse'
import logger from './logger'

const pdfLogger = logger.child({ module: 'pdf-utils' })

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

export const extractTextFromPlainText = (buffer: Buffer): string => {
  try {
    return buffer.toString('utf8').substring(0, 50000)
  } catch (error) {
    pdfLogger.error({ err: error }, 'Failed to extract text from buffer')
    return ''
  }
}

export const cleanExtractedText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}
