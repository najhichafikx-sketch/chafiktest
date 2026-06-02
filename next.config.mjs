/** @type {import('next').NextConfig} */

// Validate required environment variables at build/startup time
const requiredVars = ['OPENROUTER_API_KEY', 'JWT_SECRET', 'ADMIN_PASSWORD'];
const optionalVars = [
  { key: 'NEXT_PUBLIC_SITE_URL', default: 'https://www.chafiktech.com' },
  { key: 'NEXT_PUBLIC_GA_ID', default: null },
  { key: 'DATABASE_URL', default: null }
];

const missing = requiredVars.filter(k => !process.env[k]);
const warnings = optionalVars.filter(v => !process.env[v.key]);

if (missing.length > 0) {
  console.error('\n========================================');
  console.error('  MISSING REQUIRED ENVIRONMENT VARIABLES');
  console.error('========================================\n');
  missing.forEach(k => console.error(`  ❌ ${k}\n`));
  console.error('  Set these in your .env.local or Vercel environment.\n');
  console.error('  The build will continue but features will be broken.\n');
}

if (warnings.length > 0) {
  console.warn('\n========================================');
  console.warn('  MISSING OPTIONAL ENVIRONMENT VARIABLES');
  console.warn('========================================\n');
  warnings.forEach(v => {
    console.warn(`  ⚠️  ${v.key}`);
    if (v.default) console.warn(`     Default: ${v.default}\n`);
  });
}

if (missing.length === 0 && warnings.length === 0) {
  console.log('\n✅ All environment variables configured.\n');
}

const nextConfig = {
  serverExternalPackages: ['jsonwebtoken'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
};

export default nextConfig;
