export interface FlightSchool {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  rating: number;
  reviewCount: number;
  description: string;
  shortDescription: string;
  image?: string;
  gallery: string[];
  features: string[];
  programs: Program[];
  contact: {
    phone: string;
    email: string;
    website: string;
    address: string;
  };
}

export interface Program {
  id: string;
  name: string;
  duration: string;
  description: string;
}

export interface Review {
  id: string;
  schoolId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
}

export const mockFlightSchools: FlightSchool[] = [
  {
    id: '1',
    name: 'SkyWings Flight School',
    location: 'Seoul, South Korea',
    city: 'Seoul',
    country: 'South Korea',
    rating: 4.8,
    reviewCount: 124,
    description: 'Korea\'s premier flight training institution with 30 years of tradition. State-of-the-art facilities and experienced instructors make your aviation dreams come true.',
    shortDescription: 'Korea\'s premier flight training institution',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800',
      'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800',
      'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800',
    ],
    features: ['Latest Simulators', '1-on-1 Training', 'Dormitory Available', 'Career Placement'],
    programs: [
      {
        id: 'p1',
        name: 'Private Pilot License (PPL)',
        duration: '6 months',
        description: 'Foundation course for personal flying',
      },
      {
        id: 'p2',
        name: 'Commercial Pilot License (CPL)',
        duration: '18 months',
        description: 'Professional course for airline careers',
      },
    ],
    contact: {
      phone: '02-1234-5678',
      email: 'info@skywings.kr',
      website: 'www.skywings.kr',
      address: '123 Airport Blvd, Gangseo-gu, Seoul',
    },
  },
  {
    id: '2',
    name: 'Eagle Aviation Academy',
    location: 'Jeju Island, South Korea',
    city: 'Jeju',
    country: 'South Korea',
    rating: 4.6,
    reviewCount: 89,
    description: 'Pursue your aviation dreams in beautiful Jeju Island. We offer optimal flight conditions and professional training systems.',
    shortDescription: 'Premium flight school in Jeju Island',
    image: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800',
    gallery: [],
    features: ['International Exchange', 'English Training', 'Modern Aircraft', 'Small Classes'],
    programs: [
      {
        id: 'p3',
        name: 'Recreational Flying Course',
        duration: '3 months',
        description: 'Introduction course for hobby flying',
      },
    ],
    contact: {
      phone: '064-987-6543',
      email: 'fly@eagleaviation.kr',
      website: 'www.eagleaviation.kr',
      address: '456 Airport Road, Jeju City',
    },
  },
  {
    id: '3',
    name: 'BlueSky Flight Center',
    location: 'Busan, South Korea',
    city: 'Busan',
    country: 'South Korea',
    rating: 4.9,
    reviewCount: 156,
    description: 'Busan\'s premier flight training center with international standard curriculum and cutting-edge facilities.',
    shortDescription: 'Busan\'s premier flight training center',
    image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800',
    gallery: [],
    features: ['International Certification', 'ATPL Program', '24/7 Facility Access', 'Mentoring Program'],
    programs: [],
    contact: {
      phone: '051-555-7777',
      email: 'contact@bluesky.kr',
      website: 'www.bluesky.kr',
      address: '789 Aviation Way, Gangseo-gu, Busan',
    },
  },
  {
    id: '4',
    name: 'Aero Dream Academy',
    location: 'Incheon, South Korea',
    city: 'Incheon',
    country: 'South Korea',
    rating: 4.5,
    reviewCount: 72,
    description: 'Conveniently located near Incheon International Airport. Professional training at reasonable rates.',
    shortDescription: 'Flight school near Incheon Airport',
    image: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800',
    gallery: [],
    features: ['Airport Adjacent', 'Flexible Schedule', 'Online Training', 'Scholarship Program'],
    programs: [],
    contact: {
      phone: '032-888-9999',
      email: 'info@aerodream.kr',
      website: 'www.aerodream.kr',
      address: '321 Airport Road, Jung-gu, Incheon',
    },
  },
  {
    id: '5',
    name: 'Skyway Flight School',
    location: 'Daejeon, South Korea',
    city: 'Daejeon',
    country: 'South Korea',
    rating: 4.7,
    reviewCount: 93,
    description: 'Central Korea\'s largest flight training facility. Systematic curriculum with excellent instructors.',
    shortDescription: 'Central Korea\'s largest flight facility',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
    gallery: [],
    features: ['Large Training Area', 'Weather Training', 'Aircraft Maintenance', 'Corporate Partners'],
    programs: [],
    contact: {
      phone: '042-333-4444',
      email: 'fly@skyway.kr',
      website: 'www.skyway.kr',
      address: '111 Flight Road, Yuseong-gu, Daejeon',
    },
  },
  {
    id: '6',
    name: 'Horizon Aviation Training',
    location: 'Los Angeles, USA',
    city: 'Los Angeles',
    country: 'USA',
    rating: 4.4,
    reviewCount: 45,
    description: 'Professional flight training center offering comprehensive aviation programs. No visual marketing materials available at this time.',
    shortDescription: 'Professional aviation training center',
    gallery: [],
    features: ['FAA Certified', 'Year-round Flying', 'International Students', 'Housing Assistance'],
    programs: [
      {
        id: 'p4',
        name: 'Integrated ATPL Program',
        duration: '24 months',
        description: 'Complete airline pilot training from zero to ATPL',
      },
      {
        id: 'p5',
        name: 'Instrument Rating (IR)',
        duration: '2 months',
        description: 'Advanced navigation and weather flying',
      },
    ],
    contact: {
      phone: '+1-310-555-0123',
      email: 'training@horizonaviation.com',
      website: 'www.horizonaviation.com',
      address: '500 Aviation Circle, Los Angeles, CA 90045',
    },
  },
];

