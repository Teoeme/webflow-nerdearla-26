import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getDatabase(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}
