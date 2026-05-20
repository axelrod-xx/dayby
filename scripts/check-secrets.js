const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');

const secretPatterns = [
  { name: 'Supabase publishable key', pattern: /sb_publishable_[A-Za-z0-9_-]+/ },
  { name: 'Supabase service role key', pattern: /service_role_[A-Za-z0-9_-]+/ },
  { name: 'Private key block', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'R2 secret assignment', pattern: /R2_SECRET_ACCESS_KEY\s*=\s*\S+/ },
  {
    name: 'Generic secret assignment',
    pattern: /(SECRET_ACCESS_KEY|CLIENT_SECRET|client_secret)\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{16,}/,
  },
];

const allowedMatches = [
  {
    file: '.env.example',
    pattern: /^EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$/,
  },
  {
    file: 'docs/USER_ACTIONS.md',
    pattern: /^R2_SECRET_ACCESS_KEY=$/,
  },
  {
    file: 'scripts/check-secrets.js',
    pattern: /R2_SECRET_ACCESS_KEY/,
  },
];

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

const findings = [];

for (const file of files) {
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  content.split(/\r?\n/).forEach((line, index) => {
    for (const { name, pattern } of secretPatterns) {
      if (!pattern.test(line)) {
        continue;
      }

      const allowed = allowedMatches.some((entry) => entry.file === file && entry.pattern.test(line));
      if (!allowed) {
        findings.push(`${file}:${index + 1} ${name}`);
      }
    }
  });
}

if (findings.length > 0) {
  console.error('Potential secrets found:');
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log('No tracked secrets detected.');
