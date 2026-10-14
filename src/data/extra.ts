// Derived lists (no new copy): image sets taken from the old pages, and the enquiry options,
// which are the old site's own service names. Alt text is descriptive, written for accessibility.
import sizes from './images.json';

export type Pic = { image: string; alt: string };
export const size = (key: string) => (sizes as Record<string, number[]>)[key] ?? [500, 500];
export const src = (key: string, w?: number) => `/images/${key}${w && size(key)[0] > 1000 ? '-960' : ''}.jpg`;

// The service names a visitor can tick on the quote form (?service=<slug> pre-ticks one).
export const quoteOptions = [
  { slug: 'windows', label: 'Windows' },
  { slug: 'doors', label: 'Doors' },
  { slug: 'conservatories', label: 'Conservatories' },
  { slug: 'leka-roofs', label: 'Leka Roofs' },
  { slug: 'commercial', label: 'Commercial' },
];

// Homepage "Doors / Conservatories / Windows" tiles and the circle photos from the old homepage.
export const homeTiles = [
  { name: 'Doors', href: '/our-services#doors', image: 'home/cream-front-door', alt: 'Cream composite front door with a glazed side panel' },
  { name: 'Conservatories', href: '/our-services#conservatories', image: 'home/victorian-conservatory', alt: 'White Victorian-style conservatory in a back garden' },
  { name: 'Windows', href: '/our-services#windows', image: 'home/dormer-windows', alt: 'White uPVC windows in a clad dormer' },
];

// Photos for the hero window wall: the client's own residential jobs.
export const heroPanes: Pic[] = [
  { image: 'home/victorian-conservatory', alt: 'Victorian conservatory' },
  { image: 'gallery/stained-glass-door', alt: 'Composite door with stained-glass panel' },
  { image: 'home/extension-french-doors', alt: 'Extension with French doors' },
  { image: 'gallery/bay-window-cladding', alt: 'Bay window on a clad house' },
  { image: 'leka/leka-roof-rear', alt: 'Conservatory with Leka solid roof' },
  { image: 'gallery/anthracite-front-door', alt: 'Anthracite front door' },
];

export const galleryPics: Pic[] = [
  { image: 'gallery/bay-window-inside', alt: 'Bay window seen from inside, looking out to the street' },
  { image: 'gallery/french-doors-georgian', alt: 'White French doors with Georgian bars' },
  { image: 'gallery/conservatory-garden', alt: 'Victorian conservatory on a brick base' },
  { image: 'gallery/bay-window-cladding', alt: 'Bow window on a house with cream cladding' },
  { image: 'gallery/windows-scaffold', alt: 'New windows on a rendered house under scaffold' },
  { image: 'gallery/grey-windows-house', alt: 'House with grey windows and cladding' },
  { image: 'gallery/shopfront-inside', alt: 'Shop front glazing seen from inside' },
  { image: 'gallery/anthracite-front-door', alt: 'Anthracite grey front door with glazed side panel' },
  { image: 'gallery/shopfront-salon', alt: 'Salon shop front with new glazing' },
  { image: 'gallery/gable-windows', alt: 'Gable end with new windows and cladding' },
  { image: 'gallery/cladding-window', alt: 'New window in a clad wall' },
  { image: 'gallery/glazed-porch-door', alt: 'Fully glazed porch door' },
  { image: 'gallery/extension-roof-doors', alt: 'Extension with French doors and a tiled roof' },
  { image: 'gallery/stained-glass-door', alt: 'Composite front door with stained-glass panel' },
  { image: 'home/extension-french-doors', alt: 'Brick extension with white French doors' },
  { image: 'services/porch-door', alt: 'Enclosed porch with white door' },
  { image: 'leka/leka-roof-rear', alt: 'Rear conservatory with Leka solid roof' },
  { image: 'services/conservatory-corner', alt: 'Corner conservatory' },
  { image: 'services/window-fitted', alt: 'Newly fitted window' },
];

const commercialAlts = [
  'Entrance porch frame going up beside a brick building', 'Porch with a blue door under construction', 'Blue entrance door with glazed side panels',
  'White glazed porch with a gabled canopy', 'Glazed porch with a canopy and finial', 'Sun lounge with corner windows',
  'Sun lounge windows looking onto the garden', 'Sun lounge glazing from inside', 'Underside of a porch canopy roof',
  'Glazed entrance porch beside a garden', 'New upper and lower windows on a brick block', 'Long run of new windows across two storeys',
  'Two-storey block with new windows above a lawn', 'Corridor windows from inside', 'Window looking onto a courtyard garden',
  'Corridor with a run of new windows', 'Window with a view across the garden', 'Two-storey block and lawn after the fit',
];
export const commercialPics: Pic[] = commercialAlts.map((alt, i) => ({ image: `commercial/commercial-${String(i + 1).padStart(2, '0')}`, alt }));

// The four things EazyFit fits, for the homepage services moment. Each line is the opening sentence of
// that service's own copy on the old site (Leka: from the Leka Roofs page).
export const fitList = [
  { n: '01', key: 'windows', name: 'Windows', href: '/our-services#windows', line: 'We offer excellent and customized window installation services.', image: 'home/dormer-windows', alt: 'White uPVC windows in a clad dormer' },
  { n: '02', key: 'doors', name: 'Doors', href: '/our-services#doors', line: 'There are a variety of door fittings available to choose from when it comes to installing interior or exterior doors.', image: 'gallery/anthracite-front-door', alt: 'Anthracite front door with a glazed side panel' },
  { n: '03', key: 'conservatories', name: 'Conservatories', href: '/our-services#conservatories', line: 'Conservatories enhance homes and offer a bright, airy space that brings the outdoors in.', image: 'home/victorian-conservatory', alt: 'White Victorian-style conservatory' },
  { n: '04', key: 'leka', name: 'Leka Roofs', href: '/leka-roofs', line: 'The Leka Roofing System was created by industry professionals to answer the growing demand for a better alternative to a more traditional conservatory roof.', image: 'leka/leka-roof-rear', alt: 'Conservatory with a tiled Leka solid roof' },
];
