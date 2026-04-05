import { BannerCarousel } from '../components/BannerCarousel';
import { MixGrid } from '../components/MixGrid';
import { QuickIconsRow } from '../components/QuickIconsRow';
import { SectionTitle } from '../components/SectionTitle';
import type { AppContent, MainTab, Mix } from '../types';

type HomePageProps = {
  content: AppContent;
  favoriteMixes: string[];
  onToggleFavoriteMix: (id: string) => void;
  onOpenMix: (mix: Mix) => void;
  setMainTab: (tab: MainTab) => void;
  onOpenPopularMixes: () => void;
  onCatalogFilterChange: (filter: 'tobacco' | 'hookah' | 'brands') => void;
  onBannerAction: (target: string) => void;
};

export function HomePage({
  content,
  favoriteMixes,
  onToggleFavoriteMix,
  onOpenMix,
  setMainTab,
  onOpenPopularMixes,
  onCatalogFilterChange,
  onBannerAction
}: HomePageProps) {
  const popularMixes = content.mixes.filter((mix) => mix.isPopular);

  return (
    <>
      <BannerCarousel banners={content.banners} onAction={onBannerAction} />
      <QuickIconsRow
        setTab={setMainTab}
        onOpenTobaccos={() => onCatalogFilterChange('tobacco')}
        onOpenHookahs={() => onCatalogFilterChange('hookah')}
        onOpenBrands={() => onCatalogFilterChange('brands')}
        onOpenMixes={() => setMainTab('mixer')}
      />
      <section className="content-section">
        <SectionTitle
          title="Популярные миксы от кальянных мастеров"
          action={
            <button type="button" className="section-link-button" onClick={onOpenPopularMixes}>
              Смотреть все
            </button>
          }
        />
        <MixGrid mixes={popularMixes} favorites={favoriteMixes} onOpen={onOpenMix} onToggleFavorite={onToggleFavoriteMix} layout="rail" />
      </section>

      <section className="content-section">
        <SectionTitle title="Вкусы" />
        <MixGrid mixes={content.mixes} favorites={favoriteMixes} onOpen={onOpenMix} onToggleFavorite={onToggleFavoriteMix} />
      </section>
    </>
  );
}
