import type { MainTab } from '../types';

type QuickIconsRowProps = {
  onOpenMixes: () => void;
  onOpenTobaccos: () => void;
  onOpenHookahs: () => void;
  onOpenBrands: () => void;
  setTab: (tab: MainTab) => void;
};

export function QuickIconsRow({ onOpenMixes, onOpenTobaccos, onOpenHookahs, onOpenBrands, setTab }: QuickIconsRowProps) {
  const buttons = [
    { id: 'tobaccos', image: '/media/icon-tobaccos.png', label: 'Табаки', action: () => { setTab('catalog'); onOpenTobaccos(); } },
    { id: 'hookahs', image: '/media/icon-hookahs.png', label: 'Кальяны', action: () => { setTab('catalog'); onOpenHookahs(); } },
    { id: 'mixes', image: '/media/icon-mixes.png', label: 'Миксы', action: onOpenMixes },
    { id: 'brands', image: '/media/icon-brands.png', label: 'Бренды', action: () => { setTab('catalog'); onOpenBrands(); } }
  ];

  return (
    <section className="quick-icons" aria-label="Категории">
      {buttons.map((button) => (
        <button key={button.id} type="button" className="quick-icons__button" onClick={button.action} aria-label={button.label}>
          <img src={button.image} alt={button.label} />
        </button>
      ))}
    </section>
  );
}
