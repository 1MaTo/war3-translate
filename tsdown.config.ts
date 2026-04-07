import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: "./src/index.ts",
    format: "cjs",
  },
  {
    entry: "./src/cli.ts",
    format: "cjs",
    platform: "node",
    dts: false,
    banner: {
      js: "#!/usr/bin/env node\n",
    },
    deps: {
      onlyBundle: ["commander"],
    },
  },
]);
