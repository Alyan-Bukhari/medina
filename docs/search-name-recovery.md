# Google site-name correction — 9 November 2026

The owner confirmed that RealTek and Madina websites represent the same business and projects. Do not invent a separate legal entity, unrelated management, exclusive project ownership, or a marketing/developer relationship to manufacture a distinction.

The reported search results label madinadeveloper.com pages as “RealTek Developers.” This is Google's site name, separate from the page title. The supplied screenshots show older page titles/descriptions; current Madina HTML already identifies Madina Developer and the Heights 5 URL now redirects to its canonical Heights domain.

This change strengthens the existing WebSite node with preferred alternate names and a lowercase domain fallback, following Google's site-name troubleshooting guidance. The same independent technical correction is being made in the Realtek repository. It does not redirect either company homepage to the other or promise that Google will index every duplicate project page separately.

Also removed office-direction links inadvertently nested inside homepage project cards; the office link remains in the footer and contact page.

## Search Console owner actions

1. Inspect https://www.madinadeveloper.com/ in the property you own. Run Test Live URL, check that the rendered HTML has `WebSite.name` = `Madina Developer`, and request indexing.
2. Inspect https://www.madinadeveloper.com/about-us/ and request indexing for the updated About page.
3. Inspect the old https://www.madinadeveloper.com/projects/madina-heights-5/ URL. It should redirect to https://www.madinaheights.com/projects/madina-heights-5/. Inspect/request indexing for the destination using the Heights property.
4. On the RealTek property, inspect https://realtekdevelopers.com/ and https://realtekdevelopers.com/about-us/. Verify the RealTek name and self-canonical URL, then request indexing.
5. Submit each owned site's own `/sitemap.xml`. Do not submit a competitor/other host's sitemap to a URL-prefix property.
6. Review user-declared versus Google-selected canonical and last crawl date after processing. Do not use Google's removal tool to repair a wrong site name; removal can hide the results you want to keep.

The browser connection did not expose an authenticated Search Console session, so no indexing requests or sitemap submissions were performed by this task. Google says recrawling/reprocessing may take days to weeks. Site names and positions remain automated Google decisions.

## Longer-term work

Both homepages need genuinely useful, maintained content for their respective branded searches. Rewriting metadata alone cannot turn identical project content into independent businesses. Keep the actual shared identity accurate, and use original brand-specific guides, customer enquiry information and dated project updates. Verify which Google Business Profile represents the actual business; do not create duplicate listings just for domain names.

Sources:
- https://developers.google.com/search/docs/appearance/site-names
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
