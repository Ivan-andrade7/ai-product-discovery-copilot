// Server-only policy. No model, secret, budget or mode is accepted from the client.
export function protectedAiConfig(env) {
  const configuredMode = env.TP_AI_MODE ?? 'disabled'
  const mode = configuredMode === 'abacus' ? 'real' : configuredMode
  if (!['disabled', 'simulation', 'real'].includes(mode)) throw Error('invalid-ai-config')
  if (mode !== 'real') return { mode, provider: mode === 'simulation' ? 'simulation' : null, model: mode === 'simulation' ? 'simulation-e1' : null }
  // Legacy Abacus env is explicit authority, not a fallback for a missing provider.
  const provider = configuredMode === 'abacus' ? 'abacus' : env.TP_AI_PROVIDER
  if (!['abacus','gemini'].includes(provider) || (configuredMode === 'abacus' && env.TP_AI_PROVIDER && env.TP_AI_PROVIDER !== 'abacus')) throw Error('invalid-ai-config')
  const key = provider === 'abacus' ? env.TP_ABACUS_API_KEY : env.TP_GEMINI_API_KEY
  const model = env.TP_AI_MODEL
  if (typeof key !== 'string' || key.length < 16 || key.length > 512 || /[^\x21-\x7e]/.test(key)) throw Error('invalid-ai-config')
  if (typeof model !== 'string' || !/^[a-zA-Z0-9_.:-]{1,100}$/.test(model) || model === 'simulation-e1' || /^(auto|router)$|route[-_]?llm|^jev([_.:-]|$)/i.test(model)) throw Error('invalid-ai-config')
  if (provider === 'gemini' && (model !== 'gemini-3.8-flash' || env.TP_GEMINI_DATA_POLICY !== 'fictional-only' || env.TP_GEMINI_BILLING_POLICY !== 'free-no-billing')) throw Error('invalid-ai-config')
  const integer = (name, max) => {
    if (!/^\d+$/.test(env[name] ?? '')) throw Error('invalid-ai-config')
    const value = Number(env[name])
    if (!Number.isSafeInteger(value) || value < 1 || value > max) throw Error('invalid-ai-config')
    return value
  }
  return { mode, provider, model, key,
    maxOutputTokens: integer('TP_AI_MAX_OUTPUT_TOKENS', 1800),
    maxSources: integer('TP_AI_MAX_SOURCES', 10),
    maxInputChars: integer('TP_AI_MAX_INPUT_CHARS', 12000),
    maxSourceChars: integer('TP_AI_MAX_SOURCE_CHARS', 6000),
    timeoutMs: integer('TP_AI_TIMEOUT_MS', 25000),
    dailyLimit: integer('TP_AI_DAILY_LIMIT', 20),
    sessionLimit: integer('TP_AI_SESSION_LIMIT', 5),
  }
}

export function publicAiPolicy(ai) {
  const policy=Object.fromEntries(['mode', 'provider', 'model', 'maxOutputTokens', 'maxSources', 'maxInputChars', 'maxSourceChars', 'timeoutMs', 'dailyLimit', 'sessionLimit'].filter(key => ai[key] !== undefined).map(key => [key, ai[key]]))
  // Preserve the already prepared Abacus reservation RPC without rewriting it.
  return policy.provider === 'gemini' ? policy : {...policy,mode:ai.mode === 'real' ? 'abacus' : ai.mode}
}
