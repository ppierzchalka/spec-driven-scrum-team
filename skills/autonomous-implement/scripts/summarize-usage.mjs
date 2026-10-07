#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Consume user/runtime-normalized aggregates, never full transcripts or credentials.
export function summarizeUsage(input) {
  if (!Array.isArray(input)) throw new Error('Expected an array of normalized usage rows');
  const strings = ['task', 'packet', 'stage', 'model', 'provider', 'effort', 'source', 'currency', 'outcome'];
  const numbers = ['elapsedSeconds', 'dispatches', 'reviewPasses', 'inputTokens', 'outputTokens', 'cachedInputTokens', 'reasoningTokens', 'cost'];
  const rows = input.map(row => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('Invalid usage row');
    const result = {};
    for (const key of strings) if (row[key] !== undefined) {
      if (typeof row[key] !== 'string' || row[key].length > 160 || /[\r\n]/.test(row[key])) throw new Error('Invalid aggregate identifier: ' + key);
      result[key] = row[key];
    }
    for (const key of numbers) {
      const value = row[key];
      if (value !== undefined && value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value < 0)) throw new Error('Invalid numeric aggregate: ' + key);
      result[key] = value ?? null;
    }
    if ((result.cost !== null && !result.currency) || (numbers.some(key => result[key] !== null) && !result.source)) throw new Error('Observed aggregates require source; costs also require currency');
    return result;
  });
  const totals = Object.fromEntries(numbers.filter(key => key !== 'cost').map(key => {
    const known = rows.filter(row => row[key] !== null);
    return [key, { knownTotal: known.length ? known.reduce((sum, row) => sum + row[key], 0) : null, observedRows: known.length, complete: rows.length > 0 && known.length === rows.length }];
  }));
  const costs = {};
  for (const row of rows) if (row.cost !== null) costs[row.currency] = (costs[row.currency] ?? 0) + row.cost;
  return { rows, totals, costs, costComplete: rows.length > 0 && rows.every(row => row.cost !== null), note: 'Separate token categories may overlap; do not add cached/reasoning to input/output. Summed elapsed time is not run wall-clock time. Unknown is not zero. Whitelisted labels must still be sanitized by the caller.' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: node summarize-usage.mjs <normalized-aggregates.json>');
    process.stdout.write(JSON.stringify(summarizeUsage(JSON.parse(readFileSync(process.argv[2], 'utf8'))), null, 2) + '\n');
  } catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}
