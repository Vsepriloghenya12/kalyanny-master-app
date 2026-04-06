import { useEffect, useState } from 'react';
import { fetchContent, ownerLogin, saveContent } from '../api';
import type { AppContent, Banner, Brand, Collection, Mix, NewsItem, Product } from '../types';

const TOKEN_KEY = 'kalyanny-master-owner-token';

type OwnerTab = 'app' | 'banners' | 'mixes' | 'products' | 'brands' | 'news' | 'collections';

const OWNER_TABS: Array<{ id: OwnerTab; label: string; description: string }> = [
  { id: 'app', label: 'Основное', description: 'Название приложения и подзаголовок витрины.' },
  { id: 'banners', label: 'Баннеры', description: 'Главные баннеры на первом экране.' },
  { id: 'mixes', label: 'Миксы', description: 'Карточки миксов, теги и описания.' },
  { id: 'products', label: 'Продукция', description: 'Каталог табаков, кальянов и аксессуаров.' },
  { id: 'brands', label: 'Бренды', description: 'Бренды, страны и особенности.' },
  { id: 'news', label: 'Новости', description: 'Новости и ссылки внутри приложения.' },
  { id: 'collections', label: 'Подборки', description: 'Тематические подборки и ID миксов.' }
];

function emptyBanner(): Banner {
  return { id: crypto.randomUUID(), title: 'Новый баннер', subtitle: 'Описание баннера', image: '/media/hero-banner-main.png', buttonLabel: 'Открыть', buttonTarget: 'tab:tobacco' };
}

function emptyMix(): Mix {
  return {
    id: crypto.randomUUID(),
    title: 'Новый микс',
    subtitle: 'Описание вкуса',
    image: '/media/mix-tropic.png',
    description: 'Короткое описание микса.',
    details: 'Подробное описание микса для модального окна.',
    ingredients: ['ингредиент 1', 'ингредиент 2'],
    notes: ['сладкий'],
    isPopular: true
  };
}

function emptyProduct(): Product {
  return {
    id: crypto.randomUUID(),
    title: 'Новый продукт',
    brand: 'Бренд',
    type: 'tobacco',
    line: 'Линейка',
    strength: 'Средняя',
    image: '/media/icon-tobaccos.png',
    description: 'Описание продукта',
    isNew: true
  };
}

function emptyBrand(): Brand {
  return {
    id: crypto.randomUUID(),
    title: 'Новый бренд',
    country: 'Страна',
    image: '/media/icon-brands.png',
    description: 'Описание бренда',
    highlight: 'Ключевая особенность'
  };
}

function emptyNews(): NewsItem {
  return {
    id: crypto.randomUUID(),
    title: 'Новая новость',
    image: '/media/hero-banner-main.png',
    description: 'Короткое описание новости',
    date: 'Сегодня',
    linkLabel: 'Подробнее',
    linkTarget: '#'
  };
}

function emptyCollection(): Collection {
  return {
    id: crypto.randomUUID(),
    title: 'Новая подборка',
    image: '/media/hero-banner-main.png',
    description: 'Описание подборки',
    mixIds: []
  };
}

function getBannerTargetOptions(content: AppContent) {
  const productTypeLabels: Record<Product['type'], string> = {
    tobacco: 'Табак',
    hookah: 'Кальян',
    accessory: 'Аксессуар'
  };

  return [
    { value: 'tab:tobacco', label: 'Страница: табаки' },
    { value: 'tab:hookah', label: 'Страница: кальяны' },
    { value: 'tab:accessories', label: 'Страница: аксессуары' },
    { value: 'tab:brands', label: 'Страница: бренды' },
    { value: 'tab:mixer', label: 'Страница: миксер' },
    { value: 'tab:picks', label: 'Страница: подборки' },
    ...content.brands.map((brand) => ({ value: `brand:${brand.id}`, label: `Бренд: ${brand.title}` })),
    ...content.products.map((product) => ({ value: `product:${product.id}`, label: `${productTypeLabels[product.type]}: ${product.title}` }))
  ];
}

