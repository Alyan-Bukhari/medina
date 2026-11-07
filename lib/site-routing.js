// One public owner per page: company, Heights collection, or Mall project.
export const MAIN = 'https://www.madinadeveloper.com';
export const HEIGHTS = 'https://www.madinaheights.com';
export const MALL = 'https://www.madinamallandresidency.com';
export const SLUGS = {1:'la-monte-vista',2:'madina-heights-1',3:'madina-heights-2',4:'madina-heights-3',5:'madina-heights-4',6:'madina-heights-5',7:'madina-silver-heights',8:'madina-homes',upcoming:'madina-mall-residency'};
export const HEIGHTS_IDS = ['2','3','4','5','6','7'];
export const projectUrl = id => id === 'upcoming' ? MALL + '/' : (HEIGHTS_IDS.includes(String(id)) ? HEIGHTS : MAIN) + '/projects/' + SLUGS[id] + '/';
export function publicUrl(path) {
  if (path === '/projects/madina-heights/') return HEIGHTS + '/';
  const id = Object.keys(SLUGS).find(id => path === '/projects/' + SLUGS[id] + '/');
  return id ? projectUrl(id) : MAIN + path;
}
export const companyPages = {'/':'index.html','/about-us/':'ceo.html','/projects/':'projects.html','/contact-us/':'contact-us.html','/virtual-tour/':'virtual-tour.html','/3d-models/':'3d-models.html'};
const aliases = ['madinadevelopers.pk','www.madinadevelopers.pk','madinadevelopers.com.pk','www.madinadevelopers.com.pk'];
const legacy = {'/index.html':'/','/ceo.html':'/about-us/','/projects.html':'/projects/','/madina-heights.html':'/projects/madina-heights/','/madina-mall-and-residency.html':'/projects/madina-mall-residency/','/blogs/':'/contact-us/','/blogs.html':'/contact-us/'};
for (const [p,f] of Object.entries(companyPages)) if (p !== '/') legacy['/'+f]=p;
for (const [id,slug] of Object.entries(SLUGS)) legacy['/project-'+id+'.html']='/projects/'+slug+'/';

export function resolveRoute(input) {
  const url = new URL(input);
  const host = url.hostname;
  const origin = host.replace(/^www\./,'') === 'madinaheights.com' ? HEIGHTS : host.replace(/^www\./,'') === 'madinamallandresidency.com' ? MALL : MAIN;
  const known = aliases.includes(host) || [MAIN,HEIGHTS,MALL].some(o => new URL(o).hostname.replace(/^www\./,'') === host.replace(/^www\./,''));
  let p = url.pathname;
  const redirect = destination => {
    const target = new URL(destination);
    // Preserve campaign parameters; id and series only select legacy routes.
    for (const [key,value] of url.searchParams) if (!['id','series'].includes(key)) target.searchParams.append(key,value);
    return {kind:'redirect',url:target.href,status:308};
  };
  if (p.startsWith('/sites/')) return {kind:'notfound'};
  if (/^\/(assets|images|css|js)\//.test(p) || p.startsWith('/api/') || p.startsWith('/_vercel/')) return {kind:'next'};
  if (p === '/project.html') {
    const id = url.searchParams.get('id');
    return id && SLUGS[id] ? redirect(projectUrl(id)) : {kind:'notfound'};
  }
  if (p === '/projects.html' && url.searchParams.get('series') === 'madina-heights') return redirect(HEIGHTS+'/');
  if (legacy[p]) {
    const dest = legacy[p];
    return redirect(dest === '/' ? origin+'/' : publicUrl(dest));
  }
  if (p !== '/' && !p.split('/').pop().includes('.') && !p.endsWith('/')) return redirect(origin+p+'/');
  if (p === '/sitemap.xml' || p === '/robots.txt') {
    if (known && url.origin !== origin) return redirect(origin+p);
    return {kind:'rewrite',path: '/sites/'+(origin===HEIGHTS?'heights':origin===MALL?'mall':'main')+p};
  }
  if (p === '/' && origin !== MAIN) {
    if (known && url.origin !== origin) return redirect(origin+'/');
    if (url.searchParams.has('id') || url.searchParams.has('series')) return redirect(origin+'/');
    return {kind:'rewrite',path:'/sites/'+(origin===HEIGHTS?'heights':'mall')+'/index.html'};
  }
  const id=Object.keys(SLUGS).find(id=>p==='/projects/'+SLUGS[id]+'/');
  const canonical=p==='/projects/madina-heights/' ? HEIGHTS+'/' : id ? projectUrl(id) : companyPages[p] ? MAIN+p : null;
  if (!canonical) return {kind:'notfound'};
  if ((known && url.origin+p !== canonical) || url.searchParams.has('id') || url.searchParams.has('series')) return redirect(canonical);
  if (p==='/projects/madina-heights/') return redirect(canonical);
  return {kind:'rewrite',path: id ? '/project-'+id+'.html' : '/'+companyPages[p]};
}
