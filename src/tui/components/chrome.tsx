import React from 'react';
import { Box, Text } from 'ink';
import { headerTitle, palette } from '../theme.js';
import { colorRow, type Artwork } from '../art.js';

export function Header(options: { step: string; compact?: boolean }): React.JSX.Element {
  if (options.compact) {
    return <Text color={palette.cream} bold wrap="truncate">{headerTitle(options.step)}</Text>;
  }
  return (
    <Box borderStyle="single" borderColor={palette.brown} paddingX={1}>
      <Text color={palette.cream} bold>{headerTitle(options.step)}</Text>
    </Box>
  );
}

/** Footer lists only the shortcuts active on the current screen. */
export function Footer(options: { shortcuts: string[]; compact?: boolean }): React.JSX.Element {
  const line = options.shortcuts.join('  ·  ');
  if (options.compact) {
    return <Text color={palette.parchment} wrap="truncate">{line}</Text>;
  }
  return (
    <Box borderStyle="single" borderColor={palette.brown} paddingX={1}>
      <Text color={palette.parchment}>{line}</Text>
    </Box>
  );
}

export function Message(options: { kind: 'notice' | 'error'; text: string }): React.JSX.Element {
  const color = options.kind === 'error' ? palette.clay : palette.moss;
  const prefix = options.kind === 'error' ? 'Error: ' : 'Note: ';
  return (
    <Box marginTop={1}>
      <Text color={color} wrap="wrap">{`${prefix}${options.text}`}</Text>
    </Box>
  );
}

export function QuitDialog(options: { compact?: boolean }): React.JSX.Element {
  if (options.compact) {
    return (
      <Box flexDirection="column" borderStyle="double" borderColor={palette.gold} paddingX={2}>
        <Text color={palette.cream} bold>Quit setup?</Text>
        <Text color={palette.gold}>Enter: Continue (safe default) · Q: Quit</Text>
      </Box>
    );
  }
  return (
    <Box flexDirection="column" borderStyle="double" borderColor={palette.gold} paddingX={2} marginY={1}>
      <Text color={palette.cream} bold>Quit setup?</Text>
      <Text color={palette.parchment}>No files have been written. Continuing restores your exact drafts, focus, search and scroll.</Text>
      <Text color={palette.gold}>  Enter: Continue setup (safe default)   ·   Q: Quit without writing</Text>
    </Box>
  );
}

export function Avatar(options: { art: Artwork; truecolor: boolean }): React.JSX.Element {
  if (!options.truecolor) {
    return (
      <Box flexDirection="column">
        {options.art.mono.map((row, index) => (
          <Text key={index} color={palette.parchment}>{row}</Text>
        ))}
      </Box>
    );
  }
  return (
    <Box flexDirection="column">
      {options.art.cells.map((line, index) => (
        <Text key={index} wrap="truncate">{`${colorRow(line)}\x1b[0m`}</Text>
      ))}
    </Box>
  );
}