export function OwnerPage() {
  const [token, setToken] = useState<string>(() => window.localStorage.getItem(TOKEN_KEY) ?? '');
  const [form, setForm] = useState({ login: 'owner', password: 'owner123' });
  const [content, setContent] = useState<AppContent | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OwnerTab>('app');

  useEffect(() => {
    fetchContent()
      .then(setContent)
      .catch(() => setError('Не удалось загрузить данные'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const newToken = await ownerLogin(form.login, form.password);
      window.localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      setError('');
      setInfo('Вход выполнен');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Ошибка авторизации');
    }
  };

  const handleSave = async () => {
    if (!content || !token) return;
    try {
      const updated = await saveContent(token, content);
      setContent(updated);
      setInfo('Изменения сохранены');
      setError('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Ошибка сохранения');
    }
  };

  const logout = () => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setInfo('Вы вышли из owner-панели');
  };

  if (loading) {
    return <div className="owner-page"><p>Загрузка owner-панели...</p></div>;
  }

  if (!content) {
    return <div className="owner-page"><p>Данные не загрузились.</p></div>;
  }

  if (!token) {
    return (
      <div className="owner-page owner-page--login">
        <div className="owner-login">
          <img src="/media/logo-kalyanny-master.png" alt="Кальянный мастер" className="owner-login__logo" />
          <h1>Вход владельца</h1>
          <form onSubmit={handleLogin} className="owner-form owner-form--auth">
            <label>
              <span>Логин</span>
              <input value={form.login} onChange={(event) => setForm((current) => ({ ...current, login: event.target.value }))} />
            </label>
            <label>
              <span>Пароль</span>
              <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
            </label>
            <button type="submit" className="action-button">Войти</button>
          </form>
          {error ? <p className="owner-message owner-message--error">{error}</p> : null}
          <p className="owner-hint">Значения по умолчанию можно сразу заменить через env на Railway.</p>
        </div>
      </div>
    );
  }

  const activeTabMeta = OWNER_TABS.find((tab) => tab.id === activeTab) ?? OWNER_TABS[0];
  const tabCounts: Record<OwnerTab, string> = {
    app: '2 поля',
    banners: `${content.banners.length} элементов`,
    mixes: `${content.mixes.length} элементов`,
    products: `${content.products.length} элементов`,
    brands: `${content.brands.length} элементов`,
    news: `${content.news.length} элементов`,
    collections: `${content.collections.length} элементов`
  };
  const bannerTargetOptions = getBannerTargetOptions(content);

  return (
    <div className="owner-page">
      <div className="owner-shell">
        <aside className="owner-sidebar">
          <img src="/media/logo-kalyanny-master.png" alt="Кальянный мастер" className="owner-sidebar__logo" />
          <div className="owner-sidebar__intro">
            <p className="owner-sidebar__eyebrow">Owner Panel</p>
            <h1>{content.app.title}</h1>
            <p>Редактируй витрину, каталог и контент без длинного списка на одной странице.</p>
          </div>
          <div className="owner-tabs" role="tablist" aria-label="Разделы настроек">
            {OWNER_TABS.map((tab) => (
              <button key={tab.id} type="button" className={tab.id === activeTab ? 'owner-tab is-active' : 'owner-tab'} onClick={() => setActiveTab(tab.id)}>
                <span className="owner-tab__label">{tab.label}</span>
                <span className="owner-tab__meta">{tabCounts[tab.id]}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="owner-main">
          <div className="owner-topbar">
            <div className="owner-topbar__title">
              <p className="owner-topbar__eyebrow">Настройки</p>
              <h2>{activeTabMeta.label}</h2>
              <p>{activeTabMeta.description}</p>
            </div>
            <div className="owner-topbar__actions">
              <button type="button" className="action-button action-button--ghost" onClick={logout}>Выйти</button>
              <button type="button" className="action-button" onClick={handleSave}>Сохранить всё</button>
            </div>
          </div>

          {info ? <p className="owner-message owner-message--ok">{info}</p> : null}
          {error ? <p className="owner-message owner-message--error">{error}</p> : null}

      <section className="owner-section" hidden={activeTab !== 'app'}>
        <h2>Основные тексты</h2>
        <div className="owner-grid owner-grid--two">
          <label>
            <span>Название приложения</span>
            <input value={content.app.title} onChange={(event) => setContent({ ...content, app: { ...content.app, title: event.target.value } })} />
          </label>
          <label>
            <span>Подзаголовок</span>
            <input value={content.app.subtitle} onChange={(event) => setContent({ ...content, app: { ...content.app, subtitle: event.target.value } })} />
          </label>
        </div>
      </section>

      <section className="owner-section" hidden={activeTab !== 'banners'}>
        <div className="owner-section__header">
          <h2>Баннеры</h2>
          <button type="button" className="action-button action-button--small" onClick={() => setContent({ ...content, banners: [...content.banners, emptyBanner()] })}>+ Баннер</button>
        </div>
        {content.banners.map((banner, index) => (
          <div key={banner.id} className="owner-card">
            <div className="owner-card__header">
              <strong>Баннер {index + 1}</strong>
              <button type="button" className="danger-link" onClick={() => setContent({ ...content, banners: content.banners.filter((item) => item.id !== banner.id) })}>Удалить</button>
            </div>
            <div className="owner-grid owner-grid--two">
              <label><span>Заголовок</span><input value={banner.title} onChange={(event) => setContent({ ...content, banners: content.banners.map((item) => item.id === banner.id ? { ...item, title: event.target.value } : item) })} /></label>
              <label><span>Подзаголовок</span><input value={banner.subtitle} onChange={(event) => setContent({ ...content, banners: content.banners.map((item) => item.id === banner.id ? { ...item, subtitle: event.target.value } : item) })} /></label>
              <label><span>Картинка URL</span><input value={banner.image} onChange={(event) => setContent({ ...content, banners: content.banners.map((item) => item.id === banner.id ? { ...item, image: event.target.value } : item) })} /></label>
              <label><span>Текст кнопки</span><input value={banner.buttonLabel} onChange={(event) => setContent({ ...content, banners: content.banners.map((item) => item.id === banner.id ? { ...item, buttonLabel: event.target.value } : item) })} /></label>
              <label className="owner-grid__wide">
                <span>Куда ведет баннер</span>
                <select value={banner.buttonTarget} onChange={(event) => setContent({ ...content, banners: content.banners.map((item) => item.id === banner.id ? { ...item, buttonTarget: event.target.value } : item) })}>
                  {bannerTargetOptions.some((option) => option.value === banner.buttonTarget) ? null : <option value={banner.buttonTarget}>Текущая ссылка: {banner.buttonTarget}</option>}
                  {bannerTargetOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ))}
      </section>

      <section className="owner-section" hidden={activeTab !== 'mixes'}>
        <div className="owner-section__header">
          <h2>Популярные миксы</h2>
          <button type="button" className="action-button action-button--small" onClick={() => setContent({ ...content, mixes: [...content.mixes, emptyMix()] })}>+ Микс</button>
        </div>
        {content.mixes.map((mix, index) => (
          <div key={mix.id} className="owner-card">
            <div className="owner-card__header">
              <strong>Микс {index + 1}</strong>
              <button type="button" className="danger-link" onClick={() => setContent({ ...content, mixes: content.mixes.filter((item) => item.id !== mix.id) })}>Удалить</button>
            </div>
            <div className="owner-grid owner-grid--two">
              <label><span>Название</span><input value={mix.title} onChange={(event) => setContent({ ...content, mixes: content.mixes.map((item) => item.id === mix.id ? { ...item, title: event.target.value } : item) })} /></label>
              <label><span>Подзаголовок</span><input value={mix.subtitle} onChange={(event) => setContent({ ...content, mixes: content.mixes.map((item) => item.id === mix.id ? { ...item, subtitle: event.target.value } : item) })} /></label>
              <label><span>Картинка URL</span><input value={mix.image} onChange={(event) => setContent({ ...content, mixes: content.mixes.map((item) => item.id === mix.id ? { ...item, image: event.target.value } : item) })} /></label>
              <label><span>Популярный</span><select value={mix.isPopular ? 'yes' : 'no'} onChange={(event) => setContent({ ...content, mixes: content.mixes.map((item) => item.id === mix.id ? { ...item, isPopular: event.target.value === 'yes' } : item) })}><option value="yes">Да</option><option value="no">Нет</option></select></label>
              <label className="owner-grid__wide"><span>Короткое описание</span><input value={mix.description} onChange={(event) => setContent({ ...content, mixes: content.mixes.map((item) => item.id === mix.id ? { ...item, description: event.target.value } : item) })} /></label>
              <label className="owner-grid__wide"><span>Подробное описание</span><textarea rows={4} value={mix.details} onChange={(event) => setContent({ ...content, mixes: content.mixes.map((item) => item.id === mix.id ? { ...item, details: event.target.value } : item) })} /></label>
              <label className="owner-grid__wide"><span>Ингредиенты через запятую</span><input value={mix.ingredients.join(', ')} onChange={(event) => setContent({ ...content, mixes: content.mixes.map((item) => item.id === mix.id ? { ...item, ingredients: event.target.value.split(',').map((part) => part.trim()).filter(Boolean) } : item) })} /></label>
              <label className="owner-grid__wide"><span>Теги вкуса через запятую</span><input value={mix.notes.join(', ')} onChange={(event) => setContent({ ...content, mixes: content.mixes.map((item) => item.id === mix.id ? { ...item, notes: event.target.value.split(',').map((part) => part.trim()).filter(Boolean) } : item) })} /></label>
            </div>
          </div>
        ))}
      </section>

      <section className="owner-section" hidden={activeTab !== 'products'}>
        <div className="owner-section__header">
          <h2>Продукция</h2>
          <button type="button" className="action-button action-button--small" onClick={() => setContent({ ...content, products: [...content.products, emptyProduct()] })}>+ Продукт</button>
        </div>
        {content.products.map((product, index) => (
          <div key={product.id} className="owner-card">
            <div className="owner-card__header">
              <strong>Продукт {index + 1}</strong>
              <button type="button" className="danger-link" onClick={() => setContent({ ...content, products: content.products.filter((item) => item.id !== product.id) })}>Удалить</button>
            </div>
            <div className="owner-grid owner-grid--two">
              <label><span>Название</span><input value={product.title} onChange={(event) => setContent({ ...content, products: content.products.map((item) => item.id === product.id ? { ...item, title: event.target.value } : item) })} /></label>
              <label><span>Бренд</span><input value={product.brand} onChange={(event) => setContent({ ...content, products: content.products.map((item) => item.id === product.id ? { ...item, brand: event.target.value } : item) })} /></label>
              <label><span>Тип</span><select value={product.type} onChange={(event) => setContent({ ...content, products: content.products.map((item) => item.id === product.id ? { ...item, type: event.target.value as Product['type'] } : item) })}><option value="tobacco">Табак</option><option value="hookah">Кальян</option><option value="accessory">Аксессуар</option></select></label>
              <label><span>Линейка</span><input value={product.line} onChange={(event) => setContent({ ...content, products: content.products.map((item) => item.id === product.id ? { ...item, line: event.target.value } : item) })} /></label>
              <label><span>Крепость</span><input value={product.strength} onChange={(event) => setContent({ ...content, products: content.products.map((item) => item.id === product.id ? { ...item, strength: event.target.value } : item) })} /></label>
              <label><span>Новинка</span><select value={product.isNew ? 'yes' : 'no'} onChange={(event) => setContent({ ...content, products: content.products.map((item) => item.id === product.id ? { ...item, isNew: event.target.value === 'yes' } : item) })}><option value="yes">Да</option><option value="no">Нет</option></select></label>
              <label><span>Картинка URL</span><input value={product.image} onChange={(event) => setContent({ ...content, products: content.products.map((item) => item.id === product.id ? { ...item, image: event.target.value } : item) })} /></label>
              <label className="owner-grid__wide"><span>Описание</span><textarea rows={3} value={product.description} onChange={(event) => setContent({ ...content, products: content.products.map((item) => item.id === product.id ? { ...item, description: event.target.value } : item) })} /></label>
            </div>
          </div>
        ))}
      </section>

      <section className="owner-section" hidden={activeTab !== 'brands'}>
        <div className="owner-section__header">
          <h2>Бренды</h2>
          <button type="button" className="action-button action-button--small" onClick={() => setContent({ ...content, brands: [...content.brands, emptyBrand()] })}>+ Бренд</button>
        </div>
        {content.brands.map((brand, index) => (
          <div key={brand.id} className="owner-card">
            <div className="owner-card__header">
              <strong>Бренд {index + 1}</strong>
              <button type="button" className="danger-link" onClick={() => setContent({ ...content, brands: content.brands.filter((item) => item.id !== brand.id) })}>Удалить</button>
            </div>
            <div className="owner-grid owner-grid--two">
              <label><span>Название</span><input value={brand.title} onChange={(event) => setContent({ ...content, brands: content.brands.map((item) => item.id === brand.id ? { ...item, title: event.target.value } : item) })} /></label>
              <label><span>Страна</span><input value={brand.country} onChange={(event) => setContent({ ...content, brands: content.brands.map((item) => item.id === brand.id ? { ...item, country: event.target.value } : item) })} /></label>
              <label><span>Картинка URL</span><input value={brand.image} onChange={(event) => setContent({ ...content, brands: content.brands.map((item) => item.id === brand.id ? { ...item, image: event.target.value } : item) })} /></label>
              <label><span>Особенность</span><input value={brand.highlight} onChange={(event) => setContent({ ...content, brands: content.brands.map((item) => item.id === brand.id ? { ...item, highlight: event.target.value } : item) })} /></label>
              <label className="owner-grid__wide"><span>Описание</span><textarea rows={3} value={brand.description} onChange={(event) => setContent({ ...content, brands: content.brands.map((item) => item.id === brand.id ? { ...item, description: event.target.value } : item) })} /></label>
            </div>
          </div>
        ))}
      </section>

      <section className="owner-section" hidden={activeTab !== 'news'}>
        <div className="owner-section__header">
          <h2>Новости</h2>
          <button type="button" className="action-button action-button--small" onClick={() => setContent({ ...content, news: [...content.news, emptyNews()] })}>+ Новость</button>
        </div>
        {content.news.map((item, index) => (
          <div key={item.id} className="owner-card">
            <div className="owner-card__header">
              <strong>Новость {index + 1}</strong>
              <button type="button" className="danger-link" onClick={() => setContent({ ...content, news: content.news.filter((newsItem) => newsItem.id !== item.id) })}>Удалить</button>
            </div>
            <div className="owner-grid owner-grid--two">
              <label><span>Заголовок</span><input value={item.title} onChange={(event) => setContent({ ...content, news: content.news.map((newsItem) => newsItem.id === item.id ? { ...newsItem, title: event.target.value } : newsItem) })} /></label>
              <label><span>Дата</span><input value={item.date} onChange={(event) => setContent({ ...content, news: content.news.map((newsItem) => newsItem.id === item.id ? { ...newsItem, date: event.target.value } : newsItem) })} /></label>
              <label><span>Картинка URL</span><input value={item.image} onChange={(event) => setContent({ ...content, news: content.news.map((newsItem) => newsItem.id === item.id ? { ...newsItem, image: event.target.value } : newsItem) })} /></label>
              <label><span>Текст ссылки</span><input value={item.linkLabel} onChange={(event) => setContent({ ...content, news: content.news.map((newsItem) => newsItem.id === item.id ? { ...newsItem, linkLabel: event.target.value } : newsItem) })} /></label>
              <label className="owner-grid__wide"><span>Описание</span><textarea rows={3} value={item.description} onChange={(event) => setContent({ ...content, news: content.news.map((newsItem) => newsItem.id === item.id ? { ...newsItem, description: event.target.value } : newsItem) })} /></label>
              <label className="owner-grid__wide"><span>Ссылка</span><input value={item.linkTarget} onChange={(event) => setContent({ ...content, news: content.news.map((newsItem) => newsItem.id === item.id ? { ...newsItem, linkTarget: event.target.value } : newsItem) })} /></label>
            </div>
          </div>
        ))}
      </section>

      <section className="owner-section" hidden={activeTab !== 'collections'}>
        <div className="owner-section__header">
          <h2>Подборки</h2>
          <button type="button" className="action-button action-button--small" onClick={() => setContent({ ...content, collections: [...content.collections, emptyCollection()] })}>+ Подборка</button>
        </div>
        {content.collections.map((collection, index) => (
          <div key={collection.id} className="owner-card">
            <div className="owner-card__header">
              <strong>Подборка {index + 1}</strong>
              <button type="button" className="danger-link" onClick={() => setContent({ ...content, collections: content.collections.filter((item) => item.id !== collection.id) })}>Удалить</button>
            </div>
            <div className="owner-grid owner-grid--two">
              <label><span>Название</span><input value={collection.title} onChange={(event) => setContent({ ...content, collections: content.collections.map((item) => item.id === collection.id ? { ...item, title: event.target.value } : item) })} /></label>
              <label><span>Картинка URL</span><input value={collection.image} onChange={(event) => setContent({ ...content, collections: content.collections.map((item) => item.id === collection.id ? { ...item, image: event.target.value } : item) })} /></label>
              <label className="owner-grid__wide"><span>Описание</span><textarea rows={3} value={collection.description} onChange={(event) => setContent({ ...content, collections: content.collections.map((item) => item.id === collection.id ? { ...item, description: event.target.value } : item) })} /></label>
              <label className="owner-grid__wide"><span>ID миксов через запятую</span><input value={collection.mixIds.join(', ')} onChange={(event) => setContent({ ...content, collections: content.collections.map((item) => item.id === collection.id ? { ...item, mixIds: event.target.value.split(',').map((part) => part.trim()).filter(Boolean) } : item) })} /></label>
            </div>
          </div>
        ))}
      </section>
        </main>
      </div>
    </div>
  );
}
