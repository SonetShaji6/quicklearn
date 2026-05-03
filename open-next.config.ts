import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  default: {
    // Override the default server file
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      // Use the bundled incremental cache
      incrementalCache: "dummy",
      // Use the bundled queue
      queue: "dummy",
    },
  },
};

export default config;
