import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * A robust, permanent solution to fetch environment variables.
 * - In Cloudflare (Production): Reads directly from the Edge Worker bindings.
 * - In Local (Development): Falls back to process.env (.env.local).
 */
export function getEnvSync(key: string): string {
  try {
    // Attempt to get the variable directly from Cloudflare Worker bindings
    const { env } = getCloudflareContext();
    const bindings = env as Record<string, unknown>;
    if (bindings && typeof bindings[key] === "string" && bindings[key] !== "") {
      return bindings[key] as string;
    }
  } catch (error) {
    // Ignore if context is unavailable
  }

  // Fallback to standard Node.js process.env for local development
  return process.env[key] || "";
}

export async function getEnv(key: string): Promise<string> {
  return getEnvSync(key);
}
