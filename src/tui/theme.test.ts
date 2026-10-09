import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { headerTitle, palette } from './theme.js';

function luminance(hex: string): number {
  const clean = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => {
    const v = Number.parseInt(clean.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

export function contrastRatio(a: string, b: string): number {
  const hi = Math.max(luminance(a), luminance(b));
  const lo = Math.min(luminance(a), luminance(b));
  return (hi + 0.05) / (lo + 0.05);
}

describe('palette contrast', () => {
  it('keeps primary text, hints and focus readable on dark terminals', () => {
    // Terminal background is unknown; dark is the common case and every
    // meaning is also carried by text markers (>, •, [x], Error:/Note:).
    expect(contrastRatio(palette.cream, '#000000')).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(palette.parchment, '#000000')).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(palette.gold, '#000000')).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(palette.brown, '#000000')).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(palette.clay, '#000000')).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(palette.moss, '#000000')).toBeGreaterThanOrEqual(3);
    expect(headerTitle('review')).toContain('Step 4 of 4');
  });

  it('writes the measured contrast table as evidence', () => {
    const dir = process.env.EVIDENCE_DIR ?? '/tmp/opencode/evidence';
    mkdirSync(dir, { recursive: true });
    const lines = ['# Palette contrast (WCAG relative ratios)', ''];
    for (const [name, hex] of Object.entries(palette)) {
      lines.push(`${name} ${hex} on black: ${contrastRatio(hex, '#000000').toFixed(2)}`);
    }
    lines.push('', 'All essential meaning is also carried by text markers, so screens stay readable without color.');
    writeFileSync(join(dir, 'contrast.txt'), lines.join('\n') + '\n');
  });
});
