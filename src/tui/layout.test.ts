import { describe, it, expect } from 'vitest';
import {
  decideLayout,
  fitCapped,
  footerRows,
  headerRows,
  marginRows,
  measureCells,
  supportsTruecolor,
  truncateCells,
  visibleWindow,
  wrapLines,
} from './layout.js';

describe('terminal layout', () => {
  it('keeps the focused action or error identity in a two-row cap', () => {
    expect(fitCapped(['> Install into /exact', 'continued target', 'install hint'], 2, 40)).toEqual(['> Install into /exact', '…']);
    expect(fitCapped(['Error: ENOENT', 'long path', 'path suffix'], 2, 40)).toEqual(['Error: ENOENT', '…']);
  });
  it('refuses interactive startup below 40x8', () => {
    expect(decideLayout({ columns: 39, rows: 40, artCols: 40, artRows: 20 }).mode).toBe('below-minimum');
    expect(decideLayout({ columns: 40, rows: 7, artCols: 40, artRows: 20 }).mode).toBe('below-minimum');
    expect(decideLayout({ columns: 40, rows: 8, artCols: 40, artRows: 20 }).mode).not.toBe('below-minimum');
  });

  it('hides the avatar below width 100 and compacts small viewports', () => {
    expect(decideLayout({ columns: 99, rows: 24, artCols: 40, artRows: 20 }).avatar).toBe(false);
    expect(decideLayout({ columns: 59, rows: 12, artCols: 40, artRows: 20 }).mode).toBe('compact');
    expect(decideLayout({ columns: 60, rows: 12, artCols: 40, artRows: 20 }).mode).toBe('compact');
    expect(decideLayout({ columns: 60, rows: 13, artCols: 40, artRows: 20 }).mode).toBe('standard');
    expect(decideLayout({ columns: 59, rows: 30, artCols: 40, artRows: 20 }).mode).toBe('compact');
    expect(decideLayout({ columns: 80, rows: 11, artCols: 40, artRows: 20 }).mode).toBe('compact');
  });

  it('shows the avatar only when the measured asset plus shell and menu fit', () => {
    expect(decideLayout({ columns: 120, rows: 45, artCols: 40, artRows: 20 })).toMatchObject({ mode: 'wide', avatar: true });
    // Width >= 100 alone does not guarantee a fit: too few rows hides it.
    expect(decideLayout({ columns: 120, rows: 12, artCols: 40, artRows: 20 }).avatar).toBe(false);
    expect(decideLayout({ columns: 100, rows: 27, artCols: 40, artRows: 20 }).avatar).toBe(false);
    expect(decideLayout({ columns: 100, rows: 28, artCols: 40, artRows: 20 })).toMatchObject({ mode: 'wide', avatar: true });
    // Width >= 100 alone does not guarantee a fit: too few rows hides it.
    expect(decideLayout({ columns: 120, rows: 12, artCols: 40, artRows: 20 }).avatar).toBe(false);
    // A wider-than-real asset hides the avatar instead of cropping it.
    expect(decideLayout({ columns: 100, rows: 45, artCols: 90, artRows: 20 }).avatar).toBe(false);
    expect(decideLayout({ columns: 80, rows: 30, artCols: 40, artRows: 20 })).toMatchObject({ mode: 'standard', avatar: false });
  });

  it('accounts chrome rows by density', () => {
    expect(headerRows(false)).toBe(3);
    expect(footerRows(false)).toBe(3);
    expect(marginRows(false)).toBe(2);
    expect(headerRows(true)).toBe(1);
    expect(footerRows(true)).toBe(1);
    expect(marginRows(true)).toBe(0);
  });

  it('wraps by display cells, splitting only overlong words', () => {
    expect(wrapLines('a bb ccc', 4)).toEqual(['a bb', 'ccc']);
    expect(wrapLines('averylongwordhere', 4)).toEqual(['aver', 'ylon', 'gwor', 'dher', 'e']);
    expect(wrapLines('a  b', 10)).toEqual(['a b']);
    expect(wrapLines('╶╵▇', 2)).toEqual(['╶╵', '▇']);
  });

  it('measures display cells and truncates without splitting', () => {
    expect(measureCells('╶╵▇')).toBe(3);
    expect(truncateCells('analyst: openai/gpt-6.1-sol @ medium', 20)).toBe('analyst: openai/gpt…');
    expect(truncateCells('short', 20)).toBe('short');
  });

  it('windows long lists inside the viewport', () => {
    const items = Array.from({ length: 30 }, (_, i) => `item-${i}`);
    const { visible, top } = visibleWindow(items, 25, 10);
    expect(visible).toHaveLength(10);
    expect(visible).toContain('item-25');
    expect(top).toBeGreaterThan(0);
    expect(visibleWindow(items, 0, 50).visible).toHaveLength(30);
  });

  it('detects truecolor from more than COLORTERM and honors NO_COLOR', () => {
    expect(supportsTruecolor({ NO_COLOR: '1', COLORTERM: 'truecolor' })).toBe(false);
    expect(supportsTruecolor({ COLORTERM: 'truecolor' })).toBe(true);
    expect(supportsTruecolor({ TERM_PROGRAM: 'WezTerm' })).toBe(true);
    expect(supportsTruecolor({ TERM: 'xterm-256color' })).toBe(false);
    expect(supportsTruecolor({})).toBe(false);
  });
});
