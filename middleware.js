import { next, rewrite } from '@vercel/functions';
import { resolveRoute } from './lib/site-routing.js';
export const config = { matcher: '/:path*' };
export default function middleware(request) {
  const route = resolveRoute(request.url);
  if (route.kind === 'redirect') return Response.redirect(route.url, route.status);
  if (route.kind === 'notfound') return new Response('<!doctype html><html lang="en"><head><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width"><title>Page not found | Madina</title></head><body><main><h1>Page not found</h1><p>This address does not match a project or page.</p><a href="/">Return home</a></main></body></html>', {status:404,headers:{'Content-Type':'text/html; charset=utf-8'}});
  if (route.kind === 'rewrite') { const url = new URL(request.url); url.pathname=route.path; return rewrite(url); }
  return next();
}
