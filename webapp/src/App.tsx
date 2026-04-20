import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { createUserMix, fetchContent, fetchCurrentUser, rateTarget, registerUser } from './api';
import type { CreateUserMixInput } from './api';
import { BottomNav } from './components/BottomNav';
import { MixModal } from './components/MixModal';
import { MobileShell } from './components/MobileShell';
import { ProductModal } from './components/ProductModal';
import { TopLogo } from './components/TopLogo';
import { UserAuthPanel } from './components/UserAuthPanel';
import { useFavorites } from './hooks/useFavorites';
import { CatalogPage, type CatalogFilter, type CatalogFocusTarget } from './pages/CatalogPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { HomePage } from './pages/HomePage';
import { KalyanMixerPage } from './pages/KalyanMixerPage';
import { MixerPage } from './pages/MixerPage';
import { OwnerPage } from './pages/OwnerPage';
import { PicksPage } from './pages/PicksPage';
import { TastesPage } from './pages/TastesPage';
import type { AppContent, MainTab, Mix, Product, PublicUser, RatingSummary, RatingTargetType, UserRating } from './types';

const USER_TOKEN_STORAGE_KEY = 'kalyanny-master-user-token';
const MAIN_TABS: MainTab[] = ['home', 'favorites', 'catalog', 'picks', 'mixes', 'mixer', 'tastes'];

function getInitialTab(): MainTab {
  const tab = new URLSearchParams(window.location.search).get('tab');
  return MAIN_TABS.includes(tab as MainTab) ? (tab as MainTab) : 'home';
}

function findRatingSummary(summaries: RatingSummary[] | undefined, targetType: RatingTargetType, targetId: string) {
  return summaries?.find((summary) => summary.targetType === targetType && summary.targetId === targetId);
}

function findUserRating(ratings: UserRating[], targetType: RatingTargetType, targetId: string) {
  return ratings.find((rating) => rating.targetType === targetType && rating.targetId === targetId);
}

function upsertRating(ratings: UserRating[], nextRating: UserRating) {
  const existingIndex = ratings.findIndex((rating) => rating.id === nextRating.id);
  if (existingIndex === -1) return [...ratings, nextRating];
  return ratings.map((rating, index) => (index === existingIndex ? nextRating : rating));
}

function upsertSummary(summaries: RatingSummary[] | undefined, nextSummary: RatingSummary) {
  const safeSummaries = summaries ?? [];
  const existingIndex = safeSummaries.findIndex((summary) => summary.targetType === nextSummary.targetType && summary.targetId === nextSummary.targetId);
  if (existingIndex === -1) return [...safeSummaries, nextSummary];
  return safeSummaries.map((summary, index) => (index === existingIndex ? nextSummary : summary));
}

