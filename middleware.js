import { next, rewrite } from '@vercel/functions';

export const config = { matcher: '/:path*' };

export default function middleware(request) {
  const url = new URL(request.url);
  const brandAliases = ['madinadevelopers.pk', 'www.madinadevelopers.pk', 'madinadevelopers.com.pk', 'www.madinadevelopers.com.pk'];
  if (brandAliases.includes(url.hostname)) {
    url.hostname = 'www.madinadeveloper.com';
    url.protocol = 'https:';
    return Response.redirect(url, 308);
  }
  const mallHosts = ['madinamallandresidency.com', 'www.madinamallandresidency.com'];
  if (mallHosts.includes(url.hostname) && url.pathname === '/') {
    url.pathname = '/project-upcoming.html';
    url.searchParams.set('id', 'upcoming');
    url.searchParams.delete('series');
    return rewrite(url);
  }
  return next();
}
