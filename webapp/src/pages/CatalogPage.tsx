import { useEffect, useMemo, useState } from 'react';
import { ChipTabs } from '../components/ChipTabs';
import { ListRow } from '../components/ListRow';
import { SectionTitle } from '../components/SectionTitle';
import type { AppContent, Product } from '../types';

export type CatalogFilter = 'tobacco' | 'hookah' | 'accessories' | 'news' | 'brands';
export type CatalogFocusTarget = { type: 'brand' | 'product'; id: string } | { type: 'tobacco-all' } | { type: 'hookah-all' } | { type: 'accessories-all' };

type CatalogPageProps = {
  content: AppContent;
  filter: CatalogFilter;
  onFilterChange: (value: CatalogFilter) => void;
  focusTarget: CatalogFocusTarget | null;
  onFocusTargetHandled: () => void;
  favoriteProducts: string[];
  favoriteBrands: string[];
  onOpenProduct: (product: Product) => void;
  onToggleProduct: (id: string) => void;
  onToggleBrand: (id: string) => void;
};

const ALL_FILTER_VALUE = 'all';

const TASTE_DIRECTION_KEYWORDS: Array<{ label: string; keywords: string[] }> = [
  { label: 'Цитрус', keywords: ['citrus', 'цитрус', 'апельсин', 'лимон', 'лайм'] },
  { label: 'Десертный', keywords: ['йогурт', 'слив', 'крем', 'десерт', 'ваниль'] },
  { label: 'Фруктовый', keywords: ['peach', 'персик', 'фрукт', 'манго', 'ананас'] },
  { label: 'Свежий', keywords: ['supernova', 'холод', 'свеж', 'мята', 'ice'] },
  { label: 'Табачный', keywords: ['oak', 'cured', 'древ', 'сигар', 'табач'] }
];

function getTobaccoTasteDirection(product: Product) {
  const searchableText = `${product.title} ${product.line} ${product.description}`.toLowerCase();
  return TASTE_DIRECTION_KEYWORDS.find((direction) => direction.keywords.some((keyword) => searchableText.includes(keyword)))?.label ?? 'Авторский';
}

function uniqueValues(values: string[]) {
  return [...new Set(values)].sort((first, second) => first.localeCompare(second, 'ru'));
}

