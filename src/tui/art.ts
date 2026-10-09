import stringWidth from 'string-width';
import { toadyImg, toadyImgColor } from '../toady-img.js';

export interface ArtCell {
  glyph: string;
  fg: string;
  bg: string;
}

export interface Artwork {
  /** Monochrome ASCII rows (40x20). */
  mono: string[];
  /** Truecolor cells (20 rows of 40 cells). */
  cells: ArtCell[][];
  cols: number;
  rows: number;
}

function parseStyle(style: string): { fg: string; bg: string } {
  let fg = '#FFFFFF';
  let bg = '#000000';
  let transparent = false;
  for (const part of style.split(';')) {
    const [key, value] = part.split(':');
    if (key === 'color') {
      if (value === 'transparent') transparent = true;
      else if (value) fg = value;
    } else if (key === 'background' && value) bg = value;
  }
  // A transparent foreground shows the background (spacing glyph); render it
  // in the background color so no stray mark appears.
  if (transparent) fg = bg;
  return { fg, bg };
}

/**
 * Convert the browser `%c` + CSS artwork into native styled cells.
 * `toadyImgColor[0]` holds 20 rows of 40 `%c` markers interleaved with 40
 * glyphs; the remaining 800 entries are per-glyph `color:/background:` data.
 * Never prints `%c` or CSS literally and never executes CSS.
 */
export function loadArtwork(): Artwork {
  const mono = toadyImg.split('\n').filter((row, index, all) => !(index === 0 && row === '') && !(index === all.length - 1 && row === ''));
  const [glyphBlob, ...styles] = toadyImgColor;
  const glyphRows = glyphBlob.split('\n');
  if (glyphRows.length !== 20) throw new Error(`Toady color artwork must have 20 rows, found ${glyphRows.length}`);
  if (styles.length !== 800) throw new Error(`Toady color artwork must have 800 style entries, found ${styles.length}`);
  const cells: ArtCell[][] = [];
  let cursor = 0;
  glyphRows.forEach((row, rowIndex) => {
    const markers = row.match(/%c/g)?.length ?? 0;
    if (markers !== 40) throw new Error(`Toady color artwork row ${rowIndex} must have 40 %c markers, found ${markers}`);
    const glyphs = row.split('%c').filter((part) => part !== '');
    if (glyphs.length !== 40) throw new Error(`Toady color artwork row ${rowIndex} must have 40 glyphs, found ${glyphs.length}`);
    const line: ArtCell[] = glyphs.map((glyph) => {
      const style = styles[cursor++];
      if (typeof style !== 'string') throw new Error(`Toady color artwork entry ${cursor - 1} must be a style string`);
      const { fg, bg } = parseStyle(style);
      return { glyph, fg, bg };
    });
    cells.push(line);
  });
  const cols = Math.max(...cells.map((line) => line.reduce((sum, cell) => sum + stringWidth(cell.glyph), 0)));
  return { mono, cells, cols, rows: cells.length };
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((ch) => ch + ch).join('') : clean;
  const value = Number.parseInt(full, 16);
  if (!Number.isFinite(value) || full.length !== 6) return [255, 255, 255];
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function fgAnsi(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `\x1b[38;2;${r};${g};${b}m`;
}

function bgAnsi(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `\x1b[48;2;${r};${g};${b}m`;
}

/** Plain ANSI truecolor rendering for tests/evidence (no CSS passthrough). */
export function toAnsiTruecolor(art: Artwork): string {
  return art.cells.map((line) => colorRow(line) + '\x1b[0m').join('\n');
}

/**
 * One row as a single ANSI string. Rendered as a single Ink text node so the
 * row measures exactly its display cells and never wraps mid-row (nested
 * per-glyph nodes can reflow inside flex layouts).
 */
export function colorRow(line: ArtCell[]): string {
  return line.map((cell) => `${bgAnsi(cell.bg)}${fgAnsi(cell.fg)}${cell.glyph}`).join('');
}

/** Monochrome ASCII rendering for limited colors and NO_COLOR. */
export function toMono(art: Artwork): string {
  return art.mono.join('\n');
}
