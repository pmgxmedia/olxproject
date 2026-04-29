import type { Category, Listing, User, Enquiry, CommissionAd, VisitorStats } from '@/types'

export const mockUsers: User[] = [
  { id: 1, name: 'Sarah Miller', email: 'sarah@demo.com', phone: '+27 71 555 0101', location_city: 'Cape Town', location_state: 'Western Cape', avatar_url: null, role: 'user', status: 'active', created_at: '2025-06-15T10:00:00Z' },
  { id: 2, name: 'James Wilson', email: 'james@demo.com', phone: '+27 82 555 0102', location_city: 'Johannesburg', location_state: 'Gauteng', avatar_url: null, role: 'user', status: 'active', created_at: '2025-08-20T10:00:00Z' },
  { id: 3, name: 'Admin', email: 'admin@tradeflex.com', phone: '+27 60 555 0100', location_city: 'Pretoria', location_state: 'Gauteng', avatar_url: null, role: 'admin', status: 'active', created_at: '2025-01-01T10:00:00Z' },
]

export const mockCategories: Category[] = [
  { id: 1, name: 'Vehicles', slug: 'vehicles', icon: 'car', parent_id: null, children: [
    { id: 11, name: 'Cars', slug: 'cars', icon: 'car', parent_id: 1 },
    { id: 12, name: 'Motorcycles', slug: 'motorcycles', icon: 'bike', parent_id: 1 },
  ]},
  { id: 2, name: 'Electronics', slug: 'electronics', icon: 'smartphone', parent_id: null, children: [
    { id: 21, name: 'Phones', slug: 'phones', icon: 'smartphone', parent_id: 2 },
    { id: 22, name: 'Computers', slug: 'computers', icon: 'monitor', parent_id: 2 },
    { id: 23, name: 'TVs & Audio', slug: 'tvs-audio', icon: 'tv', parent_id: 2 },
  ]},
  { id: 3, name: 'Property', slug: 'property', icon: 'home', parent_id: null, children: [
    { id: 31, name: 'Apartments', slug: 'apartments', icon: 'building', parent_id: 3 },
    { id: 32, name: 'Houses', slug: 'houses', icon: 'home', parent_id: 3 },
  ]},
  { id: 4, name: 'Furniture & Home', slug: 'furniture-home', icon: 'sofa', parent_id: null },
  { id: 5, name: 'Fashion', slug: 'fashion', icon: 'shirt', parent_id: null },
  { id: 6, name: 'Sports & Leisure', slug: 'sports-leisure', icon: 'dumbbell', parent_id: null },
  { id: 7, name: 'Services', slug: 'services', icon: 'wrench', parent_id: null },
  { id: 8, name: 'Kids', slug: 'kids', icon: 'baby', parent_id: null },
  { id: 9, name: 'Jobs', slug: 'jobs', icon: 'briefcase', parent_id: null },
]

const IMG = 'https://picsum.photos/seed'

