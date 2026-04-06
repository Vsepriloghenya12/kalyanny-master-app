import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { fetchContent } from './api';
import { BottomNav } from './components/BottomNav';
import { MixModal } from './components/MixModal';
import { MobileShell } from './components/MobileShell';
import { ProductModal } from './components/ProductModal';
import { TopLogo } from './components/TopLogo';
import { useFavorites } from './hooks/useFavorites';
import { CatalogPage, type CatalogFilter, type CatalogFocusTarget } from './pages/CatalogPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { HomePage } from './pages/HomePage';
import { KalyanMixerPage } from './pages/KalyanMixerPage';
import { OwnerPage } from './pages/OwnerPage';
import { PicksPage } from './pages/PicksPage';
import type { AppContent, MainTab, Mix, Product } from './types';

function MainApp() {
  const [content, setContent] = useState<AppContent | null>(null);
  const [tab, setTab] = useState<MainTab>('home');
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>('tobacco');
  const [activeMix, setActiveMix] = useState<Mix | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [catalogFocusTarget, setCatalogFocusTarget] = useState<CatalogFocusTarget | null>(null);
  const [mixerView, setMixerView] = useState<'all' | 'popular'>('all');
  const favorites = useFavorites();

  useEffect(() => {
    fetchContent().then(setContent).catch(() => null);
  }, []);

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
    setTab('mixer');
    setMixerView('popular');
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
          onCatalogFilterChange={setCatalogFilter}
          onBannerAction={handleBannerAction}
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

    return (
      <KalyanMixerPage
        content={content}
        favoriteMixes={favorites.state.mixes}
        onToggleFavoriteMix={favorites.toggleMix}
        onOpenMix={setActiveMix}
        onOpenProduct={setActiveProduct}
        showPopularOnly={mixerView === 'popular'}
      />
    );
  }, [catalogFilter, catalogFocusTarget, content, favorites.state.brands, favorites.state.mixes, favorites.state.products, favorites.toggleBrand, favorites.toggleMix, favorites.toggleProduct, mixerView, tab]);

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
      <BottomNav currentTab={tab} onChange={handleMainTabChange} />
      <MixModal mix={activeMix} onClose={() => setActiveMix(null)} />
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
