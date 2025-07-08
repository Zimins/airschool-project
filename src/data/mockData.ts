export interface FlightSchool {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  description: string;
  shortDescription: string;
  image: string;
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
  price: string;
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
    name: '스카이윙스 비행학교',
    location: '서울, 대한민국',
    city: '서울',
    country: '대한민국',
    rating: 4.8,
    reviewCount: 124,
    priceRange: '$$$$',
    description: '30년 전통의 대한민국 최고의 비행 교육 기관입니다. 최신식 시설과 경험 많은 교관진이 여러분의 꿈을 현실로 만들어 드립니다.',
    shortDescription: '대한민국 최고의 비행 교육 기관',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800',
      'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800',
      'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800',
    ],
    features: ['최신 시뮬레이터', '1:1 맞춤 교육', '기숙사 제공', '취업 연계'],
    programs: [
      {
        id: 'p1',
        name: '자가용 조종사 과정 (PPL)',
        duration: '6개월',
        price: '₩15,000,000',
        description: '개인 비행을 위한 기초 과정',
      },
      {
        id: 'p2',
        name: '사업용 조종사 과정 (CPL)',
        duration: '18개월',
        price: '₩80,000,000',
        description: '항공사 취업을 위한 전문 과정',
      },
    ],
    contact: {
      phone: '02-1234-5678',
      email: 'info@skywings.kr',
      website: 'www.skywings.kr',
      address: '서울시 강서구 공항대로 123',
    },
  },
  {
    id: '2',
    name: '이글 항공 아카데미',
    location: '제주도, 대한민국',
    city: '제주',
    country: '대한민국',
    rating: 4.6,
    reviewCount: 89,
    priceRange: '$$$',
    description: '아름다운 제주도에서 비행의 꿈을 키워보세요. 최적의 비행 환경과 전문 교육 시스템을 제공합니다.',
    shortDescription: '제주도의 프리미엄 비행 학교',
    image: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800',
    gallery: [],
    features: ['해외 연수 프로그램', '영어 교육', '최신 항공기', '소규모 클래스'],
    programs: [
      {
        id: 'p3',
        name: '레저 비행 과정',
        duration: '3개월',
        price: '₩8,000,000',
        description: '취미로 즐기는 비행 입문 과정',
      },
    ],
    contact: {
      phone: '064-987-6543',
      email: 'fly@eagleaviation.kr',
      website: 'www.eagleaviation.kr',
      address: '제주시 공항로 456',
    },
  },
  {
    id: '3',
    name: '블루스카이 플라이트 센터',
    location: '부산, 대한민국',
    city: '부산',
    country: '대한민국',
    rating: 4.9,
    reviewCount: 156,
    priceRange: '$$$$',
    description: '국제 표준 교육 과정과 최첨단 시설을 갖춘 부산 최고의 비행 교육원입니다.',
    shortDescription: '부산 최고의 비행 교육원',
    image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800',
    gallery: [],
    features: ['국제 인증', 'ATPL 과정', '24시간 시설 이용', '멘토링 프로그램'],
    programs: [],
    contact: {
      phone: '051-555-7777',
      email: 'contact@bluesky.kr',
      website: 'www.bluesky.kr',
      address: '부산시 강서구 비행장로 789',
    },
  },
  {
    id: '4',
    name: '에어로 드림 아카데미',
    location: '인천, 대한민국',
    city: '인천',
    country: '대한민국',
    rating: 4.5,
    reviewCount: 72,
    priceRange: '$$$',
    description: '인천국제공항 인근의 접근성 좋은 비행 학교. 합리적인 가격으로 전문 교육을 제공합니다.',
    shortDescription: '인천국제공항 인근 비행 학교',
    image: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800',
    gallery: [],
    features: ['공항 인접', '유연한 스케줄', '온라인 교육', '장학금 제도'],
    programs: [],
    contact: {
      phone: '032-888-9999',
      email: 'info@aerodream.kr',
      website: 'www.aerodream.kr',
      address: '인천시 중구 공항로 321',
    },
  },
  {
    id: '5',
    name: '하늘길 비행학교',
    location: '대전, 대한민국',
    city: '대전',
    country: '대한민국',
    rating: 4.7,
    reviewCount: 93,
    priceRange: '$$$',
    description: '중부권 최대 규모의 비행 교육 시설. 체계적인 커리큘럼과 우수한 교관진을 자랑합니다.',
    shortDescription: '중부권 최대 비행 교육 시설',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
    gallery: [],
    features: ['대규모 훈련장', '기상 교육', '항공 정비 과정', '기업 연계'],
    programs: [],
    contact: {
      phone: '042-333-4444',
      email: 'fly@skyway.kr',
      website: 'www.skyway.kr',
      address: '대전시 유성구 비행로 111',
    },
  },
];

export const mockReviews: Review[] = [
  {
    id: 'r1',
    schoolId: '1',
    userName: '김파일럿',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    title: '최고의 선택이었습니다!',
    content: '스카이윙스에서 PPL 과정을 마쳤습니다. 교관님들이 정말 전문적이고 친절하셔서 어려운 과정도 즐겁게 마칠 수 있었습니다. 시설도 깨끗하고 최신식이라 만족스러웠습니다.',
    date: '2024-01-15',
    helpful: 23,
  },
  {
    id: 'r2',
    schoolId: '1',
    userName: '이조종사',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    rating: 4,
    title: '전반적으로 만족스러운 교육',
    content: '교육 과정은 체계적이고 좋았습니다. 다만 수강료가 다소 비싼 편이라 부담스러웠습니다. 그래도 투자한 만큼의 가치는 있다고 생각합니다.',
    date: '2024-02-20',
    helpful: 15,
  },
  {
    id: 'r3',
    schoolId: '1',
    userName: '박하늘',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    title: '꿈을 이룬 곳',
    content: '어릴 때부터 파일럿이 꿈이었는데, 스카이윙스 덕분에 그 꿈을 이룰 수 있었습니다. 특히 취업 연계 프로그램이 정말 도움이 많이 되었습니다.',
    date: '2024-03-10',
    helpful: 34,
  },
  {
    id: 'r4',
    schoolId: '2',
    userName: '최비행',
    userAvatar: 'https://i.pravatar.cc/150?img=4',
    rating: 5,
    title: '제주도에서의 특별한 경험',
    content: '제주도의 아름다운 풍경을 보며 비행을 배울 수 있어서 정말 좋았습니다. 교육 품질도 훌륭하고, 소규모 클래스라 개인 지도를 많이 받을 수 있었습니다.',
    date: '2024-01-20',
    helpful: 18,
  },
  {
    id: 'r5',
    schoolId: '2',
    userName: '정구름',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    rating: 4,
    title: '레저 비행 입문으로 추천',
    content: '취미로 비행을 배우고 싶어서 등록했는데, 부담 없이 즐겁게 배울 수 있었습니다. 교관님들도 친절하고 시설도 깨끗했습니다.',
    date: '2024-02-15',
    helpful: 12,
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