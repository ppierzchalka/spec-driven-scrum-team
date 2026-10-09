import React from 'react';
import { Box, Text } from 'ink';
import type { Key } from 'ink';
import { COMMITTED_MARKER, FOCUS_MARKER, IDLE_MARKER, palette } from '../theme.js';
import { fitCapped, measureCells, truncateCells, wrapLines } from '../layout.js';

export interface MenuItem {
  id: string;
  label: string;
  hint?: string;
  state?: 'committed' | 'checked' | 'unchecked' | 'plain';
}

/** Pure list navigation for arrows/Home/End/paging. Returns the new focused id. */
export function moveFocus(ids: readonly string[], current: string, key: Partial<Key>): string {
  if (ids.length === 0) return current;
  const index = Math.max(0, ids.indexOf(current));
  if (key.upArrow) return ids[Math.max(0, index - 1)];
  if (key.downArrow) return ids[Math.min(ids.length - 1, index + 1)];
  if (key.home) return ids[0];
  if (key.end) return ids[ids.length - 1];
  if (key.pageUp) return ids[Math.max(0, index - 10)];
  if (key.pageDown) return ids[Math.min(ids.length - 1, index + 10)];
  return current;
}

export interface TextEdit {
  value: string;
  cursor: number;
}

/**
 * Pure single-line editing: printable input (including pastes) inserts at the
 * cursor; Backspace/Delete/left/right/Home/End edit; Escape cancels.
 */
export function editText(edit: TextEdit, input: string, key: Partial<Key>): { edit: TextEdit; cancelled: boolean } {
  if (key.escape) return { edit, cancelled: true };
  let { value, cursor } = edit;
  const chars = [...value];
  cursor = Math.max(0, Math.min(cursor, chars.length));
  if (key.backspace) {
    if (cursor > 0) {
      chars.splice(cursor - 1, 1);
      cursor -= 1;
    }
    return { edit: { value: chars.join(''), cursor }, cancelled: false };
  }
  if (key.delete) {
    if (cursor < chars.length) chars.splice(cursor, 1);
    return { edit: { value: chars.join(''), cursor }, cancelled: false };
  }
  if (key.leftArrow) return { edit: { value, cursor: Math.max(0, cursor - 1) }, cancelled: false };
  if (key.rightArrow) return { edit: { value, cursor: Math.min(chars.length, cursor + 1) }, cancelled: false };
  if (key.home) return { edit: { value, cursor: 0 }, cancelled: false };
  if (key.end) return { edit: { value, cursor: chars.length }, cancelled: false };
  if (input && !key.ctrl && !key.meta && !key.tab && !key.return) {
    const insert = [...input].filter((ch) => ch >= ' ' || ch === '\t').join('');
    if (insert) {
      chars.splice(cursor, 0, ...[...insert]);
      cursor += [...insert].length;
      return { edit: { value: chars.join(''), cursor }, cancelled: false };
    }
  }
  return { edit, cancelled: false };
}

function stateMarker(item: MenuItem): string {
  if (item.state === 'committed') return COMMITTED_MARKER;
  if (item.state === 'checked') return '[x]';
  if (item.state === 'unchecked') return '[ ]';
  return ' ';
}

/**
 * Shared error allocation (single source): wrapped diagnostic blocks share
 * one capped display. `budget` already reserves chrome, fixed content,
 * notices and the actionable menu minimum — only remaining space is used.
 */
export interface ErrorAlloc {
  shown: string[];
  full: string[];
  capped: boolean;
}

export function allocateErrors(blocks: string[][], budget: number, width: number): ErrorAlloc {
  const full: string[] = [];
  for (const block of blocks) for (const line of block) full.push(line);
  const shown = fitCapped(full, budget, Math.max(20, width));
  return { shown, full, capped: full.length > shown.length };
}

/**
 * Rendered rows for one item. The focused row always shows its FULL label
 * and hint (wrapped) — the accessible detail route for truncated IDs/paths
 * at any density. Unfocused rows stay single-line truncated.
 */
export function itemRows(item: MenuItem, focused: boolean, width: number, compact: boolean, hintMode: 'all' | 'focused' | 'none' = compact ? 'focused' : 'all'): string[] {
  // The marker prefix stays glued to the first body chunk; continuations
  // indent beneath it so focus never flies alone on its own line.
  const prefix = `${focused ? FOCUS_MARKER : IDLE_MARKER} ${stateMarker(item)} `;
  const bodyWidth = Math.max(8, width - prefix.length);
  const showHint = hintMode === 'all' || (hintMode === 'focused' && focused);
  if (focused) {
    const rows = wrapLines(item.label, bodyWidth).map((row, index) => (index === 0 ? `${prefix}${row}` : `${' '.repeat(prefix.length)}${row}`));
    if (showHint && item.hint !== undefined && item.hint !== '') {
      for (const hintLine of wrapLines(item.hint, Math.max(1, width - 4))) rows.push(`    ${hintLine}`);
    }
    return rows;
  }
  const rows = [truncateCells(`${prefix}${item.label}`, width)];
  if (!compact && showHint && item.hint !== undefined) {
    rows.push(`    ${truncateCells(item.hint, Math.max(1, width - 4))}`);
  }
  return rows;
}