export const mockListings: Listing[] = [
  {
    id: 1, user_id: 1, category_id: 2, title: 'iPhone 15 Pro Max — 256GB, Excellent Condition',
    description: 'Barely used iPhone 15 Pro Max in Natural Titanium. Comes with original box, charger, and case. Battery health 98%. No scratches or dents.',
    price: 16350, currency: 'ZAR', location_city: 'Cape Town', location_state: 'Western Cape', location_suburb: 'Gardens', location_lat: -33.9321, location_lng: 18.4131, condition: 'used',
    status: 'active', video_url: null, video_thumbnail_url: null, views_count: 234,
    images: [
      { id: 1, image_url: `${IMG}/iphone1/400/300`, processed_image_url: null, is_primary: true, sort_order: 0 },
      { id: 2, image_url: `${IMG}/iphone2/400/300`, processed_image_url: null, is_primary: false, sort_order: 1 },
    ],
    seller: mockUsers[0], category: mockCategories[1], is_favorited: false,
    created_at: '2026-04-12T08:30:00Z', updated_at: '2026-04-12T08:30:00Z',
  },
  {
    id: 2, user_id: 2, category_id: 1, title: '2022 Toyota Corolla Cross — Low Mileage, Full Service History',
    description: 'Full service history, single owner, 28 000 km. Regular maintenance at dealer. Includes spare key. Non-smoker vehicle.',
    price: 445900, currency: 'ZAR', location_city: 'Johannesburg', location_state: 'Gauteng', location_suburb: 'Braamfontein', location_lat: -26.1952, location_lng: 28.0334, condition: 'used',
    status: 'active', video_url: 'https://www.example.com/demo.mp4', video_thumbnail_url: `${IMG}/car-thumb/400/300`, views_count: 567,
    images: [
      { id: 3, image_url: `${IMG}/camry1/400/300`, processed_image_url: null, is_primary: true, sort_order: 0 },
      { id: 4, image_url: `${IMG}/camry2/400/300`, processed_image_url: null, is_primary: false, sort_order: 1 },
      { id: 5, image_url: `${IMG}/camry3/400/300`, processed_image_url: null, is_primary: false, sort_order: 2 },
    ],
    seller: mockUsers[1], category: mockCategories[0], is_favorited: true,
    created_at: '2026-04-10T14:00:00Z', updated_at: '2026-04-10T14:00:00Z',
  },
  {
    id: 3, user_id: 1, category_id: 4, title: 'Mid-Century Modern Sofa — Walnut Frame',
    description: 'Beautiful mid-century modern sofa with solid walnut frame. Upholstered in premium gray fabric. Excellent condition, from a pet-free home.',
    price: 11800, currency: 'ZAR', location_city: 'Cape Town', location_state: 'Western Cape', location_suburb: 'Woodstock', location_lat: -33.9277, location_lng: 18.4453, condition: 'used',
    status: 'active', video_url: null, video_thumbnail_url: null, views_count: 89,
    images: [
      { id: 6, image_url: `${IMG}/sofa1/400/300`, processed_image_url: `${IMG}/sofa1bg/400/300`, is_primary: true, sort_order: 0 },
    ],
    seller: mockUsers[0], category: mockCategories[3], is_favorited: false,
    created_at: '2026-04-11T11:00:00Z', updated_at: '2026-04-11T11:00:00Z',
  },
  {
    id: 4, user_id: 2, category_id: 2, title: 'MacBook Pro 14" M3 — 16GB RAM, 512GB SSD',
    description: 'Like-new MacBook Pro 14 inch with M3 chip. Space Black. AppleCare+ until 2027. Includes original box and USB-C cable.',
    price: 29100, currency: 'ZAR', location_city: 'Johannesburg', location_state: 'Gauteng', location_suburb: 'Rosebank', location_lat: -26.1467, location_lng: 28.0436, condition: 'used',
    status: 'active', video_url: null, video_thumbnail_url: null, views_count: 312,
    images: [
      { id: 7, image_url: `${IMG}/macbook1/400/300`, processed_image_url: null, is_primary: true, sort_order: 0 },
      { id: 8, image_url: `${IMG}/macbook2/400/300`, processed_image_url: null, is_primary: false, sort_order: 1 },
    ],
    seller: mockUsers[1], category: mockCategories[1], is_favorited: false,
    created_at: '2026-04-09T16:00:00Z', updated_at: '2026-04-09T16:00:00Z',
  },
  {
    id: 5, user_id: 1, category_id: 5, title: 'Nike Air Max 90 — Size 10, Brand New',
    description: 'Brand new in box Nike Air Max 90. White/Black colorway. Size 10 UK. Never worn. Retail was R2 400.',
    price: 1730, currency: 'ZAR', location_city: 'Cape Town', location_state: 'Western Cape', location_suburb: 'Sea Point', location_lat: -33.9170, location_lng: 18.3867, condition: 'new',
    status: 'active', video_url: null, video_thumbnail_url: null, views_count: 45,
    images: [
      { id: 9, image_url: `${IMG}/nike1/400/300`, processed_image_url: null, is_primary: true, sort_order: 0 },
    ],
    seller: mockUsers[0], category: mockCategories[4], is_favorited: true,
    created_at: '2026-04-13T09:00:00Z', updated_at: '2026-04-13T09:00:00Z',
  },
  {
    id: 6, user_id: 2, category_id: 3, title: 'Spacious 2BR Apartment — Sandton, JHB',
    description: 'Beautiful 2-bedroom apartment in Sandton. 88 m², modern kitchen, secure parking, 24hr security. Available May 1.',
    price: 14500, currency: 'ZAR', location_city: 'Sandton', location_state: 'Gauteng', location_suburb: 'Sandton Central', location_lat: -26.1076, location_lng: 28.0567, condition: 'new',
    status: 'active', video_url: 'https://www.example.com/apt-tour.mp4', video_thumbnail_url: `${IMG}/apt-thumb/400/300`, views_count: 890,
    images: [
      { id: 10, image_url: `${IMG}/apt1/400/300`, processed_image_url: null, is_primary: true, sort_order: 0 },
      { id: 11, image_url: `${IMG}/apt2/400/300`, processed_image_url: null, is_primary: false, sort_order: 1 },
      { id: 12, image_url: `${IMG}/apt3/400/300`, processed_image_url: null, is_primary: false, sort_order: 2 },
    ],
    seller: mockUsers[1], category: mockCategories[2], is_favorited: false,
    created_at: '2026-04-08T12:00:00Z', updated_at: '2026-04-08T12:00:00Z',
  },
  {
    id: 7, user_id: 1, category_id: 6, title: 'Peloton Bike+ — Barely Used, All Accessories',
    description: 'Peloton Bike+ with heart rate monitor, cycling shoes (size 42), weights, and mat. Only 30 rides. Moving, must sell.',
    price: 21800, currency: 'ZAR', location_city: 'Cape Town', location_state: 'Western Cape', location_suburb: 'Constantia', location_lat: -34.0254, location_lng: 18.4308, condition: 'used',
    status: 'active', video_url: null, video_thumbnail_url: null, views_count: 156,
    images: [
      { id: 13, image_url: `${IMG}/peloton1/400/300`, processed_image_url: null, is_primary: true, sort_order: 0 },
    ],
    seller: mockUsers[0], category: mockCategories[5], is_favorited: false,
    created_at: '2026-04-07T10:00:00Z', updated_at: '2026-04-07T10:00:00Z',
  },
  {
    id: 8, user_id: 2, category_id: 4, title: 'Standing Desk — Electric, 150×75 cm',
    description: 'FlexiSpot E7 standing desk. Electric height adjustable. Bamboo top, 150×75 cm. Excellent condition with cable management tray.',
    price: 6400, currency: 'ZAR', location_city: 'Durban', location_state: 'KwaZulu-Natal', location_suburb: 'Umhlanga', location_lat: -29.7230, location_lng: 31.0681, condition: 'used',
    status: 'active', video_url: null, video_thumbnail_url: null, views_count: 78,
    images: [
      { id: 14, image_url: `${IMG}/desk1/400/300`, processed_image_url: null, is_primary: true, sort_order: 0 },
    ],
    seller: mockUsers[1], category: mockCategories[3], is_favorited: false,
    created_at: '2026-04-06T15:00:00Z', updated_at: '2026-04-06T15:00:00Z',
  },
]

