/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "src",
  testMatch: ["**/__tests__/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  clearMocks: true,
  // NOTE: isolatedModules is intentionally NOT enabled here — with Prisma 7's
  // dynamic import() of its wasm query compiler, per-file isolated transpilation
  // breaks the CJS/ESM interop and dynamic imports fail under Jest's VM.
  transform: {
    "^.+\\.ts$": ["ts-jest", { diagnostics: { ignoreCodes: [151002] } }],
  },
};
