// backend/services/r2Key.js
export function extractR2KeyFromUrl(url) {
  const u = new URL(url);
  let key = u.pathname.replace(/^\/+/, ''); // trim leading slash

  const bucket = process.env.CF_R2_BUCKET;
  const isS3Endpoint = u.hostname.endsWith('.r2.cloudflarestorage.com');

  // On the S3 endpoint, the path is "<bucket>/<key>" → strip the bucket prefix
  if (isS3Endpoint && bucket && key.startsWith(`${bucket}/`)) {
    key = key.slice(bucket.length + 1);
  }
  return key; // e.g. "media/abcd-1234.jpg"
}