function MainApp() {
  const [content, setContent] = useState<AppContent | null>(null);
  const [tab, setTab] = useState<MainTab>(getInitialTab);
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>('tobacco');
  const [activeMix, setActiveMix] = useState<Mix | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [catalogFocusTarget, setCatalogFocusTarget] = useState<CatalogFocusTarget | null>(null);
  const [mixerView, setMixerView] = useState<'all' | 'popular'>('all');
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(USER_TOKEN_STORAGE_KEY) ?? '');
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [userRatings, setUserRatings] = useState<UserRating[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const favorites = useFavorites();

  useEffect(() => {
    fetchContent().then(setContent).catch(() => null);
  }, []);

  useEffect(() => {
    if (!authToken) {
      setCurrentUser(null);
      setUserRatings([]);
      return;
    }

    fetchCurrentUser(authToken)
      .then((session) => {
        setCurrentUser(session.user);
        setUserRatings(session.ratings);
      })
      .catch(() => {
        localStorage.removeItem(USER_TOKEN_STORAGE_KEY);
        setAuthToken('');
        setCurrentUser(null);
        setUserRatings([]);
      });
  }, [authToken]);

  const handleBannerAction = (target: string) => {
    if (target.startsWith('brand:')) {
      setTab('catalog');
      setCatalogFilter('tobacco');
      setCatalogFocusTarget({ type: 'brand', id: target.slice('brand:'.length) });
      setMixerView('all');
      return;
    }
    if (target.startsWith('product:')) {
      setTab('catalog');
      setCatalogFilter('tobacco');
      setCatalogFocusTarget({ type: 'product', id: target.slice('product:'.length) });
      setMixerView('all');
      return;
    }
    if (target === 'tab:mixer') {
      setTab('mixer');
      setMixerView('all');
      return;
    }
    if (target === 'tab:mixes') {
      setTab('mixes');
      setMixerView('all');
      return;
    }
    if (target === 'tab:picks') {
      setTab('picks');
      setMixerView('all');
      return;
    }
    if (target === 'tab:brands') {
      setTab('catalog');
      setCatalogFilter('brands');
      setMixerView('all');
      return;
    }
    if (target === 'tab:accessories') {
      setTab('catalog');
      setCatalogFilter('accessories');
      setCatalogFocusTarget({ type: 'accessories-all' });
      setMixerView('all');
      return;
    }
    if (target === 'tab:tobacco') {
      setTab('catalog');
      setCatalogFilter('tobacco');
      setCatalogFocusTarget({ type: 'tobacco-all' });
      setMixerView('all');
      return;
    }
    if (target === 'tab:hookah') {
      setTab('catalog');
      setCatalogFilter('hookah');
      setCatalogFocusTarget({ type: 'hookah-all' });
      setMixerView('all');
      return;
    }
    window.open(target, '_self');
  };

  const handleMainTabChange = (nextTab: MainTab) => {
    setTab(nextTab);
    setMixerView('all');
  };

  const handleOpenPopularMixes = () => {
    setTab('mixes');
    setMixerView('popular');
  };

  const handleOpenAllTastes = () => {
    setTab('tastes');
    setMixerView('all');
  };

  const handleUserSubmit = async (phone: string, nickname: string) => {
    const session = await registerUser(phone, nickname);
    localStorage.setItem(USER_TOKEN_STORAGE_KEY, session.token);
    setAuthToken(session.token);
    setCurrentUser(session.user);
    setUserRatings(session.ratings);
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_TOKEN_STORAGE_KEY);
    setAuthToken('');
    setCurrentUser(null);
    setUserRatings([]);
    setIsAuthOpen(false);
  };

  const handleRate = async (targetType: RatingTargetType, targetId: string, value: number) => {
    if (!authToken) {
      setIsAuthOpen(true);
      throw new Error('Сначала войдите по телефону');
    }

    const result = await rateTarget(authToken, targetType, targetId, value);
    setUserRatings((current) => upsertRating(current, result.rating));
    setContent((current) => current ? { ...current, ratingSummaries: upsertSummary(current.ratingSummaries, result.summary) } : current);
  };

  const handleCreateUserMix = async (input: CreateUserMixInput) => {
    if (!authToken) {
      setIsAuthOpen(true);
      throw new Error('Сначала войдите по телефону');
    }

    const mix = await createUserMix(authToken, input);
    setContent((current) => current ? { ...current, mixes: [mix, ...current.mixes] } : current);
    return mix;
  };

  const page = useMemo(() => {
    if (!content) {
      return <div className="screen-message">Загрузка приложения...</div>;
    }

    if (tab === 'home') {
      return (
        <HomePage
          content={content}
          favoriteMixes={favorites.state.mixes}
          onToggleFavoriteMix={favorites.toggleMix}
          onOpenMix={setActiveMix}
          setMainTab={handleMainTabChange}
          onOpenPopularMixes={handleOpenPopularMixes}
          onOpenAllTastes={handleOpenAllTastes}
          onBannerAction={handleBannerAction}
          user={currentUser}
          userRatings={userRatings}
          onLoginRequest={() => setIsAuthOpen(true)}
          onRate={handleRate}
        />
      );
    }

    if (tab === 'favorites') {
      return (
        <FavoritesPage
          content={content}
          favoriteMixes={favorites.state.mixes}
          favoriteProducts={favorites.state.products}
          favoriteBrands={favorites.state.brands}
          onOpenMix={setActiveMix}
          onToggleMix={favorites.toggleMix}
          onToggleProduct={favorites.toggleProduct}
          onToggleBrand={favorites.toggleBrand}
        />
      );
    }

    if (tab === 'catalog') {
      return (
        <CatalogPage
          content={content}
          filter={catalogFilter}
          onFilterChange={setCatalogFilter}
          focusTarget={catalogFocusTarget}
          onFocusTargetHandled={() => setCatalogFocusTarget(null)}
          favoriteProducts={favorites.state.products}
          favoriteBrands={favorites.state.brands}
          onOpenProduct={setActiveProduct}
          onToggleProduct={favorites.toggleProduct}
          onToggleBrand={favorites.toggleBrand}
        />
      );
    }

    if (tab === 'picks') {
      return <PicksPage content={content} />;
    }

    if (tab === 'mixes') {
      return (
        <MixerPage
          content={content}
          favoriteMixes={favorites.state.mixes}
          onToggleFavoriteMix={favorites.toggleMix}
          onOpenMix={setActiveMix}
          showPopularOnly={mixerView === 'popular'}
        />
      );
    }

    if (tab === 'tastes') {
      return (
        <TastesPage
          content={content}
          user={currentUser}
          userRatings={userRatings}
          onOpenMix={setActiveMix}
          onLoginRequest={() => setIsAuthOpen(true)}
          onRate={handleRate}
        />
      );
    }

    return (
        <KalyanMixerPage
          content={content}
          favoriteMixes={favorites.state.mixes}
          onToggleFavoriteMix={favorites.toggleMix}
          onOpenMix={setActiveMix}
          onOpenProduct={setActiveProduct}
          currentUser={currentUser}
          onLoginRequest={() => setIsAuthOpen(true)}
          onCreateMix={handleCreateUserMix}
          showPopularOnly={mixerView === 'popular'}
        />
      );
  }, [catalogFilter, catalogFocusTarget, content, currentUser, favorites.state.brands, favorites.state.mixes, favorites.state.products, favorites.toggleBrand, favorites.toggleMix, favorites.toggleProduct, mixerView, tab, userRatings]);

  return (
    <MobileShell>
      {tab === 'home' ? (
        <div className="home-hero-stack">
          <main className="app-content">{page}</main>
          <TopLogo />
        </div>
      ) : (
        <>
          <TopLogo />
          <main className="app-content">{page}</main>
        </>
      )}
      <UserAuthPanel
        user={currentUser}
        isOpen={isAuthOpen}
        onOpen={() => setIsAuthOpen(true)}
        onClose={() => setIsAuthOpen(false)}
        onSubmit={handleUserSubmit}
        onLogout={handleLogout}
      />
      <BottomNav currentTab={tab} onChange={handleMainTabChange} />
      <MixModal
        mix={activeMix}
        user={currentUser}
        ratingSummary={activeMix && content ? findRatingSummary(content.ratingSummaries, 'mix', activeMix.id) : undefined}
        userRating={activeMix ? findUserRating(userRatings, 'mix', activeMix.id) : undefined}
        onClose={() => setActiveMix(null)}
        onLoginRequest={() => setIsAuthOpen(true)}
        onRate={handleRate}
      />
      <ProductModal product={activeProduct} isFavorite={activeProduct ? favorites.state.products.includes(activeProduct.id) : false} onClose={() => setActiveProduct(null)} onToggleFavorite={favorites.toggleProduct} />
    </MobileShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/owner" element={<OwnerPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
