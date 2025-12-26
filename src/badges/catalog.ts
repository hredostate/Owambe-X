import { useEffect, useMemo, useState } from 'react';
import { Badge, BadgeCatalog } from './types';

const BASE_URL = '/badges/owambe/';

const isBadge = (value: any): value is Badge => {
  return (
    typeof value?.id === 'string' &&
    typeof value?.title === 'string' &&
    typeof value?.file_1080 === 'string' &&
    typeof value?.file_512 === 'string' &&
    Array.isArray(value?.captions)
  );
};

export const fetchBadgeCatalog = async (): Promise<BadgeCatalog> => {
  const response = await fetch(`${BASE_URL}badgeCatalog.json`);
  if (!response.ok) {
    return { badges: [] };
  }
  const data = await response.json();
  const badges = Array.isArray(data?.badges) ? data.badges.filter(isBadge) : [];
  return { badges };
};

export const useBadgeCatalog = () => {
  const [catalog, setCatalog] = useState<BadgeCatalog>({ badges: [] });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchBadgeCatalog()
      .then((data) => {
        if (!mounted) return;
        setCatalog(data);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load badges');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const badges = useMemo(() => catalog.badges, [catalog]);

  return { catalog, badges, loading, error };
};
