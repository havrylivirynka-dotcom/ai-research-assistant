const PDF_MAGIC_BYTES = "%PDF-";
// DOCX files are ZIP archives, which always start with this 4-byte signature.
const ZIP_MAGIC_BYTES = [0x50, 0x4b, 0x03, 0x04];

/**
 * Confirms the file actually starts with the PDF magic bytes, since a
 * client-supplied MIME type can be spoofed (e.g. renaming a file and
 * forging the multipart Content-Type).
 */
export function isPdfMagicBytes(bytes: Uint8Array): boolean {
  const header = new TextDecoder().decode(bytes.slice(0, 5));
  return header === PDF_MAGIC_BYTES;
}

/** Confirms the file starts with the ZIP signature that every DOCX file uses. */
export function isDocxMagicBytes(bytes: Uint8Array): boolean {
  return ZIP_MAGIC_BYTES.every((byte, index) => bytes[index] === byte);
}
