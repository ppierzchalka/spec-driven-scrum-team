import { describe, it, expect } from 'vitest';
import stringWidth from 'string-width';
import { loadArtwork, toAnsiTruecolor, toMono, hexToRgb } from './art.js';

describe('Toady artwork conversion', () => {
  it('measures both assets at 40 columns x 20 rows', () => {
    const art = loadArtwork();
    expect(art.rows).toBe(20);
    expect(art.cols).toBe(40);
    expect(art.mono).toHaveLength(20);
    for (const row of art.mono) expect(stringWidth(row)).toBe(40);
    expect(art.cells).toHaveLength(20);
    for (const line of art.cells) {
      expect(line).toHaveLength(40);
      expect(line.reduce((sum, cell) => sum + stringWidth(cell.glyph), 0)).toBe(40);
    }
  });

  it('maps all 800 style entries to cells without %c or CSS literals', () => {
    const art = loadArtwork();
    const flat = art.cells.flat();
    expect(flat).toHaveLength(800);
    for (const cell of flat) {
      expect(cell.glyph).not.toContain('%c');
      expect(cell.fg).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(cell.bg).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
    const ansi = toAnsiTruecolor(art);
    expect(ansi).not.toContain('%c');
    expect(ansi).not.toContain('color:');
    expect(ansi).not.toContain('background:');
    expect(ansi).toContain('\x1b[38;2;');
    expect(ansi).toContain('\x1b[48;2;');
  });

  it('renders monochrome ASCII without ANSI or CSS', () => {
    const art = loadArtwork();
    const mono = toMono(art);
    expect(mono).not.toContain('\x1b');
    expect(mono).not.toContain('%c');
    expect(mono.split('\n')).toHaveLength(20);
  });

  it('decodes hex colors to rgb triples', () => {
    expect(hexToRgb('#bb984a')).toEqual([187, 152, 74]);
    expect(hexToRgb('#06050a')).toEqual([6, 5, 10]);
  });
});
