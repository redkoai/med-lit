/**
 * One-off test: fetch + analyze one article using env API key.
 * Usage: npx tsx scripts/test-analyze.ts [url]
 * Requires .env.local with EXPO_PUBLIC_ANTHROPIC_API_KEY and optionally EXPO_PUBLIC_UNPAYWALL_EMAIL.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load .env.local or .env into process.env (if key not already set)
function loadEnv() {
  if (process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) return;
  const root = join(__dirname, '..');
  for (const file of ['.env.local', '.env']) {
    const path = join(root, file);
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf-8');
      for (const line of content.split('\n')) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (m) {
          const key = m[1].trim();
          let val = m[2].trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
            val = val.slice(1, -1);
          process.env[key] = val;
        }
      }
      console.log(`Loaded env from ${file}\n`);
      return;
    }
  }
  throw new Error(
    'No EXPO_PUBLIC_ANTHROPIC_API_KEY. Set it in .env.local or pass it in the environment.'
  );
}

loadEnv();

const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const unpaywallEmail = process.env.EXPO_PUBLIC_UNPAYWALL_EMAIL || 'medlit@example.com';

if (!apiKey || apiKey.startsWith('sk-ant-...')) {
  console.error('Missing or placeholder EXPO_PUBLIC_ANTHROPIC_API_KEY in .env.local');
  process.exit(1);
}

const testUrl =
  process.argv[2] ||
  'https://www.thelancet.com/journals/landig/article/piis2589-7500%2820%2930017-0/fulltext';

async function main() {
  const { parseArticleUrl, hasValidIdentifier, formatIdentifierLabel } = await import(
    '../src/services/urlParser'
  );
  const { fetchArticle } = await import('../src/services/articleFetcher');
  const { analyzeArticle } = await import('../src/services/claudeAnalyzer');

  console.log('URL:', testUrl);
  const identifier = parseArticleUrl(testUrl);
  console.log('Parsed:', formatIdentifierLabel(identifier), identifier.doi ? `(${identifier.doi})` : '');
  if (!hasValidIdentifier(identifier)) {
    console.error('Could not extract PMID, DOI, or PMC ID from URL.');
    process.exit(1);
  }

  console.log('\n1. Fetching article...');
  const article = await fetchArticle(identifier, {
    unpaywallEmail,
    sciHubEnabled: false,
    sciHubMirror: '',
    onProgress: (msg) => console.log('   ', msg),
  });
  console.log('   Title:', article.title);
  console.log('   Journal:', article.journal);
  console.log('   Fetch source:', article.fetchSource);
  console.log('   Abstract length:', article.abstract?.length ?? 0);

  console.log('\n2. Analyzing with Claude...');
  const model = 'claude-sonnet-4-6';
  const analysis = await analyzeArticle(
    article,
    identifier,
    apiKey,
    model,
    (msg) => console.log('   ', msg)
  );

  console.log('\n--- MedLit analysis ---');
  console.log('Accuracy score:', analysis.accuracyScore);
  console.log('Bias score:', analysis.biasScore);
  console.log('Methods score:', analysis.methodsScore);
  console.log('Summary (one-liner):', analysis.summary?.oneLiner ?? 'N/A');
  console.log('Verdict:', analysis.verdict?.recommendation ?? 'N/A');
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
