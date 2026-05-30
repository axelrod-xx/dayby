const fs = require('fs');
const path = require('path');

const messagesPath = path.join(__dirname, '..', 'src', 'lib', 'i18n', 'messages.ts');
const source = fs.readFileSync(messagesPath, 'utf8');

const locales = ['ja', 'ko'];
const allowedIdenticalKeys = new Set([
  'auth.testAccount',
  'common.appName',
  'common.language.en',
  'common.language.ja',
  'common.language.ko',
  'common.ok',
  'groupCreate.namePlaceholder',
  'groupDetail.ourMonth',
  'groupJoin.codePlaceholder',
  'monthly.made',
  'monthly.endCopy',
  'trim.selectedMeta',
]);

function extractObject(exportName) {
  const marker = `export const ${exportName} =`;
  const markerIndex = source.indexOf(marker);

  if (markerIndex < 0) {
    throw new Error(`Could not find ${exportName} catalog.`);
  }

  const start = source.indexOf('{', markerIndex);
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      continue;
    }

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;

      if (depth === 0) {
        const literal = source.slice(start, index + 1);
        return Function(`"use strict"; return (${literal});`)();
      }
    }
  }

  throw new Error(`Could not parse ${exportName} catalog.`);
}

function isPlural(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof value.one === 'string' &&
    typeof value.other === 'string'
  );
}

function valuesFor(value) {
  return isPlural(value) ? [value.one, value.other] : [value];
}

const en = extractObject('en');
const failures = [];

for (const locale of locales) {
  const catalog = extractObject(locale);
  const enKeys = Object.keys(en).sort();
  const localeKeys = Object.keys(catalog).sort();

  const missing = enKeys.filter((key) => !localeKeys.includes(key));
  const extra = localeKeys.filter((key) => !enKeys.includes(key));

  for (const key of missing) {
    failures.push(`${locale}: missing key ${key}`);
  }

  for (const key of extra) {
    failures.push(`${locale}: extra key ${key}`);
  }

  for (const key of enKeys) {
    if (!(key in catalog)) {
      continue;
    }

    const enValue = en[key];
    const localeValue = catalog[key];

    if (isPlural(enValue) !== isPlural(localeValue)) {
      failures.push(`${locale}: plural shape mismatch at ${key}`);
      continue;
    }

    for (const value of valuesFor(localeValue)) {
      if (typeof value !== 'string' || value.trim().length === 0) {
        failures.push(`${locale}: empty translation at ${key}`);
      }
    }

    if (allowedIdenticalKeys.has(key)) {
      continue;
    }

    const enValues = valuesFor(enValue);
    const localeValues = valuesFor(localeValue);
    localeValues.forEach((value, index) => {
      if (value === enValues[index]) {
        failures.push(`${locale}: likely untranslated value at ${key}`);
      }
    });
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('i18n catalogs look good.');
