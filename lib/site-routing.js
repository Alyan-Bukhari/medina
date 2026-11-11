// Madina Developer is the canonical website for every Madina project.
export const MAIN = 'https://www.madinadeveloper.com';
export const HEIGHTS = 'https://www.madinaheights.com';
export const MALL = 'https://www.madinamallandresidency.com';
export const SLUGS = {1:'la-monte-vista',2:'madina-heights-1',3:'madina-heights-2',4:'madina-heights-3',5:'madina-heights-4',6:'madina-heights-5',7:'madina-silver-heights',8:'madina-homes',upcoming:'madina-mall-residency'};
export const HEIGHTS_IDS = ['2','3','4','5','6','7'];
export const projectUrl = id => MAIN + '/projects/' + SLUGS[id] + '/';
export const publicUrl = path => MAIN + path;
export const companyPages = {'/':'index.html','/about-us/':'ceo.html','/projects/':'projects.html','/contact-us/':'contact-us.html','/virtual-tour/':'virtual-tour.html','/3d-models/':'3d-models.html'};

const aliases = ['madinadevelopers.pk','www.madinadevelopers.pk','madinadevelopers.com.pk','www.madinadevelopers.com.pk'];
const legacy = {'/index.html':'/','/ceo.html':'/about-us/','/projects.html':'/projects/','/madina-heights.html':'/projects/madina-heights/','/madina-mall-and-residency.html':'/projects/madina-mall-residency/','/blogs/':'/contact-us/','/blogs.html':'/contact-us/'};
for (const [p,file] of Object.entries(companyPages)) if (p !== '/') legacy['/'+file]=p;
for (const [id,slug] of Object.entries(SLUGS)) legacy['/project-'+id+'.html']='/projects/'+slug+'/';

const heightsHost = host => host.replace(/^www\./,'') === 'madinaheights.com';
const mallHost = host => host.replace(/^www\./,'') === 'madinamallandresidency.com';
const knownHost = host => aliases.includes(host) || host.replace(/^www\./,'') === 'madinadeveloper.com' || heightsHost(host) || mallHost(host);

export function resolveRoute(input) {
  const url = new URL(input);
  const host = url.hostname;
  const p = url.pathname;
  const redirect = destination => {
    const target = new URL(destination);
    for (const [key,value] of url.searchParams) if (!['id','series'].includes(key)) target.searchParams.append(key,value);
    return {kind:'redirect',url:target.href,status:308};
  };

  if (p.startsWith('/sites/')) return {kind:'notfound'};
  if (/^\/(assets|images|css|js)\//.test(p) || p.startsWith('/api/') || p.startsWith('/_vercel/')) return {kind:'next'};

  // Project domains are permanent entry points into their matching canonical pages.
  if (heightsHost(host)) {
    const id = Object.keys(SLUGS).find(key => p === '/projects/'+SLUGS[key]+'/');
    if (p === '/' || p === '/projects/madina-heights/' || (id && HEIGHTS_IDS.includes(id))) return redirect(id ? projectUrl(id) : MAIN+'/projects/madina-heights/');
    if (p === '/sitemap.xml' || p === '/robots.txt') return redirect(MAIN+p);
    return redirect(MAIN+'/projects/madina-heights/');
  }
  if (mallHost(host)) {
    if (p === '/sitemap.xml' || p === '/robots.txt') return redirect(MAIN+p);
    return redirect(MAIN+'/projects/madina-mall-residency/');
  }
  if (!knownHost(host)) return {kind:'notfound'};
  if (host !== 'www.madinadeveloper.com') return redirect(MAIN+p);

  if (p === '/project.html') {
    const id = url.searchParams.get('id');
    return id && SLUGS[id] ? redirect(projectUrl(id)) : {kind:'notfound'};
  }
  if (p === '/projects.html' && url.searchParams.get('series') === 'madina-heights') return redirect(MAIN+'/projects/madina-heights/');
  if (legacy[p]) return redirect(MAIN+legacy[p]);
  if (p !== '/' && !p.split('/').pop().includes('.') && !p.endsWith('/')) return redirect(MAIN+p+'/');
  if (p === '/sitemap.xml' || p === '/robots.txt') return {kind:'rewrite',path:p};
  if (p === '/projects/madina-heights/') return {kind:'rewrite',path:'/projects/madina-heights/index.html'};

  const id=Object.keys(SLUGS).find(key=>p==='/projects/'+SLUGS[key]+'/');
  const canonical=id ? projectUrl(id) : companyPages[p] ? MAIN+p : null;
  if (!canonical) return {kind:'notfound'};
  if (url.href !== canonical && (url.search || url.origin+p !== canonical)) return redirect(canonical);
  return {kind:'rewrite',path: id ? '/project-'+id+'.html' : '/'+companyPages[p]};
}
