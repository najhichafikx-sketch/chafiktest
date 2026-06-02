const REQUIRED_ENV_VARS = [
  { key: 'OPENROUTER_API_KEY', description: 'OpenRouter API key for AI content generation', url: 'https://openrouter.ai/keys' },
  { key: 'JWT_SECRET', description: 'Secret key for JWT token signing', url: null },
  { key: 'ADMIN_PASSWORD', description: 'Password for admin panel access', url: null }
];

const OPTIONAL_ENV_VARS = [
  { key: 'NEXT_PUBLIC_SITE_URL', description: 'Public site URL (defaults to https://www.chafiktech.com)', url: null, default: 'https://www.chafiktech.com' },
  { key: 'NEXT_PUBLIC_GA_ID', description: 'Google Analytics 4 measurement ID', url: 'https://analytics.google.com' },
  { key: 'DATABASE_URL', description: 'Neon PostgreSQL connection string', url: 'https://neon.tech' }
];

export function validateEnvironment() {
  const missing = [];
  const warnings = [];

  for (const v of REQUIRED_ENV_VARS) {
    if (!process.env[v.key]) {
      missing.push(v);
    }
  }

  for (const v of OPTIONAL_ENV_VARS) {
    if (!process.env[v.key]) {
      warnings.push(v);
    }
  }

  if (missing.length > 0) {
    console.error('\n========================================');
    console.error('  MISSING REQUIRED ENVIRONMENT VARIABLES');
    console.error('========================================\n');
    for (const v of missing) {
      console.error(`  ❌ ${v.key}`);
      console.error(`     ${v.description}`);
      if (v.url) console.error(`     Get it at: ${v.url}`);
      console.error();
    }
    console.error('The application will start but these features will be disabled.\n');
  }

  if (warnings.length > 0) {
    console.warn('\n========================================');
    console.warn('  MISSING OPTIONAL ENVIRONMENT VARIABLES');
    console.warn('========================================\n');
    for (const v of warnings) {
      console.warn(`  ⚠️  ${v.key}`);
      console.warn(`     ${v.description}`);
      if (v.default) console.warn(`     Default: ${v.default}`);
      if (v.url) console.warn(`     Set up at: ${v.url}`);
      console.warn();
    }
  }

  if (missing.length === 0 && warnings.length === 0) {
    console.log('\n✅ All environment variables configured.\n');
  }

  return { missing, warnings };
}

export function getEnvStatus() {
  const all = [...REQUIRED_ENV_VARS, ...OPTIONAL_ENV_VARS];
  return all.map(v => ({
    key: v.key,
    set: !!process.env[v.key],
    value: process.env[v.key] || null,
    description: v.description,
    required: REQUIRED_ENV_VARS.includes(v)
  }));
}