/**
 * Line-budget windowing: the visible index range always contains the focused
 * item and its full wrapped rows fit `viewportHeight` whenever possible.
 */
export function windowByLines(counts: readonly number[], focusedIndex: number, budget: number): { top: number; bottom: number } {
  const total = counts.length;
  if (total === 0) return { top: 0, bottom: 0 };
  const focus = Math.max(0, Math.min(focusedIndex, total - 1));
  let top = focus;
  let bottom = focus + 1;
  let used = counts[focus] ?? 1;
  // Expand upward first so earlier actions stay reachable, then downward.
  while (top > 0 && used + (counts[top - 1] ?? 1) <= Math.max(budget, 1)) {
    top -= 1;
    used += counts[top] ?? 1;
  }
  while (bottom < total && used + (counts[bottom] ?? 1) <= Math.max(budget, 1)) {
    used += counts[bottom] ?? 1;
    bottom += 1;
  }
  return { top, bottom };
}

export interface MenuGeometry {
  showAbove: boolean;
  showBelow: boolean;
  top: number;
  bottom: number;
  /** Rows the focused item may render without pushing actions out. */
  focusCap: number;
  /** True when the focused item's full rows exceed its cap. */
  capped: boolean;
}

/**
 * Complete menu geometry in one place (rendering and Space/detail gating
 * share it, so the detail action matches exactly what is capped on screen).
 */
export function menuGeometry(
  items: readonly MenuItem[],
  focusedId: string,
  width: number,
  compact: boolean,
  hintMode: 'all' | 'focused' | 'none',
  budget: number,
  bare = false,
): MenuGeometry & { counts: number[] } {
  const ids = items.map((item) => item.id);
  let focusedIndex = ids.indexOf(focusedId);
  if (focusedIndex < 0) focusedIndex = 0;
  const counts = bare
    ? items.map(() => 1)
    : items.map((item, index) => itemRows(item, index === focusedIndex, width, compact, hintMode).length);
  const room = Math.max(1, budget);
  let { top, bottom } = windowByLines(counts, focusedIndex, room);
  // Shrink the far side so the ↑/↓ indicators never push past the budget.
  // The focused item is never dropped: its full detail stays visible.
  let used = 0;
  for (let i = top; i < bottom; i += 1) used += counts[i] ?? 1;
  for (;;) {
    const indicators = (top > 0 ? 1 : 0) + (bottom < items.length ? 1 : 0);
    if (used + indicators <= room) break;
    if (bottom - 1 > focusedIndex && bottom - 1 - focusedIndex >= focusedIndex - top) {
      bottom -= 1;
      used -= counts[bottom] ?? 1;
    } else if (top < focusedIndex) {
      used -= counts[top] ?? 1;
      top += 1;
    } else break;
  }
  // A one/two-row menu cannot afford both indicators and its focused action.
  // Navigation still includes every item; prioritize the forward indicator.
  const showBelow = bottom < items.length && room >= 2;
  const showAbove = top > 0 && room >= (showBelow ? 3 : 2);
  const indicators = Number(showAbove) + Number(showBelow);
  let others = indicators;
  for (let i = top; i < bottom; i += 1) {
    if (i !== focusedIndex) others += counts[i] ?? 1;
  }
  const focusCap = Math.max(1, room - others);
  const full = counts[focusedIndex] ?? 1;
  return { top, bottom, focusCap, capped: full > focusCap, counts, showAbove, showBelow };
}