export const mockReviews: Review[] = [
  {
    id: 'r1',
    schoolId: '1',
    userName: 'John Kim',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    title: 'Best decision ever!',
    content: 'Completed my PPL at SkyWings. The instructors are professional and friendly, making even difficult lessons enjoyable. Facilities are clean and modern.',
    date: '2024-01-15',
    helpful: 23,
  },
  {
    id: 'r2',
    schoolId: '1',
    userName: 'Sarah Lee',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    rating: 4,
    title: 'Overall satisfactory training',
    content: 'The curriculum is well-structured and comprehensive. The training is thorough and prepares you well for your aviation career.',
    date: '2024-02-20',
    helpful: 15,
  },
  {
    id: 'r3',
    schoolId: '1',
    userName: 'Mike Park',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    title: 'Where dreams come true',
    content: 'Always dreamed of becoming a pilot, and SkyWings made it happen. The career placement program was extremely helpful.',
    date: '2024-03-10',
    helpful: 34,
  },
  {
    id: 'r4',
    schoolId: '2',
    userName: 'David Choi',
    userAvatar: 'https://i.pravatar.cc/150?img=4',
    rating: 5,
    title: 'Amazing experience in Jeju',
    content: 'Learning to fly while enjoying the beautiful scenery of Jeju Island was incredible. Great education quality and small class sizes meant lots of personal attention.',
    date: '2024-01-20',
    helpful: 18,
  },
  {
    id: 'r5',
    schoolId: '2',
    userName: 'Jennifer Jung',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    rating: 4,
    title: 'Perfect for recreational flying',
    content: 'Wanted to learn flying as a hobby and this was perfect. Instructors are patient and facilities are well-maintained.',
    date: '2024-02-15',
    helpful: 12,
  },
  {
    id: 'r6',
    schoolId: '6',
    userName: 'Alex Thompson',
    userAvatar: 'https://i.pravatar.cc/150?img=6',
    rating: 4,
    title: 'Solid training program',
    content: 'Horizon Aviation provides comprehensive training despite not having fancy marketing materials. The focus is on quality instruction and that shows.',
    date: '2024-03-05',
    helpful: 8,
  },
];

export const getRatingDistribution = (schoolId: string) => {
  const schoolReviews = mockReviews.filter(r => r.schoolId === schoolId);
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  schoolReviews.forEach(review => {
    distribution[review.rating as keyof typeof distribution]++;
  });
  
  return distribution;
};