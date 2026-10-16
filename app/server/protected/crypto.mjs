import {randomBytes, createHash, createCipheriv, createDecipheriv} from 'node:crypto'
export const opaque = () => randomBytes(32).toString('base64url')
export const digest = value => createHash('sha256').update(value).digest('hex')
export const challenge = value => createHash('sha256').update(value).digest('base64url')
export function seal(value, key, id) {
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', Buffer.from(key,'hex'), iv)
  cipher.setAAD(Buffer.from(id))
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()])
  return Buffer.concat([iv,cipher.getAuthTag(),ciphertext]).toString('base64url')
}
export function unseal(value, key, id) {
  const raw = Buffer.from(value,'base64url'), cipher = createDecipheriv('aes-256-gcm',Buffer.from(key,'hex'),raw.subarray(0,12))
  cipher.setAAD(Buffer.from(id)); cipher.setAuthTag(raw.subarray(12,28))
  return JSON.parse(Buffer.concat([cipher.update(raw.subarray(28)),cipher.final()]).toString())
}