export function MenuList(options: {
  items: readonly MenuItem[];
  focusedId: string;
  scrollTop?: number;
  viewportHeight: number;
  width: number;
  /** Compact density: no unfocused hints — for 40-59 cols or short viewports. */
  compact?: boolean;
  /** Hint policy; 'none' keeps only full labels at the smallest viewports. */
  hintMode?: 'all' | 'focused' | 'none';
  /** Bare pre-formatted rows (detail pager): no markers, hints or re-wrap. */
  bare?: boolean;
}): React.JSX.Element {
  const ids = options.items.map((item) => item.id);
  let focusedIndex = ids.indexOf(options.focusedId);
  if (focusedIndex < 0) focusedIndex = 0;
  const compact = options.compact ?? false;
  const hintMode = options.hintMode ?? (compact ? 'focused' : 'all');
  const budget = Math.max(1, options.viewportHeight);
  const bare = options.bare ?? false;
  const { top, bottom, focusCap, showAbove, showBelow } = menuGeometry(options.items, options.focusedId, options.width, compact, hintMode, budget, bare);
  const above = top;
  const below = options.items.length - bottom;
  return (
    <Box flexDirection="column">
      {showAbove && <Text color={palette.parchment}>↑ {above} more above</Text>}
      {options.items.slice(top, bottom).map((item, offset) => {
        const index = top + offset;
        const focusedRow = index === focusedIndex;
        let rows = bare ? [item.label] : itemRows(item, focusedRow, options.width, compact, hintMode);
        // Cap an overlong focused item to its remaining rows (head + tail):
        // one giant value cannot push actions out of the viewport.
        if (focusedRow && rows.length > focusCap) {
          rows = fitCapped(rows, focusCap, options.width);
        }
        return (
          <Box key={item.id} flexDirection="column">
            {rows.map((row, rowIndex) => (
              <Text key={rowIndex} color={focusedRow ? (rowIndex === 0 ? palette.gold : palette.parchment) : rowIndex === 0 ? palette.cream : palette.parchment} bold={focusedRow && rowIndex === 0} wrap="truncate">
                {row}
              </Text>
            ))}
          </Box>
        );
      })}
      {showBelow && <Text color={palette.parchment}>↓ {below} more below</Text>}
    </Box>
  );
}

export function TextField(options: { value: string; cursor: number; focused: boolean; width: number; placeholder?: string }): React.JSX.Element {
  const chars = [...options.value];
  const cursor = Math.max(0, Math.min(options.cursor, chars.length));
  if (options.value === '' && options.placeholder) {
    return (
      <Box>
        <Text color={palette.parchment}>{truncateCells(options.placeholder, Math.max(1, options.width))}</Text>
      </Box>
    );
  }
  // Cursor-following horizontal window: long drafts stay navigable with
  // arrows instead of hiding the value past the viewport edge.
  const budget = Math.max(4, options.width);
  let start = 0;
  let end = chars.length;
  if (chars.length > budget) {
    const size = budget - 2;
    start = Math.max(0, Math.min(cursor - Math.floor(size / 2), chars.length - size));
    end = start + size;
  }
  const cutLeft = start > 0;
  const cutRight = end < chars.length;
  const window = chars.slice(start, end);
  const cursorInWindow = cursor - start;
  const before = window.slice(0, cursorInWindow).join('');
  const at = window[cursorInWindow] ?? ' ';
  const after = window.slice(cursorInWindow + 1).join('');
  const color = options.focused ? palette.cream : palette.parchment;
  return (
    <Box>
      <Text color={color}>
        {cutLeft ? '…' : ''}
        {before}
        {options.focused ? <Text backgroundColor={palette.gold} color="#1A1408">{at}</Text> : at}
        {after}
        {cutRight ? '…' : ''}
      </Text>
    </Box>
  );
}

export const EDIT_COMMIT_ID = 'edit:commit';
export const EDIT_CANCEL_ID = 'edit:cancel';
export const EDIT_DETAILS_ID = 'edit:details';

export function editActionIds(showDetails = false): string[] {
  return showDetails ? [EDIT_COMMIT_ID, EDIT_CANCEL_ID, EDIT_DETAILS_ID] : [EDIT_COMMIT_ID, EDIT_CANCEL_ID];
}

export function editActionItems(showDetails: boolean): MenuItem[] {
  const items: MenuItem[] = [
    { id: EDIT_COMMIT_ID, label: 'Commit', hint: 'Enter applies the draft' },
    { id: EDIT_CANCEL_ID, label: 'Cancel', hint: 'Enter discards only this draft' },
  ];
  if (showDetails) {
    items.push({ id: EDIT_DETAILS_ID, label: 'Error details', hint: 'Enter shows the full diagnostic' });
  }
  return items;
}

/**
 * Explicit keyboard-reachable Commit/Cancel rows for text drafts, plus an
 * Error details row whenever a diagnostic is capped. Cancel discards only
 * the local draft and restores the committed state; Esc stays the global
 * quit-safe snapshot on every screen.
 */
export function EditActions(options: { focusedId: string; width: number; hintMode?: 'all' | 'focused' | 'none'; showDetails?: boolean }): React.JSX.Element {
  const hintMode = options.hintMode ?? 'focused';
  const items = editActionItems(options.showDetails ?? false);
  const rows = hintMode === 'none' ? items.length : items.length + 1;
  return (
    <MenuList
      items={items}
      focusedId={options.focusedId}
      viewportHeight={rows}
      width={options.width}
      compact
      hintMode={hintMode}
    />
  );
}
