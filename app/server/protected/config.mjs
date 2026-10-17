import {protectedAiConfig} from './ai-config.mjs'
const emails = ['ivanandradeuxui@gmail.com', 'ivanandradecarp@gmail.com']
export function protectedConfig(env) {
  if (env.TP_DEPLOYMENT_TARGET !== 'protected-test' || env.VERCEL_ENV !== 'preview') throw Error('disabled')
  const origin = new URL(env.TP_ORIGIN)
  if (origin.protocol !== 'https:' || origin.origin !== env.TP_ORIGIN || origin.username || origin.password) throw Error('invalid-config')
  if (env.TP_SUPABASE_URL !== 'https://lkzgydnglkrcmztviqsf.supabase.co' || !/^sb_publishable_[\w-]+$/.test(env.TP_SUPABASE_PUBLISHABLE_KEY ?? '')) throw Error('invalid-config')
  const identities = JSON.parse(env.TP_ALLOWED_IDENTITIES ?? 'null')
  if (!Array.isArray(identities) || identities.length !== 2 || emails.some(email => identities.filter(i => i.email === email).length !== 1) ||
      identities.some(i => !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(i.userId ?? '') || !/^\d{10,30}$/.test(i.googleSubject ?? '')) ||
      new Set(identities.map(i=>i.userId)).size !== 2 || new Set(identities.map(i=>i.googleSubject)).size !== 2) throw Error('invalid-identities')
  for (const name of ['TP_SESSION_ENCRYPTION_KEY', 'TP_SESSION_STORE_KEY']) if (!/^[\da-f]{64}$/.test(env[name] ?? '')) throw Error('invalid-config')
  if (env.TP_SESSION_STORE_KEY === env.TP_SESSION_ENCRYPTION_KEY) throw Error('invalid-config')
  return {origin: origin.origin, url: env.TP_SUPABASE_URL, publicKey: env.TP_SUPABASE_PUBLISHABLE_KEY,
    encryptionKey: env.TP_SESSION_ENCRYPTION_KEY, storeKey: env.TP_SESSION_STORE_KEY, identities, ai: protectedAiConfig(env)}
}
