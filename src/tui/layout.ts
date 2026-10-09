import stringWidth from 'string-width';

export const MIN_COLUMNS = 40;
export const MIN_ROWS = 8;
export const AVATAR_MIN_WIDTH = 100;
/** Chrome rows around the body: bordered header (3) + footer (3) + margins (2). */
export const CHROME_ROWS = 8;
/** Minimum menu width beside the avatar plus gaps. */
export const MENU_MIN_WIDTH = 44;

export function headerRows(compact: boolean): number {
  return compact ? 1 : 3;
}

export function footerRows(compact: boolean): number {
  return compact ? 1 : 3;
}

/** Vertical margins: body top + footer top (zero in compact density). */
export function marginRows(compact: boolean): number {
  return compact ? 0 : 2;
}

export function measureCells(text: string): number {
  return stringWidth(text);
}

/** Truncate to a display-cell budget, marking the cut. Never splits cells. */
export function truncateCells(text: string, maxCells: number): string {
  if (maxCells <= 0) return '';
  if (stringWidth(text) <= maxCells) return text;
  if (maxCells === 1) return '…';
  let used = 0;
  let out = '';
  for (const ch of text) {
    const w = stringWidth(ch);
    if (used + w > maxCells - 1) break;
    out += ch;
    used += w;
  }
  return out + '…';
}

export type LayoutMode = 'below-minimum' | 'compact' | 'standard' | 'wide';

export interface ResolvedLayout {
  mode: LayoutMode;
  /** Avatar renders left of the menu only in wide mode; never cropped. */
  avatar: boolean;
  /** Compact density for small viewports; wide/standard otherwise. */
  density: 'compact' | 'standard';
}

export interface LayoutInput {
  columns: number;
  rows: number;
  artCols: number;
  artRows: number;
}

export function decideLayout(input: LayoutInput): ResolvedLayout {
  const { columns, rows, artCols, artRows } = input;
  if (columns < MIN_COLUMNS || rows < MIN_ROWS) return { mode: 'below-minimum', avatar: false, density: 'compact' };
  // Wide needs the full asset plus real chrome (bordered header/footer,
  // margins); otherwise the avatar hides instead of cropping or pushing.
  const fitsSideBySide = columns >= AVATAR_MIN_WIDTH && columns >= artCols + MENU_MIN_WIDTH + 3 && rows >= artRows + CHROME_ROWS;
  if (fitsSideBySide) return { mode: 'wide', avatar: true, density: 'standard' };
  // Compact covers 40-59 cols or short viewports. The row threshold is 12
  // (not 11): a 12-row terminal cannot fit standard chrome plus content, and
  // the mandatory size matrix requires 60x12 to fit exactly.
  if (columns <= 59 || rows <= 12) return { mode: 'compact', avatar: false, density: 'compact' };
  return { mode: 'standard', avatar: false, density: 'standard' };
}

/** Greedy word wrap by display cells; overlong words split by cells. */
export function wrapLines(text: string, width: number): string[] {  const w = Math.max(1, width);
  const out: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    let used = 0;
    const flush = () => {
      out.push(line);
      line = '';
      used = 0;
    };
    const pushWord = (word: string, wordWidth: number) => {
      if (used > 0 && used + 1 + wordWidth > w) flush();
      if (used > 0) {
        line += ' ';
        used += 1;
      }
      line += word;
      used += wordWidth;
    };
    for (const word of paragraph.split(/\s+/).filter((part) => part !== '')) {
      const wordWidth = stringWidth(word);
      if (wordWidth > w) {
        if (used > 0) flush();
        let chunk = '';
        let chunkWidth = 0;
        for (const ch of word) {
          const cw = stringWidth(ch);
          if (chunkWidth + cw > w) {
            out.push(chunk);
            chunk = '';
            chunkWidth = 0;
          }
          chunk += ch;
          chunkWidth += cw;
        }
        line = chunk;
        used = chunkWidth;
        continue;
      }
      pushWord(word, wordWidth);
    }
    out.push(line);
  }
  return out;
}

/** Visible window of a long list inside the viewport. */
export function visibleWindow<T>(items: readonly T[], focusedIndex: number, viewportHeight: number): { visible: readonly T[]; top: number } {
  const height = Math.max(1, viewportHeight);
  if (items.length <= height) return { visible: items, top: 0 };
  const top = Math.min(Math.max(0, focusedIndex - Math.floor(height / 2)), items.length - height);
  return { visible: items.slice(top, top + height), top };
}

/** Truecolor when the terminal advertises it; never COLORTERM alone. */
export function supportsTruecolor(env: NodeJS.ProcessEnv = process.env): boolean {
  if ('NO_COLOR' in env) return false;
  const colorterm = (env.COLORTERM ?? '').toLowerCase();
  if (colorterm === 'truecolor' || colorterm === '24bit') return true;
  const program = (env.TERM_PROGRAM ?? '').toLowerCase();
  if (['iterm.app', 'wezterm', 'vscode', 'ghostty', 'kitty', 'alacritty', 'hyper'].includes(program)) return true;
  if ((env.TERM ?? '').toLowerCase().includes('truecolor') || (env.TERM ?? '').toLowerCase().includes('24bit')) return true;
  return false;
}

/**
 * Cap wrapped lines to a row budget without hiding the head or the tail:
 * overlong blocks keep their first lines, an ellipsis, and their last line
 * (error kind + offending path tail). Returns all lines when they fit.
 */
export function fitCapped(lines: readonly string[], budget: number, width: number): string[] {
  const room = Math.max(1, budget);
  if (lines.length <= room) return [...lines];
  // A single remaining row names the problem (head); more room keeps the
  // head, an ellipsis, and the tail (e.g. error kind + offending path end).
  if (room === 1) return [truncateCells(lines[0] ?? '', Math.max(1, width))];
  // Two rows cannot hold head + ellipsis + tail. Keep the action/error
  // identity rather than replacing its focus marker or diagnostic kind.
  if (room === 2) return [lines[0] ?? '', '…'];
  const head = lines.slice(0, room - 2);
  return [...head, '…', lines[lines.length - 1] ?? ''];
}
