/**
 * Where the live side of the project match runs (workers/jev-match), deployed
 * on 2026-09-26 to Michael's private Cloudflare account (780e4f9d…,
 * subdomain mboiman.workers.dev). Empty would mean examples only. A local run
 * can point elsewhere: PUBLIC_MATCH_ENDPOINT=http://localhost:8799 npm run dev
 * (with `wrangler dev --remote --env dev`, which allows localhost).
 */
export const MATCH_ENDPOINT = 'https://jev-match.mboiman.workers.dev';
