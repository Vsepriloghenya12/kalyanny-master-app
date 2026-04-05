import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { fetchContent } from './api';
import { BottomNav } from './components/BottomNav';
import { MixModal } from './components/MixModal';
import { MobileShell } from './components/MobileShell';
import { TopLogo } from './components/TopLogo';
import { useFavorites } from './hooks/useFavorites';
import { CatalogPage, type CatalogFilter } from './pages/CatalogPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { HomePage } from './pages/HomePage';
import { MixerPage } from './pages/MixerPage';
import { OwnerPage } from './pages/OwnerPage';
import { PicksPage } from './pages/PicksPage';
import type { AppContent, MainTab, Mix } from './types';

function MainApp() {
  const [content, setContent] = useState<AppContent | null>(null);
  const [tab, setTab] = useState<MainTab>('home');
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>('tobacco');
  const [activeMix, setActiveMix] = useState<Mix | null>(null);
  const [mixerView, setMixerView] = useState<'all' | 'popular'>('all');
  const favorites = useFavorites();

  useEffect(() => {
    fetchContent().then(setContent).catch(() => null);
  }, []);

  const handleBannerAction = (target: string) => {
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
    if (target === 'tab:tobacco') {
      setTab('catalog');
      setCatalogFilter('tobacco');
      setMixerView('all');
      return;
    }
    if (target === 'tab:hookah') {
      setTab('catalog');
      setCatalogFilter('hookah');
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
          favoriteProducts={favorites.state.products}
          favoriteBrands={favorites.state.brands}
          onToggleProduct={favorites.toggleProduct}
          onToggleBrand={favorites.toggleBrand}
        />
      );
    }

    if (tab === 'picks') {
      return <PicksPage content={content} />;
    }

    return (
      <MixerPage
        content={content}
        favoriteMixes={favorites.state.mixes}
        onToggleFavoriteMix={favorites.toggleMix}
        onOpenMix={setActiveMix}
        showPopularOnly={mixerView === 'popular'}
      />
    );
  }, [catalogFilter, content, favorites.state.brands, favorites.state.mixes, favorites.state.products, favorites.toggleBrand, favorites.toggleMix, favorites.toggleProduct, mixerView, tab]);

  return (
    <MobileShell>
      <TopLogo />
      <main className="app-content">{page}</main>
      <BottomNav currentTab={tab} onChange={handleMainTabChange} />
      <MixModal mix={activeMix} onClose={() => setActiveMix(null)} />
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
