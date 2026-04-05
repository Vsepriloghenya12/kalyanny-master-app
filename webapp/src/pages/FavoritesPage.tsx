import { ListRow } from '../components/ListRow';
import { MixGrid } from '../components/MixGrid';
import { SectionTitle } from '../components/SectionTitle';
import type { AppContent, Mix } from '../types';

type FavoritesPageProps = {
  content: AppContent;
  favoriteMixes: string[];
  favoriteProducts: string[];
  favoriteBrands: string[];
  onOpenMix: (mix: Mix) => void;
  onToggleMix: (id: string) => void;
  onToggleProduct: (id: string) => void;
  onToggleBrand: (id: string) => void;
};

export function FavoritesPage({ content, favoriteMixes, favoriteProducts, favoriteBrands, onOpenMix, onToggleMix, onToggleProduct, onToggleBrand }: FavoritesPageProps) {
  const mixes = content.mixes.filter((mix) => favoriteMixes.includes(mix.id));
  const products = content.products.filter((product) => favoriteProducts.includes(product.id));
  const brands = content.brands.filter((brand) => favoriteBrands.includes(brand.id));

  return (
    <section className="content-section">
      <SectionTitle title="Избранное" />

      {mixes.length ? (
        <>
          <SectionTitle title="Миксы" />
          <MixGrid mixes={mixes} favorites={favoriteMixes} onOpen={onOpenMix} onToggleFavorite={onToggleMix} />
        </>
      ) : null}

      {products.length ? (
        <>
          <SectionTitle title="Продукция" />
          <div className="list-stack">
            {products.map((product) => (
              <ListRow
                key={product.id}
                image={product.image}
                title={product.title}
                subtitle={product.description}
                meta={`${product.brand} · ${product.line}`}
                action={
                  <button type="button" className="mini-favorite is-active" onClick={() => onToggleProduct(product.id)}>
                    ♥
                  </button>
                }
              />
            ))}
          </div>
        </>
      ) : null}

      {brands.length ? (
        <>
          <SectionTitle title="Бренды" />
          <div className="list-stack">
            {brands.map((brand) => (
              <ListRow
                key={brand.id}
                image={brand.image}
                title={brand.title}
                subtitle={brand.description}
                meta={brand.highlight}
                action={
                  <button type="button" className="mini-favorite is-active" onClick={() => onToggleBrand(brand.id)}>
                    ♥
                  </button>
                }
              />
            ))}
          </div>
        </>
      ) : null}

      {!mixes.length && !products.length && !brands.length ? (
        <p className="empty-state">Пока пусто. Добавь миксы, бренды или продукцию в избранное.</p>
      ) : null}
    </section>
  );
}
