import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['node_modules/**', 'dist/**'],
    projects: [
      {
        extends: true,
        test: {
          name: 'fast',
          include: ['src/**/*.test.ts', 'scripts/test-support/**/*.test.mjs'],
          exclude: ['src/cli/launch.test.ts', 'src/cli/freshLaunch.test.ts', 'src/tui/run.test.ts'],
        },
      },
      {
        extends: true,
        test: { name: 'rendered', include: ['src/**/*.test.tsx', 'src/tui/run.test.ts'] },
      },
      {
        extends: true,
        test: {
          name: 'release',
          include: ['src/cli/launch.test.ts', 'src/cli/freshLaunch.test.ts'],
          fileParallelism: false,
        },
      },
    ],
  },
});