export const mockEnquiries: Enquiry[] = [
  { id: 1, listing_id: 1, listing_title: 'iPhone 15 Pro Max — 256GB, Excellent Condition', sender_id: 2, sender_name: 'James Wilson', sender_email: 'james@demo.com', message: 'Hi, is this still available? Can I come see it today?', status: 'new', created_at: '2026-04-17T09:15:00Z' },
  { id: 2, listing_id: 2, listing_title: '2022 Toyota Corolla Cross — Low Mileage', sender_id: 1, sender_name: 'Sarah Miller', sender_email: 'sarah@demo.com', message: 'Would you accept R420,000? I can pay cash immediately.', status: 'new', created_at: '2026-04-17T10:30:00Z' },
  { id: 3, listing_id: 4, listing_title: 'MacBook Pro 14" M3 — 16GB RAM', sender_id: 1, sender_name: 'Sarah Miller', sender_email: 'sarah@demo.com', message: 'Does it come with AppleCare? What\'s the battery cycle count?', status: 'read', created_at: '2026-04-16T14:00:00Z' },
  { id: 4, listing_id: 6, listing_title: 'Spacious 2BR Apartment — Sandton, JHB', sender_id: 1, sender_name: 'Sarah Miller', sender_email: 'sarah@demo.com', message: 'Is the apartment pet-friendly? How much is the deposit?', status: 'replied', created_at: '2026-04-15T16:45:00Z' },
  { id: 5, listing_id: 3, listing_title: 'Mid-Century Modern Sofa — Walnut Frame', sender_id: 2, sender_name: 'James Wilson', sender_email: 'james@demo.com', message: 'Can you deliver to Johannesburg? I\'ll cover shipping costs.', status: 'read', created_at: '2026-04-15T11:20:00Z' },
  { id: 6, listing_id: 7, listing_title: 'Peloton Bike+ — Barely Used', sender_id: 2, sender_name: 'James Wilson', sender_email: 'james@demo.com', message: 'Is the Peloton subscription transferable?', status: 'archived', created_at: '2026-04-14T08:00:00Z' },
  { id: 7, listing_id: 5, listing_title: 'Nike Air Max 90 — Size 10, Brand New', sender_id: 2, sender_name: 'James Wilson', sender_email: 'james@demo.com', message: 'Do you have size 11 as well?', status: 'new', created_at: '2026-04-17T12:00:00Z' },
]

