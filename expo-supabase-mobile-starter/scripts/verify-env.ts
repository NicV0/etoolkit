import 'dotenv/config'

const required = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'] as const

let ok = true
for (const key of required) {
  if (!process.env[key] || String(process.env[key]).trim() === '') {
    console.error(`❌ Missing ${key} in .env`)
    ok = false
  }
}

if (ok) {
  console.log('✅ Env looks good')
  process.exit(0)
} else {
  process.exit(1)
}
