import fs from 'node:fs';
import assert from 'node:assert/strict';
import {resolveRoute, MAIN, HEIGHTS, MALL, SLUGS, projectUrl} from '../lib/site-routing.js';
const pages=JSON.parse(fs.readFileSync('dist/site-manifest.json','utf8'));
for(const page of pages) {
 const html=fs.readFileSync('dist/'+page.file,'utf8');
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1,page.url+' canonical count');
 assert.ok(html.includes(`rel="canonical" href="${page.url}"`),page.url);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,page.url+' H1 count');
 assert.equal((html.match(/name="description"/g)||[]).length,1,page.url+' description count');
 assert.ok(!/realtek/i.test(html),page.url+' unrelated brand');
 for(const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
 const r=resolveRoute(page.url);assert.equal(r.kind,'rewrite',page.url);assert.ok(fs.existsSync('dist'+r.path),r.path);
 for(const match of html.matchAll(/href="(https:\/\/www\.(?:madinadeveloper|madinaheights|madinamallandresidency)\.com[^"#]*)/g)) {
  const r=resolveRoute(match[1].replace(/&amp;/g,'&'));assert.notEqual(r.kind,'notfound',page.url+' link '+match[1]);
 }
}
for(const host of ['madinadevelopers.pk','www.madinadevelopers.pk','madinadevelopers.com.pk','www.madinadevelopers.com.pk','madinadeveloper.com']) {
 assert.equal(resolveRoute('https://'+host+'/?utm_source=test').url,MAIN+'/?utm_source=test');
}
for(const [id,slug] of Object.entries(SLUGS)) {
 for(const origin of [MAIN,HEIGHTS,MALL]) {
  assert.equal(resolveRoute(origin+'/project.html?id='+id).url,projectUrl(id));
  assert.equal(resolveRoute(origin+'/project-'+id+'.html').url,projectUrl(id));
 }
 assert.equal(resolveRoute(projectUrl(id)+'?id=wrong').url,projectUrl(id));
}
for(const origin of [MAIN,HEIGHTS,MALL]){
 assert.equal(resolveRoute(origin+'/does-not-exist/').kind,'notfound');
 assert.equal(resolveRoute(origin+'/project.html?id=invalid').kind,'notfound');
 assert.equal(resolveRoute(origin+'/sites/mall/index.html').kind,'notfound');
 for(const p of ['/robots.txt','/sitemap.xml']) assert.ok(fs.existsSync('dist'+resolveRoute(origin+p).path));
 assert.equal(resolveRoute(origin+'/blogs/').url,MAIN+'/contact-us/');
}
assert.equal(resolveRoute(MAIN+'/projects/madina-mall-residency/?id=upcoming').url,MALL+'/');
assert.equal(resolveRoute(MAIN+'/projects/madina-heights/').url,HEIGHTS+'/');
assert.equal(resolveRoute('https://madinaheights.com/').url,HEIGHTS+'/');
assert.equal(resolveRoute('https://madinamallandresidency.com/').url,MALL+'/');
console.log(`PASS: ${pages.length} canonical pages, metadata, structured data, internal links, aliases, legacy routes, missing pages and all three sitemaps.`);
