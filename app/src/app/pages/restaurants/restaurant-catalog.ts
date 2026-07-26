export type RestaurantPriceRange = '$' | '$$' | '$$$' | '$$$$';

export interface RestaurantReview {
  author: string;
  rating: number;
  date: string;
  text: string;
}

export interface RestaurantMenuItem {
  name: string;
  description: string;
  price: string;
}

export interface RestaurantCatalogItem {
  slug: string;
  name: string;
  cuisine: string;
  category: string;
  location: string;
  neighborhood: string;
  priceRange: RestaurantPriceRange;
  rating: number;
  distanceKm: number;
  isOpenNow: boolean;
  description: string;
  contact: string;
  menu: RestaurantMenuItem[];
  reviews: RestaurantReview[];
}

export const restaurantCatalog: RestaurantCatalogItem[] = [
  {
    slug: 'trattoria-alba',
    name: 'Trattoria Alba',
    cuisine: 'Italian',
    category: 'Fine dining',
    location: 'Downtown',
    neighborhood: 'Old Market',
    priceRange: '$$',
    rating: 4.9,
    distanceKm: 0.8,
    isOpenNow: true,
    description: 'Handmade pasta, slow-braised sauces, and a warm dining room built for long dinners.',
    contact: '+1 (555) 210-1842',
    menu: [
      { name: 'Tagliatelle al Ragu', description: 'Slow-braised beef ragù, parmesan, fresh herbs.', price: '$24' },
      { name: 'Burrata e Prosciutto', description: 'Creamy burrata, aged prosciutto, marinated tomatoes.', price: '$18' },
      { name: 'Tiramisu Classico', description: 'Espresso-soaked sponge, mascarpone cream, cocoa.', price: '$11' }
    ],
    reviews: [
      { author: 'Amelia R.', rating: 5, date: 'Jul 18, 2026', text: 'The pasta tasted freshly made and the service was attentive without being rushed.' },
      { author: 'Diego M.', rating: 5, date: 'Jul 10, 2026', text: 'Elegant but still comfortable. The ragu and wine pairing were excellent.' }
    ]
  },
  {
    slug: 'sakura-house',
    name: 'Sakura House',
    cuisine: 'Japanese',
    category: 'Omakase',
    location: 'Riverside',
    neighborhood: 'East Bank',
    priceRange: '$$$',
    rating: 4.8,
    distanceKm: 1.2,
    isOpenNow: true,
    description: 'Fresh sushi, precise nigiri, and seasonal small plates with a quiet omakase counter.',
    contact: '+1 (555) 210-1843',
    menu: [
      { name: 'Sushi Omakase', description: 'Chef-selected nigiri and seasonal hand rolls.', price: '$52' },
      { name: 'Hamachi Crudo', description: 'Yellowtail, citrus ponzu, pickled radish.', price: '$19' },
      { name: 'Miso Custard', description: 'Silky dessert with black sesame crumble.', price: '$10' }
    ],
    reviews: [
      { author: 'Naomi T.', rating: 5, date: 'Jul 20, 2026', text: 'Incredibly precise cuts and a very calm atmosphere.' },
      { author: 'Lucas K.', rating: 4.8, date: 'Jul 14, 2026', text: 'Fresh fish and a thoughtful tasting progression.' }
    ]
  },
  {
    slug: 'casa-sol',
    name: 'Casa Sol',
    cuisine: 'Mexican',
    category: 'Contemporary casual',
    location: 'Midtown',
    neighborhood: 'Central Square',
    priceRange: '$$',
    rating: 4.7,
    distanceKm: 2.1,
    isOpenNow: false,
    description: 'Tacos, grilled meats, and bright salsas with a late-night mezcal bar.',
    contact: '+1 (555) 210-1844',
    menu: [
      { name: 'Birria Tacos', description: 'Slow-cooked beef, consommé, pickled onion.', price: '$16' },
      { name: 'Street Corn', description: 'Lime crema, cotija, chili, charred corn.', price: '$9' },
      { name: 'Carne Asada Plate', description: 'Grilled steak, rice, beans, salsa roja.', price: '$22' }
    ],
    reviews: [
      { author: 'Sofia P.', rating: 5, date: 'Jul 16, 2026', text: 'Big flavors, generous portions, and the tacos were the highlight.' },
      { author: 'Mark D.', rating: 4.7, date: 'Jul 08, 2026', text: 'Great energy and the mezcal list is worth exploring.' }
    ]
  },
  {
    slug: 'mizu-garden',
    name: 'Mizu Garden',
    cuisine: 'Japanese',
    category: 'Tasting menu',
    location: 'Harbor View',
    neighborhood: 'North Pier',
    priceRange: '$$$$',
    rating: 4.6,
    distanceKm: 3.4,
    isOpenNow: true,
    description: 'A refined tasting menu with seafood-led courses and a focused sake list.',
    contact: '+1 (555) 210-1845',
    menu: [
      { name: 'Sea Bass Sashimi', description: 'Shiso oil, citrus salt, cucumber ribbon.', price: '$28' },
      { name: 'Seven-Course Tasting', description: 'Chef-led tasting menu with seasonal ingredients.', price: '$88' },
      { name: 'Yuzu Cheesecake', description: 'Light cheesecake with yuzu glaze.', price: '$12' }
    ],
    reviews: [
      { author: 'Hana S.', rating: 4.8, date: 'Jul 12, 2026', text: 'A polished dinner from start to finish with beautiful plating.' },
      { author: 'Priya N.', rating: 4.6, date: 'Jul 05, 2026', text: 'The tasting menu felt balanced and very intentional.' }
    ]
  },
  {
    slug: 'la-mesa-roja',
    name: 'La Mesa Roja',
    cuisine: 'Mexican',
    category: 'Neighborhood favorite',
    location: 'Uptown',
    neighborhood: 'Rose District',
    priceRange: '$$',
    rating: 4.5,
    distanceKm: 1.8,
    isOpenNow: true,
    description: 'Street-food flavors, house tortillas, and smoky sauces served in a bright room.',
    contact: '+1 (555) 210-1846',
    menu: [
      { name: 'Al Pastor Tacos', description: 'Pineapple, marinated pork, cilantro, onion.', price: '$14' },
      { name: 'Quesadilla Trio', description: 'Three cheeses, roasted peppers, salsa verde.', price: '$13' },
      { name: 'Churros', description: 'Cinnamon sugar, chocolate dipping sauce.', price: '$8' }
    ],
    reviews: [
      { author: 'Maria L.', rating: 4.9, date: 'Jul 17, 2026', text: 'Comfort food done right and the tortillas are excellent.' },
      { author: 'Ben H.', rating: 4.5, date: 'Jul 11, 2026', text: 'Warm staff and a lively lunch crowd.' }
    ]
  },
  {
    slug: 'osteria-bellini',
    name: 'Osteria Bellini',
    cuisine: 'Italian',
    category: 'Wine bar',
    location: 'South End',
    neighborhood: 'Canal Walk',
    priceRange: '$$$',
    rating: 4.4,
    distanceKm: 2.9,
    isOpenNow: false,
    description: 'Classic antipasti, wood-fired mains, and a wine list centered on Italian regions.',
    contact: '+1 (555) 210-1847',
    menu: [
      { name: 'Margherita Pizza', description: 'Wood-fired crust, tomato, mozzarella, basil.', price: '$18' },
      { name: 'Risotto ai Funghi', description: 'Mushrooms, parmesan, white wine, herbs.', price: '$23' },
      { name: 'Affogato', description: 'Espresso poured over vanilla gelato.', price: '$9' }
    ],
    reviews: [
      { author: 'Elena V.', rating: 4.7, date: 'Jul 15, 2026', text: 'Lovely wine selection and an excellent risotto.' },
      { author: 'James C.', rating: 4.4, date: 'Jul 09, 2026', text: 'Relaxed, cozy, and good for a slower dinner.' }
    ]
  },
  {
    slug: 'rin-thai-kitchen',
    name: 'Rin Thai Kitchen',
    cuisine: 'Thai',
    category: 'Casual dining',
    location: 'Downtown',
    neighborhood: 'Market Row',
    priceRange: '$$',
    rating: 4.6,
    distanceKm: 0.6,
    isOpenNow: true,
    description: 'Green curry, wok-fired noodles, and fragrant herbs with fast lunch service.',
    contact: '+1 (555) 210-1848',
    menu: [
      { name: 'Pad Thai', description: 'Rice noodles, tamarind, peanuts, lime.', price: '$15' },
      { name: 'Green Curry', description: 'Coconut curry, basil, vegetables, jasmine rice.', price: '$17' },
      { name: 'Mango Sticky Rice', description: 'Sweet mango, coconut cream, sticky rice.', price: '$10' }
    ],
    reviews: [
      { author: 'Kaya W.', rating: 4.7, date: 'Jul 19, 2026', text: 'Quick, fragrant, and very satisfying for lunch.' },
      { author: 'Noah J.', rating: 4.6, date: 'Jul 13, 2026', text: 'The curry had real depth and the noodles were spot on.' }
    ]
  },
  {
    slug: 'bistro-verde',
    name: 'Bistro Verde',
    cuisine: 'French',
    category: 'Bistro',
    location: 'Museum Quarter',
    neighborhood: 'Civic Center',
    priceRange: '$$$',
    rating: 4.3,
    distanceKm: 4.1,
    isOpenNow: true,
    description: 'Seasonal plates, crisp pastries, and a slow-paced dining room for special occasions.',
    contact: '+1 (555) 210-1849',
    menu: [
      { name: 'Duck Confit', description: 'Crispy duck, lentils, orange glaze.', price: '$29' },
      { name: 'French Onion Soup', description: 'Caramelized onions, gruyere toast.', price: '$14' },
      { name: 'Lemon Tart', description: 'Bright citrus custard, pastry shell, berry compote.', price: '$10' }
    ],
    reviews: [
      { author: 'Claire M.', rating: 4.4, date: 'Jul 07, 2026', text: 'A calm place for dinner with very polished desserts.' },
      { author: 'Owen T.', rating: 4.3, date: 'Jul 03, 2026', text: 'Classic bistro feel and attentive service.' }
    ]
  },
  {
    slug: 'sabor-norte',
    name: 'Sabor Norte',
    cuisine: 'Latin American',
    category: 'Shared plates',
    location: 'West End',
    neighborhood: 'Granary District',
    priceRange: '$$',
    rating: 4.2,
    distanceKm: 3.7,
    isOpenNow: true,
    description: 'Charcoal-grilled dishes, bright citrus marinades, and a lively dinner menu.',
    contact: '+1 (555) 210-1850',
    menu: [
      { name: 'Grilled Skewers', description: 'Charcoal grilled chicken, citrus marinade.', price: '$19' },
      { name: 'Plantain Bowl', description: 'Black beans, avocado, pickled onions.', price: '$16' },
      { name: 'Tres Leches', description: 'Sweet milk cake, whipped cream, cinnamon.', price: '$9' }
    ],
    reviews: [
      { author: 'Laura G.', rating: 4.2, date: 'Jul 15, 2026', text: 'Bold flavors and a really fun dinner menu.' },
      { author: 'Ethan S.', rating: 4.1, date: 'Jul 01, 2026', text: 'Good portions and strong value for the price.' }
    ]
  },
  {
    slug: 'green-spoon',
    name: 'Green Spoon',
    cuisine: 'Healthy',
    category: 'Cafe',
    location: 'Lakeside',
    neighborhood: 'Park Lane',
    priceRange: '$',
    rating: 4.1,
    distanceKm: 2.4,
    isOpenNow: false,
    description: 'Bowls, salads, smoothies, and fast weekday lunches with simple ingredients.',
    contact: '+1 (555) 210-1851',
    menu: [
      { name: 'Protein Bowl', description: 'Quinoa, avocado, greens, roasted chicken.', price: '$14' },
      { name: 'Berry Smoothie', description: 'Mixed berries, banana, yogurt, oats.', price: '$8' },
      { name: 'Avocado Toast', description: 'Seeded bread, citrus, chili flakes.', price: '$11' }
    ],
    reviews: [
      { author: 'Nina A.', rating: 4.1, date: 'Jul 12, 2026', text: 'Reliable healthy lunch spot with fast service.' },
      { author: 'Chris P.', rating: 4.0, date: 'Jul 04, 2026', text: 'Fresh ingredients and easy ordering.' }
    ]
  },
  {
    slug: 'bamboo-wok',
    name: 'Bamboo Wok',
    cuisine: 'Chinese',
    category: 'Family-style',
    location: 'Northside',
    neighborhood: 'Station Heights',
    priceRange: '$$',
    rating: 4.0,
    distanceKm: 5.3,
    isOpenNow: true,
    description: 'Wok dishes, dumplings, and family-style plates with generous portions.',
    contact: '+1 (555) 210-1852',
    menu: [
      { name: 'Kung Pao Chicken', description: 'Chili, peanuts, peppers, jasmine rice.', price: '$16' },
      { name: 'Pork Dumplings', description: 'Pan-seared dumplings with soy dip.', price: '$12' },
      { name: 'Fried Rice', description: 'Egg, scallion, vegetables, choice of protein.', price: '$13' }
    ],
    reviews: [
      { author: 'Zoe H.', rating: 4.1, date: 'Jul 14, 2026', text: 'Big portions and the dumplings were excellent.' },
      { author: 'Victor L.', rating: 4.0, date: 'Jul 06, 2026', text: 'Comforting family-style food and good value.' }
    ]
  },
  {
    slug: 'el-patio',
    name: 'El Patio',
    cuisine: 'Spanish',
    category: 'Tapas bar',
    location: 'Seaside',
    neighborhood: 'Marina Promenade',
    priceRange: '$$$',
    rating: 4.4,
    distanceKm: 6.0,
    isOpenNow: true,
    description: 'Tapas, paella, and shared plates with an easygoing terrace atmosphere.',
    contact: '+1 (555) 210-1853',
    menu: [
      { name: 'Seafood Paella', description: 'Saffron rice, clams, mussels, prawns.', price: '$31' },
      { name: 'Patatas Bravas', description: 'Crispy potatoes with spicy aioli.', price: '$10' },
      { name: 'Churros con Chocolate', description: 'Cinnamon sugar and rich chocolate sauce.', price: '$9' }
    ],
    reviews: [
      { author: 'Carla F.', rating: 4.5, date: 'Jul 18, 2026', text: 'Great terrace setting and a very strong paella.' },
      { author: 'Adam R.', rating: 4.3, date: 'Jul 08, 2026', text: 'Perfect spot for sharing small plates with friends.' }
    ]
  }
];

export const restaurantSummaries = restaurantCatalog.map(({ slug, name, cuisine, location, neighborhood, priceRange, rating, distanceKm, isOpenNow, description }) => ({
  slug,
  name,
  cuisine,
  location,
  neighborhood,
  priceRange,
  rating,
  distanceKm,
  isOpenNow,
  description
}));

export function getRestaurantBySlug(slug: string | null): RestaurantCatalogItem | undefined {
  if (!slug) {
    return undefined;
  }

  return restaurantCatalog.find((restaurant) => restaurant.slug === slug);
}
