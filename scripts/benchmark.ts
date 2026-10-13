import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Judgment = 'low' | 'some_concerns' | 'high' | 'unclear' | 'not_applicable';
interface DomainResult { id: string; medlit: Judgment; expert: Judgment }
interface BenchmarkCase { id: string; design: string; coverage: 'full_text' | 'abstract_only'; domains: DomainResult[] }
interface BenchmarkFile { schemaVersion: string; cases: BenchmarkCase[] }

function wilson(successes: number, total: number): string {
  if (!total) return 'n/a';
  const z = 1.96;
  const p = successes / total;
  const denominator = 1 + z * z / total;
  const center = (p + z * z / (2 * total)) / denominator;
  const margin = z * Math.sqrt((p * (1 - p) + z * z / (4 * total)) / total) / denominator;
  return `${((center - margin) * 100).toFixed(1)}%–${((center + margin) * 100).toFixed(1)}%`;
}

const file = resolve(process.argv[2] || 'benchmarks/expert-review-template.json');
const parsed = JSON.parse(readFileSync(file, 'utf8')) as BenchmarkFile;
assert.equal(parsed.schemaVersion, '1.0.0');
assert.ok(Array.isArray(parsed.cases));

const domains = parsed.cases.flatMap((item) => item.domains ?? []);
if (domains.length === 0) {
  console.log('No completed expert-reviewed domains were supplied. No validation claim can be made.');
  process.exitCode = 2;
} else {
  const rank: Record<Judgment, number | null> = {
    low: 0,
    some_concerns: 1,
    high: 2,
    unclear: null,
    not_applicable: null,
  };
  const exact = domains.filter((item) => item.medlit === item.expert).length;
  const comparable = domains.filter((item) => rank[item.medlit] != null && rank[item.expert] != null);
  const overcalls = comparable.filter((item) => (rank[item.medlit] as number) > (rank[item.expert] as number)).length;
  const undercalls = comparable.filter((item) => (rank[item.medlit] as number) < (rank[item.expert] as number)).length;
  const percent = (value: number, total: number) => total ? `${(value / total * 100).toFixed(1)}%` : 'n/a';

  console.log(`Cases: ${parsed.cases.length}`);
  console.log(`Domains: ${domains.length}`);
  console.log(`Exact agreement: ${exact}/${domains.length} (${percent(exact, domains.length)})`);
  console.log(`Exact-agreement 95% Wilson interval: ${wilson(exact, domains.length)}`);
  console.log(`Comparable determinate domains: ${comparable.length}`);
  console.log(`MedLit overcalls: ${overcalls}/${comparable.length} (${percent(overcalls, comparable.length)})`);
  console.log(`MedLit undercalls: ${undercalls}/${comparable.length} (${percent(undercalls, comparable.length)})`);
  for (const [label, cases] of Object.entries(Object.groupBy(parsed.cases, (item) => `${item.design} / ${item.coverage}`))) {
    const stratum = (cases ?? []).flatMap((item) => item.domains ?? []);
    const matches = stratum.filter((item) => item.medlit === item.expert).length;
    console.log(`Stratum ${label}: ${matches}/${stratum.length} exact (${percent(matches, stratum.length)}; 95% CI ${wilson(matches, stratum.length)})`);
  }
  console.log('Do not externalize these results without the frozen protocol, sample definition, reviewer qualifications, and disagreement policy.');
}
