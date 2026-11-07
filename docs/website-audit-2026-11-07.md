# Website and domain audit — 7 November 2026

## Scope and evidence

Pass 1 inspected all 17 URLs in the live company sitemap, plus the nine alternate apex/www domain entry points. Checked rendered content, titles, canonical tags, headings, navigation, browser errors and screenshots.

Pass 2 inspected all 16 revised canonical pages at 1440px and 375px, including normal and reduced-motion modes. Checked full-page scroll, screenshots, image loading, horizontal overflow, JavaScript errors, project filters and mobile navigation. A final focused pass covers subsequent layout fixes and tour/model picker interactions. Automated route checks cover canonical links, HTML metadata, JSON-LD, legacy URLs, tracking parameters, invalid projects, all domain aliases, robots files and sitemaps.

The browser audit does not submit contact forms or verify email delivery. Search Console indexing and Google-selected canonical status require owner access. Existing sales availability, payment plans, project dates and image/brochure details require business confirmation.

## Public URL ownership

| Domain | Purpose | Indexable pages |
| --- | --- | --- |
| www.madinadeveloper.com | Company, contact, portfolio, tours/models, La Monte Vista and Madina Homes | 8 |
| www.madinaheights.com | Heights collection and six building pages | 7 |
| www.madinamallandresidency.com | Full Mall & Residency project | 1 |
| madinadevelopers.pk, madinadevelopers.com.pk (including www) | Company spelling/domain aliases | Redirect to the corresponding canonical destination |

Each site has its own `/sitemap.xml`, `/robots.txt`, self-referencing canonicals and named WebSite schema. The developer organization remains shared because these are its projects. No unrelated organization, social profile or email is attached to the Madina brand.

The former company Mall route redirects to the Mall homepage. The former company Heights collection and building routes redirect to the matching Heights destination. Visitors on either project domain stay there for its own content. Company navigation deliberately links back to company pages rather than duplicating them on every domain.

## Changes

- Removed unrelated social links, source schema, email and the unverified Google profile shortlink.
- Rewrote company/about and project summaries. Removed unsupported homepage investment guarantees and project ROI percentage claims.
- Consolidated the thin generic blog page into the contact page's visit guide with a permanent redirect.
- Retained useful project archives, virtual tours and 3D models; improved tool headings and explanatory copy.
- Redirected legacy `.html` and query-selected project URLs. Unknown pages return a real 404. Internal generated files cannot be accessed as public landing pages.
- Replaced the homepage's long pinned horizontal project sequence with a static, crawlable card collection, short entry reveals and subtle image/arrow transitions.
- Replaced the incorrect Mall-led Heights collection with an actual Heights introduction and six relevant buildings.
- Restored the collapsed Mall feature section. Removed forced smooth scrolling, added reduced-motion handling, improved mobile menu Escape behavior and removed unstable card tilt.
- Removed the unnecessary React root from static-page analytics.
- Kept existing Google verification and GA4 tags.

## Owner actions after deployment

1. Verify Domain properties for madinadeveloper.com, madinaheights.com and madinamallandresidency.com in Google Search Console using the DNS values Google provides. Submit each site's own sitemap, then inspect/request indexing for its homepage and key pages.
2. Check indexing and Google's selected canonical after recrawling. There is no instant indexing or first-place guarantee. Do not use site-wide Change of Address for the company: it remains live; only selected project pages move.
3. Supply the verified office address, opening hours, official Madina social profiles and the correct Google Business Profile. Keep contact details and website links consistent in legitimate listings.
4. Maintain a verified, eligible Business Profile with original site photographs and genuine customer reviews. Do not create duplicate profiles solely to match domain names.
5. Supply dated construction updates, current availability, approved layouts, project approvals where applicable, and original project photographs. Confirm all existing brochure and payment-plan claims before treating them as current offers.
6. If the separately operated website continues to publish substantially identical Madina content, coordinate accurate ownership and original business-specific content with its owner. Removing references here cannot control Google's interpretation of another website.
7. Confirm the FormSubmit activation email in madinaheightspvtlimited@gmail.com and perform a real enquiry delivery test. GA4 currently uses the existing shared property; use hostname reporting or separate streams if separate reporting is required.

## References

- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://developers.google.com/search/docs/appearance/ranking-systems-guide
- https://support.google.com/business/answer/7091

Exact-match domains alone do not establish authority. The strategy is three useful sites with distinct project/company purposes, plus consolidated company aliases—not five copies competing for the same brand query.
