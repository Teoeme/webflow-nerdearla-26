import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getPhotoBucket(): Promise<R2Bucket> {
  const { env } = await getCloudflareContext({ async: true });
  return env.PHOTOS;
}
