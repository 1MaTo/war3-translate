import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: "./src/index.ts",
    format: "esm",
  },
  {
    entry: "./src/cli.ts",
    format: "esm",
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