export const mockCommissionAds: CommissionAd[] = [
  { id: 1, advertiser_name: 'AutoTrader SA', advertiser_email: 'ads@autotrader.co.za', title: 'Find Your Dream Car', image_url: `${IMG}/ad-auto/400/200`, link_url: 'https://www.autotrader.co.za', commission_rate: 12.5, clicks: 1240, impressions: 34500, revenue: 3875.00, status: 'active', start_date: '2026-03-01', end_date: '2026-06-30', created_at: '2026-02-25T10:00:00Z' },
  { id: 2, advertiser_name: 'Takealot', advertiser_email: 'partnerships@takealot.com', title: 'Electronics Sale — Up to 40% Off', image_url: `${IMG}/ad-takealot/400/200`, link_url: 'https://www.takealot.com', commission_rate: 8.0, clicks: 890, impressions: 28700, revenue: 2136.00, status: 'active', start_date: '2026-04-01', end_date: '2026-04-30', created_at: '2026-03-28T10:00:00Z' },
  { id: 3, advertiser_name: 'Property24', advertiser_email: 'ads@property24.com', title: 'List Your Property Today', image_url: `${IMG}/ad-property/400/200`, link_url: 'https://www.property24.com', commission_rate: 15.0, clicks: 560, impressions: 19200, revenue: 4200.00, status: 'active', start_date: '2026-02-15', end_date: '2026-08-15', created_at: '2026-02-10T10:00:00Z' },
  { id: 4, advertiser_name: 'FNB Home Loans', advertiser_email: 'digital@fnb.co.za', title: 'Home Loan Pre-Approval in 24hrs', image_url: `${IMG}/ad-fnb/400/200`, link_url: 'https://www.fnb.co.za', commission_rate: 20.0, clicks: 320, impressions: 15400, revenue: 6400.00, status: 'paused', start_date: '2026-01-01', end_date: '2026-12-31', created_at: '2025-12-20T10:00:00Z' },
  { id: 5, advertiser_name: 'Vodacom Deals', advertiser_email: 'ads@vodacom.co.za', title: 'Upgrade Your Phone — Contract Deals', image_url: `${IMG}/ad-vodacom/400/200`, link_url: 'https://www.vodacom.co.za', commission_rate: 10.0, clicks: 2100, impressions: 45000, revenue: 5250.00, status: 'expired', start_date: '2026-01-01', end_date: '2026-03-31', created_at: '2025-12-15T10:00:00Z' },
]

export const mockVisitorStats: VisitorStats[] = [
  { date: '2026-04-11', visitors: 1245, page_views: 4820, signups: 12 },
  { date: '2026-04-12', visitors: 1380, page_views: 5210, signups: 18 },
  { date: '2026-04-13', visitors: 1520, page_views: 5890, signups: 15 },
  { date: '2026-04-14', visitors: 980, page_views: 3650, signups: 8 },
  { date: '2026-04-15', visitors: 1150, page_views: 4300, signups: 11 },
  { date: '2026-04-16', visitors: 1420, page_views: 5500, signups: 20 },
  { date: '2026-04-17', visitors: 1610, page_views: 6100, signups: 22 },
]
