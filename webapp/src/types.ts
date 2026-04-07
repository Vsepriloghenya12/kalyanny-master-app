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
};

export type MainTab = 'home' | 'favorites' | 'catalog' | 'picks' | 'mixes' | 'mixer';