export function CatalogPage({
  content,
  filter,
  onFilterChange,
  focusTarget,
  onFocusTargetHandled,
  favoriteProducts,
  favoriteBrands,
  onOpenProduct,
  onToggleProduct,
  onToggleBrand
}: CatalogPageProps) {
  const [activeTobaccoBrand, setActiveTobaccoBrand] = useState(ALL_FILTER_VALUE);
  const [activeTobaccoStrength, setActiveTobaccoStrength] = useState(ALL_FILTER_VALUE);
  const [activeTobaccoTaste, setActiveTobaccoTaste] = useState(ALL_FILTER_VALUE);
  const [activeTobaccoSearch, setActiveTobaccoSearch] = useState('');
  const [draftTobaccoBrand, setDraftTobaccoBrand] = useState(ALL_FILTER_VALUE);
  const [draftTobaccoStrength, setDraftTobaccoStrength] = useState(ALL_FILTER_VALUE);
  const [draftTobaccoTaste, setDraftTobaccoTaste] = useState(ALL_FILTER_VALUE);
  const [draftTobaccoSearch, setDraftTobaccoSearch] = useState('');
  const [isTobaccoFilterOpen, setIsTobaccoFilterOpen] = useState(false);
  const [activeHookahBrand, setActiveHookahBrand] = useState(ALL_FILTER_VALUE);
  const [activeHookahDraw, setActiveHookahDraw] = useState(ALL_FILTER_VALUE);
  const [activeHookahLine, setActiveHookahLine] = useState(ALL_FILTER_VALUE);
  const [activeHookahSearch, setActiveHookahSearch] = useState('');
  const [draftHookahBrand, setDraftHookahBrand] = useState(ALL_FILTER_VALUE);
  const [draftHookahDraw, setDraftHookahDraw] = useState(ALL_FILTER_VALUE);
  const [draftHookahLine, setDraftHookahLine] = useState(ALL_FILTER_VALUE);
  const [draftHookahSearch, setDraftHookahSearch] = useState('');
  const [isHookahFilterOpen, setIsHookahFilterOpen] = useState(false);
  const [activeAccessoryCategory, setActiveAccessoryCategory] = useState(ALL_FILTER_VALUE);
  const [activeAccessoryBrand, setActiveAccessoryBrand] = useState(ALL_FILTER_VALUE);
  const [activeAccessoryType, setActiveAccessoryType] = useState(ALL_FILTER_VALUE);
  const [activeAccessorySearch, setActiveAccessorySearch] = useState('');
  const [draftAccessoryCategory, setDraftAccessoryCategory] = useState(ALL_FILTER_VALUE);
  const [draftAccessoryBrand, setDraftAccessoryBrand] = useState(ALL_FILTER_VALUE);
  const [draftAccessoryType, setDraftAccessoryType] = useState(ALL_FILTER_VALUE);
  const [draftAccessorySearch, setDraftAccessorySearch] = useState('');
  const [isAccessoryFilterOpen, setIsAccessoryFilterOpen] = useState(false);
  const tobaccoProducts = useMemo(() => content.products.filter((product) => product.type === 'tobacco'), [content.products]);
  const hookahProducts = useMemo(() => content.products.filter((product) => product.type === 'hookah'), [content.products]);
  const accessoryProducts = useMemo(() => content.products.filter((product) => product.type === 'accessory'), [content.products]);
  const tobaccoBrands = useMemo(() => uniqueValues(tobaccoProducts.map((product) => product.brand)), [tobaccoProducts]);
  const tobaccoStrengths = useMemo(() => uniqueValues(tobaccoProducts.map((product) => product.strength)), [tobaccoProducts]);
  const tobaccoTasteDirections = useMemo(() => uniqueValues(tobaccoProducts.map(getTobaccoTasteDirection)), [tobaccoProducts]);
  const hookahBrands = useMemo(() => uniqueValues(hookahProducts.map((product) => product.brand)), [hookahProducts]);
  const hookahDraws = useMemo(() => uniqueValues(hookahProducts.map((product) => product.strength)), [hookahProducts]);
  const hookahLines = useMemo(() => uniqueValues(hookahProducts.map((product) => product.line)), [hookahProducts]);
  const accessoryBrands = useMemo(() => uniqueValues(accessoryProducts.map((product) => product.brand)), [accessoryProducts]);
  const accessoryCategories = useMemo(() => uniqueValues(accessoryProducts.map((product) => product.line)), [accessoryProducts]);
  const accessoryTypes = useMemo(() => uniqueValues(accessoryProducts.map((product) => product.strength)), [accessoryProducts]);
  const filteredTobaccoProducts = tobaccoProducts.filter((product) => {
    const matchesBrand = activeTobaccoBrand === ALL_FILTER_VALUE || product.brand === activeTobaccoBrand;
    const matchesStrength = activeTobaccoStrength === ALL_FILTER_VALUE || product.strength === activeTobaccoStrength;
    const tasteDirection = getTobaccoTasteDirection(product);
    const matchesTaste = activeTobaccoTaste === ALL_FILTER_VALUE || tasteDirection === activeTobaccoTaste;
    const normalizedSearch = activeTobaccoSearch.trim().toLowerCase();
    const searchableText = `${product.brand} ${product.title} ${product.line} ${product.strength} ${tasteDirection} ${product.description}`.toLowerCase();
    const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
    return matchesBrand && matchesStrength && matchesTaste && matchesSearch;
  });
  const hasTobaccoFilters = activeTobaccoBrand !== ALL_FILTER_VALUE || activeTobaccoStrength !== ALL_FILTER_VALUE || activeTobaccoTaste !== ALL_FILTER_VALUE || activeTobaccoSearch.trim() !== '';
  const filteredHookahProducts = hookahProducts.filter((product) => {
    const matchesBrand = activeHookahBrand === ALL_FILTER_VALUE || product.brand === activeHookahBrand;
    const matchesDraw = activeHookahDraw === ALL_FILTER_VALUE || product.strength === activeHookahDraw;
    const matchesLine = activeHookahLine === ALL_FILTER_VALUE || product.line === activeHookahLine;
    const normalizedSearch = activeHookahSearch.trim().toLowerCase();
    const searchableText = `${product.brand} ${product.title} ${product.line} ${product.strength} ${product.description}`.toLowerCase();
    const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
    return matchesBrand && matchesDraw && matchesLine && matchesSearch;
  });
  const hasHookahFilters = activeHookahBrand !== ALL_FILTER_VALUE || activeHookahDraw !== ALL_FILTER_VALUE || activeHookahLine !== ALL_FILTER_VALUE || activeHookahSearch.trim() !== '';
  const filteredAccessoryProducts = accessoryProducts.filter((product) => {
    const matchesCategory = activeAccessoryCategory === ALL_FILTER_VALUE || product.line === activeAccessoryCategory;
    const matchesBrand = activeAccessoryBrand === ALL_FILTER_VALUE || product.brand === activeAccessoryBrand;
    const matchesType = activeAccessoryType === ALL_FILTER_VALUE || product.strength === activeAccessoryType;
    const normalizedSearch = activeAccessorySearch.trim().toLowerCase();
    const searchableText = `${product.brand} ${product.title} ${product.line} ${product.strength} ${product.description}`.toLowerCase();
    const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
    return matchesCategory && matchesBrand && matchesType && matchesSearch;
  });
  const hasAccessoryFilters = activeAccessoryCategory !== ALL_FILTER_VALUE || activeAccessoryBrand !== ALL_FILTER_VALUE || activeAccessoryType !== ALL_FILTER_VALUE || activeAccessorySearch.trim() !== '';

  const resetTobaccoFilters = () => {
    setActiveTobaccoBrand(ALL_FILTER_VALUE);
    setActiveTobaccoStrength(ALL_FILTER_VALUE);
    setActiveTobaccoTaste(ALL_FILTER_VALUE);
    setActiveTobaccoSearch('');
    setDraftTobaccoBrand(ALL_FILTER_VALUE);
    setDraftTobaccoStrength(ALL_FILTER_VALUE);
    setDraftTobaccoTaste(ALL_FILTER_VALUE);
    setDraftTobaccoSearch('');
    setIsTobaccoFilterOpen(false);
  };

  const openTobaccoFilters = () => {
    setDraftTobaccoBrand(activeTobaccoBrand);
    setDraftTobaccoStrength(activeTobaccoStrength);
    setDraftTobaccoTaste(activeTobaccoTaste);
    setDraftTobaccoSearch(activeTobaccoSearch);
    setIsTobaccoFilterOpen(true);
  };

  const applyTobaccoFilters = () => {
    setActiveTobaccoBrand(draftTobaccoBrand);
    setActiveTobaccoStrength(draftTobaccoStrength);
    setActiveTobaccoTaste(draftTobaccoTaste);
    setActiveTobaccoSearch(draftTobaccoSearch);
    setIsTobaccoFilterOpen(false);
  };

  const resetHookahFilters = () => {
    setActiveHookahBrand(ALL_FILTER_VALUE);
    setActiveHookahDraw(ALL_FILTER_VALUE);
    setActiveHookahLine(ALL_FILTER_VALUE);
    setActiveHookahSearch('');
    setDraftHookahBrand(ALL_FILTER_VALUE);
    setDraftHookahDraw(ALL_FILTER_VALUE);
    setDraftHookahLine(ALL_FILTER_VALUE);
    setDraftHookahSearch('');
    setIsHookahFilterOpen(false);
  };

  const openHookahFilters = () => {
    setDraftHookahBrand(activeHookahBrand);
    setDraftHookahDraw(activeHookahDraw);
    setDraftHookahLine(activeHookahLine);
    setDraftHookahSearch(activeHookahSearch);
    setIsHookahFilterOpen(true);
  };

  const applyHookahFilters = () => {
    setActiveHookahBrand(draftHookahBrand);
    setActiveHookahDraw(draftHookahDraw);
    setActiveHookahLine(draftHookahLine);
    setActiveHookahSearch(draftHookahSearch);
    setIsHookahFilterOpen(false);
  };

  const resetAccessoryFilters = () => {
    setActiveAccessoryCategory(ALL_FILTER_VALUE);
    setActiveAccessoryBrand(ALL_FILTER_VALUE);
    setActiveAccessoryType(ALL_FILTER_VALUE);
    setActiveAccessorySearch('');
    setDraftAccessoryCategory(ALL_FILTER_VALUE);
    setDraftAccessoryBrand(ALL_FILTER_VALUE);
    setDraftAccessoryType(ALL_FILTER_VALUE);
    setDraftAccessorySearch('');
    setIsAccessoryFilterOpen(false);
  };

  const openAccessoryFilters = () => {
    setDraftAccessoryCategory(activeAccessoryCategory);
    setDraftAccessoryBrand(activeAccessoryBrand);
    setDraftAccessoryType(activeAccessoryType);
    setDraftAccessorySearch(activeAccessorySearch);
    setIsAccessoryFilterOpen(true);
  };

  const applyAccessoryFilters = () => {
    setActiveAccessoryCategory(draftAccessoryCategory);
    setActiveAccessoryBrand(draftAccessoryBrand);
    setActiveAccessoryType(draftAccessoryType);
    setActiveAccessorySearch(draftAccessorySearch);
    setIsAccessoryFilterOpen(false);
  };

  useEffect(() => {
    if (!focusTarget) return;

    if (focusTarget.type === 'tobacco-all') {
      setActiveTobaccoBrand(ALL_FILTER_VALUE);
      setActiveTobaccoStrength(ALL_FILTER_VALUE);
      setActiveTobaccoTaste(ALL_FILTER_VALUE);
      setActiveTobaccoSearch('');
      onFilterChange('tobacco');
      onFocusTargetHandled();
      return;
    }

    if (focusTarget.type === 'hookah-all') {
      setActiveHookahBrand(ALL_FILTER_VALUE);
      setActiveHookahDraw(ALL_FILTER_VALUE);
      setActiveHookahLine(ALL_FILTER_VALUE);
      setActiveHookahSearch('');
      onFilterChange('hookah');
      onFocusTargetHandled();
      return;
    }

    if (focusTarget.type === 'accessories-all') {
      setActiveAccessoryCategory(ALL_FILTER_VALUE);
      setActiveAccessoryBrand(ALL_FILTER_VALUE);
      setActiveAccessoryType(ALL_FILTER_VALUE);
      setActiveAccessorySearch('');
      onFilterChange('accessories');
      onFocusTargetHandled();
      return;
    }

    if (focusTarget.type === 'brand') {
      const brand = content.brands.find((item) => item.id === focusTarget.id);
      if (brand) {
        setActiveTobaccoBrand(brand.title);
        setActiveTobaccoStrength(ALL_FILTER_VALUE);
        setActiveTobaccoTaste(ALL_FILTER_VALUE);
        setActiveTobaccoSearch('');
        onFilterChange('tobacco');
      }
    }

    if (focusTarget.type === 'product') {
      const product = content.products.find((item) => item.id === focusTarget.id);
      if (product) {
        if (product.type === 'tobacco') {
          setActiveTobaccoBrand(product.brand);
          setActiveTobaccoStrength(ALL_FILTER_VALUE);
          setActiveTobaccoTaste(ALL_FILTER_VALUE);
          setActiveTobaccoSearch('');
        } else if (product.type === 'hookah') {
          setActiveHookahBrand(product.brand);
          setActiveHookahDraw(ALL_FILTER_VALUE);
          setActiveHookahLine(ALL_FILTER_VALUE);
          setActiveHookahSearch('');
        } else {
          setActiveAccessoryCategory(product.line);
          setActiveAccessoryBrand(product.brand);
          setActiveAccessoryType(ALL_FILTER_VALUE);
          setActiveAccessorySearch('');
        }
        onFilterChange(product.type === 'accessory' ? 'accessories' : product.type);
        onOpenProduct(product);
      }
    }

    onFocusTargetHandled();
  }, [content.brands, content.products, focusTarget, onFilterChange, onFocusTargetHandled, onOpenProduct]);

  if (filter === 'tobacco') {
    return (
      <section className="content-section tobacco-page" aria-label="Табаки">
        <header className="tobacco-page__header">
          <h1>Табаки</h1>
        </header>

        <div className="tobacco-toolbar">
          <div className="tobacco-brand-rail" aria-label="Быстрые фильтры по брендам">
            <button type="button" className={activeTobaccoBrand === ALL_FILTER_VALUE ? 'tobacco-brand-filter is-active' : 'tobacco-brand-filter'} onClick={() => setActiveTobaccoBrand(ALL_FILTER_VALUE)}>
              Все
            </button>
            {tobaccoBrands.map((brand) => (
              <button key={brand} type="button" className={activeTobaccoBrand === brand ? 'tobacco-brand-filter is-active' : 'tobacco-brand-filter'} onClick={() => setActiveTobaccoBrand(brand)}>
                {brand}
              </button>
            ))}
          </div>
          <button type="button" className={hasTobaccoFilters ? 'tobacco-filter-button is-active' : 'tobacco-filter-button'} onClick={openTobaccoFilters} aria-label="Открыть фильтры табаков">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h10" />
              <path d="M18 7h2" />
              <path d="M16 5v4" />
              <path d="M4 17h2" />
              <path d="M10 17h10" />
              <path d="M8 15v4" />
              <path d="M4 12h5" />
              <path d="M13 12h7" />
              <path d="M11 10v4" />
            </svg>
          </button>
        </div>

        <div className="tobacco-list">
          {filteredTobaccoProducts.map((product) => {
            const isFavorite = favoriteProducts.includes(product.id);
            return (
              <article
                key={product.id}
                className="tobacco-list-item"
                role="button"
                tabIndex={0}
                onClick={() => onOpenProduct(product)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenProduct(product);
                  }
                }}
              >
                <div className="tobacco-list-item__media">
                  <img src={product.image} alt={product.title} />
                </div>
                <div className="tobacco-list-item__content">
                  <div>
                    <p>{product.brand}</p>
                    <h3>{product.title}</h3>
                  </div>
                  <span>{product.line} · {product.strength} · {getTobaccoTasteDirection(product)}</span>
                  <small>{product.description}</small>
                </div>
                <div className="tobacco-list-item__side">
                  {product.isNew ? <span className="tobacco-list-item__badge">New</span> : null}
                  <button
                    type="button"
                    className={isFavorite ? 'tobacco-list-item__heart is-active' : 'tobacco-list-item__heart'}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleProduct(product.id);
                    }}
                    aria-label="Добавить табак в избранное"
                  >
                    ♥
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {isTobaccoFilterOpen ? (
          <div className="modal-backdrop modal-backdrop--above-nav" onClick={() => setIsTobaccoFilterOpen(false)} role="presentation">
            <div className="modal-sheet tobacco-filter-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Фильтры табаков">
              <button type="button" className="modal-sheet__close" onClick={() => setIsTobaccoFilterOpen(false)} aria-label="Закрыть">
                ×
              </button>
              <div className="tobacco-filter-modal__body">
                <label className="tobacco-filter-modal__search">
                  <span>Поиск</span>
                  <input
                    value={draftTobaccoSearch}
                    onChange={(event) => setDraftTobaccoSearch(event.target.value)}
                    placeholder="Бренд, название, вкус"
                    autoFocus
                  />
                </label>

                <section className="tobacco-filter-modal__section">
                  <h3>Бренд</h3>
                  <div className="tobacco-filter-modal__options">
                    <button type="button" className={draftTobaccoBrand === ALL_FILTER_VALUE ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftTobaccoBrand(ALL_FILTER_VALUE)}>
                      Все
                    </button>
                    {tobaccoBrands.map((brand) => (
                      <button key={brand} type="button" className={draftTobaccoBrand === brand ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftTobaccoBrand(brand)}>
                        {brand}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="tobacco-filter-modal__section">
                  <h3>Крепость</h3>
                  <div className="tobacco-filter-modal__options">
                    <button type="button" className={draftTobaccoStrength === ALL_FILTER_VALUE ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftTobaccoStrength(ALL_FILTER_VALUE)}>
                      Любая
                    </button>
                    {tobaccoStrengths.map((strength) => (
                      <button key={strength} type="button" className={draftTobaccoStrength === strength ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftTobaccoStrength(strength)}>
                        {strength}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="tobacco-filter-modal__section">
                  <h3>Направление вкуса</h3>
                  <div className="tobacco-filter-modal__options">
                    <button type="button" className={draftTobaccoTaste === ALL_FILTER_VALUE ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftTobaccoTaste(ALL_FILTER_VALUE)}>
                      Любое
                    </button>
                    {tobaccoTasteDirections.map((direction) => (
                      <button key={direction} type="button" className={draftTobaccoTaste === direction ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftTobaccoTaste(direction)}>
                        {direction}
                      </button>
                    ))}
                  </div>
                </section>

                <div className="tobacco-filter-modal__actions">
                  <button type="button" className="tobacco-filter-modal__reset" onClick={resetTobaccoFilters}>
                    Сбросить
                  </button>
                  <button type="button" className="tobacco-filter-modal__apply" onClick={applyTobaccoFilters}>
                    Применить
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  if (filter === 'hookah') {
    return (
      <section className="content-section tobacco-page hookah-page" aria-label="Кальяны">
        <header className="tobacco-page__header">
          <h1>Кальяны</h1>
        </header>

        <div className="tobacco-toolbar">
          <div className="tobacco-brand-rail" aria-label="Быстрые фильтры по брендам кальянов">
            <button type="button" className={activeHookahBrand === ALL_FILTER_VALUE ? 'tobacco-brand-filter is-active' : 'tobacco-brand-filter'} onClick={() => setActiveHookahBrand(ALL_FILTER_VALUE)}>
              Все
            </button>
            {hookahBrands.map((brand) => (
              <button key={brand} type="button" className={activeHookahBrand === brand ? 'tobacco-brand-filter is-active' : 'tobacco-brand-filter'} onClick={() => setActiveHookahBrand(brand)}>
                {brand}
              </button>
            ))}
          </div>
          <button type="button" className={hasHookahFilters ? 'tobacco-filter-button is-active' : 'tobacco-filter-button'} onClick={openHookahFilters} aria-label="Открыть фильтры кальянов">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h10" />
              <path d="M18 7h2" />
              <path d="M16 5v4" />
              <path d="M4 17h2" />
              <path d="M10 17h10" />
              <path d="M8 15v4" />
              <path d="M4 12h5" />
              <path d="M13 12h7" />
              <path d="M11 10v4" />
            </svg>
          </button>
        </div>

        <div className="tobacco-list">
          {filteredHookahProducts.map((product) => {
            const isFavorite = favoriteProducts.includes(product.id);
            return (
              <article
                key={product.id}
                className="tobacco-list-item"
                role="button"
                tabIndex={0}
                onClick={() => onOpenProduct(product)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenProduct(product);
                  }
                }}
              >
                <div className="tobacco-list-item__media">
                  <img src={product.image} alt={product.title} />
                </div>
                <div className="tobacco-list-item__content">
                  <div>
                    <p>{product.brand}</p>
                    <h3>{product.title}</h3>
                  </div>
                  <span>{product.line} · {product.strength}</span>
                  <small>{product.description}</small>
                </div>
                <div className="tobacco-list-item__side">
                  {product.isNew ? <span className="tobacco-list-item__badge">New</span> : null}
                  <button
                    type="button"
                    className={isFavorite ? 'tobacco-list-item__heart is-active' : 'tobacco-list-item__heart'}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleProduct(product.id);
                    }}
                    aria-label="Добавить кальян в избранное"
                  >
                    ♥
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {isHookahFilterOpen ? (
          <div className="modal-backdrop modal-backdrop--above-nav" onClick={() => setIsHookahFilterOpen(false)} role="presentation">
            <div className="modal-sheet tobacco-filter-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Фильтры кальянов">
              <button type="button" className="modal-sheet__close" onClick={() => setIsHookahFilterOpen(false)} aria-label="Закрыть">
                ×
              </button>
              <div className="tobacco-filter-modal__body">
                <label className="tobacco-filter-modal__search">
                  <span>Поиск</span>
                  <input
                    value={draftHookahSearch}
                    onChange={(event) => setDraftHookahSearch(event.target.value)}
                    placeholder="Бренд, название, линейка"
                    autoFocus
                  />
                </label>

                <section className="tobacco-filter-modal__section">
                  <h3>Бренд</h3>
                  <div className="tobacco-filter-modal__options">
                    <button type="button" className={draftHookahBrand === ALL_FILTER_VALUE ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftHookahBrand(ALL_FILTER_VALUE)}>
                      Все
                    </button>
                    {hookahBrands.map((brand) => (
                      <button key={brand} type="button" className={draftHookahBrand === brand ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftHookahBrand(brand)}>
                        {brand}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="tobacco-filter-modal__section">
                  <h3>Тяга</h3>
                  <div className="tobacco-filter-modal__options">
                    <button type="button" className={draftHookahDraw === ALL_FILTER_VALUE ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftHookahDraw(ALL_FILTER_VALUE)}>
                      Любая
                    </button>
                    {hookahDraws.map((draw) => (
                      <button key={draw} type="button" className={draftHookahDraw === draw ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftHookahDraw(draw)}>
                        {draw}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="tobacco-filter-modal__section">
                  <h3>Линейка</h3>
                  <div className="tobacco-filter-modal__options">
                    <button type="button" className={draftHookahLine === ALL_FILTER_VALUE ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftHookahLine(ALL_FILTER_VALUE)}>
                      Любая
                    </button>
                    {hookahLines.map((line) => (
                      <button key={line} type="button" className={draftHookahLine === line ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftHookahLine(line)}>
                        {line}
                      </button>
                    ))}
                  </div>
                </section>

                <div className="tobacco-filter-modal__actions">
                  <button type="button" className="tobacco-filter-modal__reset" onClick={resetHookahFilters}>
                    Сбросить
                  </button>
                  <button type="button" className="tobacco-filter-modal__apply" onClick={applyHookahFilters}>
                    Применить
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  if (filter === 'accessories') {
    return (
      <section className="content-section tobacco-page accessories-page" aria-label="Аксессуары">
        <header className="tobacco-page__header">
          <h1>Аксессуары</h1>
        </header>

        <div className="tobacco-toolbar">
          <div className="tobacco-brand-rail" aria-label="Быстрые фильтры по аксессуарам">
            <button type="button" className={activeAccessoryCategory === ALL_FILTER_VALUE ? 'tobacco-brand-filter is-active' : 'tobacco-brand-filter'} onClick={() => setActiveAccessoryCategory(ALL_FILTER_VALUE)}>
              Все
            </button>
            {accessoryCategories.map((category) => (
              <button key={category} type="button" className={activeAccessoryCategory === category ? 'tobacco-brand-filter is-active' : 'tobacco-brand-filter'} onClick={() => setActiveAccessoryCategory(category)}>
                {category}
              </button>
            ))}
          </div>
          <button type="button" className={hasAccessoryFilters ? 'tobacco-filter-button is-active' : 'tobacco-filter-button'} onClick={openAccessoryFilters} aria-label="Открыть фильтры аксессуаров">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h10" />
              <path d="M18 7h2" />
              <path d="M16 5v4" />
              <path d="M4 17h2" />
              <path d="M10 17h10" />
              <path d="M8 15v4" />
              <path d="M4 12h5" />
              <path d="M13 12h7" />
              <path d="M11 10v4" />
            </svg>
          </button>
        </div>

        <div className="tobacco-list">
          {filteredAccessoryProducts.map((product) => {
            const isFavorite = favoriteProducts.includes(product.id);
            return (
              <article
                key={product.id}
                className="tobacco-list-item"
                role="button"
                tabIndex={0}
                onClick={() => onOpenProduct(product)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenProduct(product);
                  }
                }}
              >
                <div className="tobacco-list-item__media">
                  <img src={product.image} alt={product.title} />
                </div>
                <div className="tobacco-list-item__content">
                  <div>
                    <p>{product.brand}</p>
                    <h3>{product.title}</h3>
                  </div>
                  <span>{product.line} · {product.strength}</span>
                  <small>{product.description}</small>
                </div>
                <div className="tobacco-list-item__side">
                  {product.isNew ? <span className="tobacco-list-item__badge">New</span> : null}
                  <button
                    type="button"
                    className={isFavorite ? 'tobacco-list-item__heart is-active' : 'tobacco-list-item__heart'}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleProduct(product.id);
                    }}
                    aria-label="Добавить аксессуар в избранное"
                  >
                    ♥
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {filteredAccessoryProducts.length ? null : <p className="empty-state">Пока нет аксессуаров под эти фильтры. Попробуй сбросить подбор.</p>}

        {isAccessoryFilterOpen ? (
          <div className="modal-backdrop modal-backdrop--above-nav" onClick={() => setIsAccessoryFilterOpen(false)} role="presentation">
            <div className="modal-sheet tobacco-filter-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Фильтры аксессуаров">
              <button type="button" className="modal-sheet__close" onClick={() => setIsAccessoryFilterOpen(false)} aria-label="Закрыть">
                ×
              </button>
              <div className="tobacco-filter-modal__body">
                <label className="tobacco-filter-modal__search">
                  <span>Поиск</span>
                  <input
                    value={draftAccessorySearch}
                    onChange={(event) => setDraftAccessorySearch(event.target.value)}
                    placeholder="Бренд, название, категория"
                    autoFocus
                  />
                </label>

                <section className="tobacco-filter-modal__section">
                  <h3>Категория</h3>
                  <div className="tobacco-filter-modal__options">
                    <button type="button" className={draftAccessoryCategory === ALL_FILTER_VALUE ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftAccessoryCategory(ALL_FILTER_VALUE)}>
                      Любая
                    </button>
                    {accessoryCategories.map((category) => (
                      <button key={category} type="button" className={draftAccessoryCategory === category ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftAccessoryCategory(category)}>
                        {category}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="tobacco-filter-modal__section">
                  <h3>Бренд</h3>
                  <div className="tobacco-filter-modal__options">
                    <button type="button" className={draftAccessoryBrand === ALL_FILTER_VALUE ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftAccessoryBrand(ALL_FILTER_VALUE)}>
                      Все
                    </button>
                    {accessoryBrands.map((brand) => (
                      <button key={brand} type="button" className={draftAccessoryBrand === brand ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftAccessoryBrand(brand)}>
                        {brand}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="tobacco-filter-modal__section">
                  <h3>Тип</h3>
                  <div className="tobacco-filter-modal__options">
                    <button type="button" className={draftAccessoryType === ALL_FILTER_VALUE ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftAccessoryType(ALL_FILTER_VALUE)}>
                      Любой
                    </button>
                    {accessoryTypes.map((type) => (
                      <button key={type} type="button" className={draftAccessoryType === type ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftAccessoryType(type)}>
                        {type}
                      </button>
                    ))}
                  </div>
                </section>

                <div className="tobacco-filter-modal__actions">
                  <button type="button" className="tobacco-filter-modal__reset" onClick={resetAccessoryFilters}>
                    Сбросить
                  </button>
                  <button type="button" className="tobacco-filter-modal__apply" onClick={applyAccessoryFilters}>
                    Применить
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="content-section">
      <SectionTitle title="Каталог" />
      <ChipTabs
        value={filter}
        onChange={onFilterChange}
        options={[
          { value: 'tobacco', label: 'Табаки' },
          { value: 'hookah', label: 'Кальяны' },
          { value: 'accessories', label: 'Аксессуары' },
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
                <a className="inline-link" href={item.linkTarget}>
                  {item.linkLabel}
                </a>
              }
            />
          ))}
        </div>
      ) : null}

    </section>
  );
}
