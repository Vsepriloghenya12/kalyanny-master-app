import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'kalyanny-master-favorites';

type FavoritesState = {
  mixes: string[];
  products: string[];
  brands: string[];
};

const defaultState: FavoritesState = {
  mixes: [],
  products: [],
  brands: []
};

export function useFavorites() {
  const [state, setState] = useState<FavoritesState>(defaultState);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as FavoritesState;
      setState({
        mixes: parsed.mixes ?? [],
        products: parsed.products ?? [],
        brands: parsed.brands ?? []
      });
    } catch {
      setState(defaultState);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const api = useMemo(
    () => ({
      state,
      toggleMix: (id: string) =>
        setState((current) => ({
          ...current,
          mixes: current.mixes.includes(id)
            ? current.mixes.filter((item) => item !== id)
            : [...current.mixes, id]
        })),
      toggleProduct: (id: string) =>
        setState((current) => ({
          ...current,
          products: current.products.includes(id)
            ? current.products.filter((item) => item !== id)
            : [...current.products, id]
        })),
      toggleBrand: (id: string) =>
        setState((current) => ({
          ...current,
          brands: current.brands.includes(id)
            ? current.brands.filter((item) => item !== id)
            : [...current.brands, id]
        }))
    }),
    [state]
  );

  return api;
}
