import fs from 'node:fs';
import path from 'node:path';
import { MAIN, SLUGS, HEIGHTS_IDS, projectUrl, publicUrl, companyPages } from './site-routing.js';
import { esc, sitemapXml } from './seo-build.js';

export function finalizeSites(dist) {
  const read = file => fs.readFileSync(path.join(dist,file),'utf8');
  const write = (file,html) => {fs.mkdirSync(path.dirname(path.join(dist,file)),{recursive:true});fs.writeFileSync(path.join(dist,file),html);};
  const mainPages = Object.entries(companyPages).map(([p,file])=>({url:MAIN+p,file}));
  function links(html) {
    return html.replace(/href="([^"]*)"/g,(all,href)=>{
      if (!href.startsWith('/') || href.startsWith('//')) return all;
      const p=href.split(/[?#]/)[0];
      if (p.startsWith('/projects/') || companyPages[p]) return `href="${esc(publicUrl(p)+href.slice(p.length))}"`;
      return all;
    });
  }
  function meta(html,{url,title,description,brand}) {
    const origin=MAIN;
    html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(title)}</title>`);
    html=html.replace(/<link\b[^>]*rel="canonical"[^>]*>\s*/g,'');
    html=html.replace(/<meta\b[^>]*(?:name|property)="(?:description|robots|author|og:[^"]*|twitter:[^"]*)"[^>]*>\s*/g,'');
    // Replace stale page/organization graph and breadcrumbs with one coherent graph.
    let entity;
    for(const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      const data=JSON.parse(match[1]);
      if(data['@type']==='ApartmentComplex') entity={...data,url,'@id':url+'#property'};
    }
    html=html.replace(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/g,'');
    const graph=[
      {'@type':'Organization','@id':MAIN+'/#organization',name:'Madina Developer',url:MAIN+'/',location:{'@type':'Place',name:'Madina Developer office',hasMap:'https://maps.app.goo.gl/1qVXhVcomazyWJAbA',geo:{'@type':'GeoCoordinates',latitude:31.376608,longitude:74.185796}},email:'madinaheightspvtlimited@gmail.com',telephone:'+923124455477'},
      {'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'Madina Developer',alternateName:['Madina Developers','madinadeveloper.com'],publisher:{'@id':MAIN+'/#organization'},inLanguage:'en-PK'},
      {'@type':'WebPage','@id':url+'#webpage',url,name:title,description,isPartOf:{'@id':origin+'/#website'},...(entity?{about:{'@id':url+'#property'}}:{})}
    ];
    if(entity)graph.push(entity);
    if(url!==origin+'/')graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:brand,item:origin+'/'},{'@type':'ListItem',position:2,name:title.split(' | ')[0],item:url}]});
    const image=origin+'/'+(html.match(/id="p-hero-img" src="([^"]+)"/)?.[1] || 'images/hero-1920.jpg').replace(/^\//,'');
    html=html.replace('</head>',`<link rel="canonical" href="${esc(url)}">\n<meta name="robots" content="index, follow, max-image-preview:large">\n<meta name="description" content="${esc(description)}">\n<meta property="og:type" content="website">\n<meta property="og:site_name" content="${esc(brand)}">\n<meta property="og:title" content="${esc(title)}">\n<meta property="og:description" content="${esc(description)}">\n<meta property="og:url" content="${esc(url)}">\n<meta property="og:image" content="${esc(image)}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${esc(title)}">\n<meta name="twitter:description" content="${esc(description)}">\n<meta name="twitter:image" content="${esc(image)}">\n<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script>\n</head>`);
    html=links(html);
    return html;
  }
  for(const page of mainPages){
    let html=read(page.file);
    const title=html.match(/<title>(.*?)<\/title>/)[1].replace(/&amp;/g,'&');
    const description=html.match(/<meta name="description" content="([^"]*)"/)[1].replace(/&amp;/g,'&');
    write(page.file,meta(html,{...page,title,description,brand:'Madina Developer'}));
  }
  for(const [id,slug] of Object.entries(SLUGS)) {
    const file='project-'+id+'.html';
    let html=read(file);
    const name=html.match(/id="p-title">([^<]*)/)[1].replace(/&amp;/g,'&');
    const url=projectUrl(id);
    const description=html.match(/<meta name="description" content="([^"]*)"/)[1].replace(/&amp;/g,'&');
    html=meta(html,{url,title:name+' | '+(id==='upcoming'?'Bahria Town Lahore':'Property in Lahore'),description,brand:'Madina Developer'});
    mainPages.push({url,file});
    write(file,html);
  }
  let heights=read('projects.html');
  heights=heights.replace('<body>','<body data-seo-series="madina-heights">');
  heights=heights.replace(/<a class="folio-card"[\s\S]*?<\/a>/g,card=>HEIGHTS_IDS.includes(card.match(/data-project-id="([^"]+)"/)?.[1])?card:'');
  heights=heights.replace(/<header class="folio-intro">[\s\S]*?<\/header>/,`<header class="folio-intro heights-intro"><div><p class="eyebrow">The Madina Heights collection</p><h1>Madina Heights.<br>Find your place in Lahore.</h1><p class="folio-lead">Explore Madina Heights 1–5 and Madina Silver Heights. Compare residential apartments and commercial spaces across Canal Bank Road, Bahria Town and Safari Villas, then open a building for photographs, layouts and contact options.</p><a class="btn" href="#heights-collection">Explore the buildings</a></div><img src="/images/madina-heights-4/elevation/elevation-01.jpg" alt="Madina Heights 4 building" width="755" height="1024" fetchpriority="high"></header>`);
  heights=heights.replace('<div class="folio-grid">','<div class="folio-grid" id="heights-collection">');
  heights=heights.replace('All<span>9</span>','All<span>6</span>').replace('Available<span>3</span>','Available<span>2</span>').replace('Sold Out<span>6</span>','Sold Out<span>4</span>');
  heights=meta(heights,{url:MAIN+'/projects/madina-heights/',title:'Madina Heights | Apartments & Commercial Property in Lahore',description:'Explore Madina Heights 1–5 and Madina Silver Heights in Lahore. Compare building locations, apartment layouts, photographs and property enquiry options.',brand:'Madina Developer'});
  write('projects/madina-heights/index.html',heights);
  mainPages.push({url:MAIN+'/projects/madina-heights/',file:'projects/madina-heights/index.html'});
  write('sitemap.xml',sitemapXml(mainPages.map(p=>({loc:p.url}))));
  write('robots.txt','User-agent: *\nAllow: /\n\nSitemap: '+MAIN+'/sitemap.xml\n');
  write('site-manifest.json',JSON.stringify(mainPages,null,2));
  // Generated aliases and a generic project template must never become landing pages.
  for(const file of ['blogs.html','madina-heights.html','madina-mall-and-residency.html','project.html']) {
    const p=path.join(dist,file);if(fs.existsSync(p))fs.unlinkSync(p);
  }
}
