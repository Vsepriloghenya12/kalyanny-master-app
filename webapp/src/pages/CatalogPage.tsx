import { ChipTabs } from '../components/ChipTabs';
import { ListRow } from '../components/ListRow';
import { SectionTitle } from '../components/SectionTitle';
import type { AppContent } from '../types';

export type CatalogFilter = 'tobacco' | 'hookah' | 'news' | 'brands';

type CatalogPageProps = {
  content: AppContent;
  filter: CatalogFilter;
  onFilterChange: (value: CatalogFilter) => void;
  onAction: (target: string) => void;
  favoriteProducts: string[];
  favoriteBrands: string[];
  onToggleProduct: (id: string) => void;
  onToggleBrand: (id: string) => void;
};

export function CatalogPage({ content, filter, onFilterChange, onAction, favoriteProducts, favoriteBrands, onToggleProduct, onToggleBrand }: CatalogPageProps) {
  return (
    <section className="content-section">
      <SectionTitle title="Каталог" />
      <ChipTabs
        value={filter}
        onChange={onFilterChange}
        options={[
          { value: 'tobacco', label: 'Табаки' },
          { value: 'hookah', label: 'Кальяны' },
          { value: 'news', label: 'Новинки' },
          { value: 'brands', label: 'Бренды' }
        ]}
      />

      {filter === 'brands' ? (
        <div className="list-stack">
          {content.brands.map((brand) => {
            const isFavorite = favoriteBrands.includes(brand.id);
            return (
              <ListRow
                key={brand.id}
                image={brand.image}
                title={brand.title}
                subtitle={brand.description}
                meta={`${brand.country} · ${brand.highlight}`}
                action={
                  <button type="button" className={isFavorite ? 'mini-favorite is-active' : 'mini-favorite'} onClick={() => onToggleBrand(brand.id)}>
                    ♥
                  </button>
                }
              />
            );
          })}
        </div>
      ) : null}

      {filter === 'news' ? (
        <div className="list-stack">
          {content.news.map((item) => (
            <ListRow
              key={item.id}
              image={item.image}
              title={item.title}
              subtitle={item.description}
              meta={item.date}
              action={
                <button type="button" className="inline-link" onClick={() => onAction(item.linkTarget)}>
                  {item.linkLabel}
                </button>
              }
            />
          ))}
        </div>
      ) : null}

      {filter === 'tobacco' || filter === 'hookah' ? (
        <div className="catalog-product-grid">
          {content.products
            .filter((product) => (filter === 'tobacco' ? product.type === 'tobacco' : product.type === 'hookah'))
            .map((product) => {
              const isFavorite = favoriteProducts.includes(product.id);
              return (
                <article key={product.id} className="catalog-product-card">
                  <button type="button" className={isFavorite ? 'catalog-product-card__favorite is-active' : 'catalog-product-card__favorite'} onClick={() => onToggleProduct(product.id)} aria-label="Добавить в избранное">
                    ♥
                  </button>
                  <div className="catalog-product-card__media" style={{ backgroundImage: `linear-gradient(180deg, rgba(9, 13, 24, 0.08), rgba(9, 13, 24, 0.92)), url(${product.image})` }} />
                  <div className="catalog-product-card__body">
                    <span className="catalog-product-card__eyebrow">{product.brand}</span>
                    <h3>{product.title}</h3>
                    <p>{product.description}</p>
                    <span className="catalog-product-card__meta">{`${product.line} · ${product.strength}`}</span>
                  </div>
                </article>
              );
            })}
        </div>
      ) : null}
    </section>
  );
}
