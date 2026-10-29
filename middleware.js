import { next, rewrite } from '@vercel/functions';

export const config = { matcher: '/' };

export default function middleware(request) {
  const url = new URL(request.url);
  const mallHosts = ['madinamallandresidency.com', 'www.madinamallandresidency.com'];
  if (mallHosts.includes(url.hostname)) {
    url.pathname = '/project-upcoming.html';
    url.searchParams.set('id', 'upcoming');
    url.searchParams.delete('series');
    return rewrite(url);
  }
  return next();
}
