const fs = require('fs');
const path = require('path');

const localeDirectory = path.join(__dirname, '../src/i18n');
const french = JSON.parse(fs.readFileSync(path.join(localeDirectory, 'fr.json'), 'utf8'));
const english = JSON.parse(fs.readFileSync(path.join(localeDirectory, 'en.json'), 'utf8'));

const flattenKeys = (value, prefix = '') => Object.entries(value).flatMap(([key, entry]) => {
  const fullKey = prefix ? `${prefix}.${key}` : key;
  return entry && typeof entry === 'object' && !Array.isArray(entry)
    ? flattenKeys(entry, fullKey)
    : [fullKey];
});

const frenchKeys = new Set(flattenKeys(french));
const englishKeys = new Set(flattenKeys(english));
const missingInEnglish = [...frenchKeys].filter((key) => !englishKeys.has(key));
const missingInFrench = [...englishKeys].filter((key) => !frenchKeys.has(key));

if (missingInEnglish.length || missingInFrench.length) {
  console.error('Translation key sets differ.');
  if (missingInEnglish.length) console.error('Missing in en.json:', missingInEnglish.join(', '));
  if (missingInFrench.length) console.error('Missing in fr.json:', missingInFrench.join(', '));
  process.exit(1);
}

console.log(`i18n key sets match (${frenchKeys.size} keys).`);
