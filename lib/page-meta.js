/**
 * Approved meta titles and descriptions, keyed by canonical path.
 * Source: "Meta titles and meta descriptions madina developer" (SEO brief).
 * Applied at build time by lib/site-build.js, so these win over page defaults.
 */
export const PAGE_META = {
  '/': {
    title: 'Madina Developer | Real Estate in Lahore',
    description: "Explore Madina Developer's residential and commercial projects in Lahore, including Bahria Town developments. View project details, locations and homes."
  },
  '/projects/': {
    title: 'Property Projects in Lahore | Madina Developer',
    description: 'Explore residential and commercial projects by Madina Developer in Lahore. Compare locations, apartment options, shops and current property availability.'
  },
  '/about-us/': {
    title: 'About Madina Developer | Lahore Real Estate',
    description: 'Learn about Madina Developer, a Lahore real estate developer behind residential and commercial projects in Bahria Town, Safari Villas and across Lahore.'
  },
  '/contact-us/': {
    title: 'Contact Madina Developer | Lahore Property Help',
    description: 'Contact Madina Developer in Lahore for prices, payment plans, booking information and site visits. Speak with the sales team about current projects today.'
  },
  '/projects/madina-heights/': {
    title: 'Madina Heights Lahore | Apartments & Shops',
    description: 'Explore Madina Heights developments in Lahore, featuring residential apartments and commercial shops. Check project locations, availability and payment details.'
  },
  '/projects/la-monte-vista/': {
    title: 'La Monte Vista | Apartments in Bahria Town',
    description: 'Learn about La Monte Vista in Bahria Town, Lahore, a completed apartment and commercial project by Madina Developer. Explore project details and its location.'
  },
  '/projects/madina-heights-1/': {
    title: 'Madina Heights 1 | Canal Bank Road, Lahore',
    description: 'Explore Madina Heights 1 on Main Canal Bank Road, Lahore. Review details of this completed apartment and commercial project by Madina Developer today.'
  },
  '/projects/madina-heights-2/': {
    title: 'Madina Heights 2 | Sector C, Lahore',
    description: 'Discover Madina Heights 2 in Sector C, Lahore, a completed project featuring apartments and commercial halls. Explore its location and project details today.'
  },
  '/projects/madina-heights-3/': {
    title: 'Madina Heights 3 | Safari Villas, Lahore',
    description: 'Explore Madina Heights 3 in Umer Block, Safari Villas, Lahore. Learn about this completed residential and commercial project and its location details.'
  },
  '/projects/madina-heights-4/': {
    title: 'Madina Heights 4 | Apartments & Shops in Lahore',
    description: 'Explore Madina Heights 4 in Safari Villas, Lahore, featuring apartments and commercial shops. Check project details, location and current booking options.'
  },
  '/projects/madina-heights-5/': {
    title: 'Madina Heights 5 | Apartments & Shops in Lahore',
    description: 'Discover Madina Heights 5 in Bahria Town, Lahore, with residential apartments and commercial shops. Explore unit types, project details and booking options.'
  },
  '/projects/madina-silver-heights/': {
    title: 'Madina Silver Heights | Bahria Town, Lahore',
    description: 'Learn about Madina Silver Heights in Bahria Town, Lahore, a completed mixed-use development with apartments. View project details and location information.'
  },
  '/projects/madina-homes/': {
    title: 'Madina Homes | 3-Bed Villas in Mariam Town',
    description: 'Explore Madina Homes in Mariam Town, Lahore, a gated community of three-bedroom villas. View project details, location and current possession updates.'
  },
  '/projects/madina-mall-residency/': {
    title: 'Madina Mall & Residency | Bahria Town Lahore',
    description: 'Explore Madina Mall & Residency in Bahria Town, Lahore, with studio to three-bedroom homes and retail spaces. View property options and 36-month payment plans.'
  }
};

export const metaFor = (path, fallback) => ({ ...fallback, ...(PAGE_META[path] || {}) });
