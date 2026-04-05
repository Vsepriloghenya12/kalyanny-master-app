import type { MainTab } from '../types';

type BottomNavProps = {
  currentTab: MainTab;
  onChange: (tab: MainTab) => void;
};

const items: Array<{ tab: MainTab; image: string; label: string }> = [
  { tab: 'home', image: '/media/nav-home.png', label: 'Домой' },
  { tab: 'favorites', image: '/media/nav-favorites.png', label: 'Избранное' },
  { tab: 'catalog', image: '/media/nav-catalog.png', label: 'Каталог' },
  { tab: 'picks', image: '/media/nav-picks.png', label: 'Подборки' },
  { tab: 'mixer', image: '/media/nav-mixer.png', label: 'Миксер' }
];

export function BottomNav({ currentTab, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Нижнее меню">
      {items.map((item) => (
        <button key={item.tab} type="button" className={item.tab === currentTab ? 'bottom-nav__item is-active' : 'bottom-nav__item'} onClick={() => onChange(item.tab)} aria-label={item.label}>
          <img src={item.image} alt="" aria-hidden="true" />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
