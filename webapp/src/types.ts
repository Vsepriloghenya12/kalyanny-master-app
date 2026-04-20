export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonLabel: string;
  buttonTarget: string;
};

export type Mix = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  details: string;
  ingredients: string[];
  notes: string[];
  isPopular: boolean;
  authorId?: string;
  authorNickname?: string;
  createdAt?: string;
};

export type ProductType = 'tobacco' | 'hookah' | 'accessory';

export type Product = {
  id: string;
  title: string;
  brand: string;
  type: ProductType;
  line: string;
  strength: string;
  image: string;
  description: string;
  isNew: boolean;
};

export type Brand = {
  id: string;
  title: string;
  country: string;
  image: string;
  description: string;
  highlight: string;
};

export type NewsItem = {
  id: string;
  title: string;
  image: string;
  description: string;
  date: string;
  linkLabel: string;
  linkTarget: string;
};

export type Collection = {
  id: string;
  title: string;
  image: string;
  description: string;
  mixIds: string[];
};

export type PublicUser = {
  id: string;
  nickname: string;
};

export type RatingTargetType = 'mix' | 'taste';

export type UserRating = {
  id: string;
  userId: string;
  targetType: RatingTargetType;
  targetId: string;
  value: number;
  createdAt: string;
  updatedAt: string;
};

export type RatingSummary = {
  targetType: RatingTargetType;
  targetId: string;
  average: number;
  count: number;
};

export type AppContent = {
  app: {
    title: string;
    subtitle: string;
  };
  banners: Banner[];
  mixes: Mix[];
  products: Product[];
  brands: Brand[];
  news: NewsItem[];
  collections: Collection[];
  ratingSummaries?: RatingSummary[];
};

export type MainTab = 'home' | 'favorites' | 'catalog' | 'picks' | 'mixes' | 'mixer';
