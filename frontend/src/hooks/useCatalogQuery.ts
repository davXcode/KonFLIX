import { useSearchParams } from 'react-router-dom';

export function useCatalogQuery() {
  const [params, setParams] = useSearchParams();

  const get = (k: string, def: string) => params.get(k) || def;

  const set = (next: Record<string, string>) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      if (!v || v === 'all') p.delete(k);
      else p.set(k, v);
    });
    setParams(p, { replace: true });
  };

  return { get, set };
}
