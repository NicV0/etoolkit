import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';
import { callBootstrapOrg } from './bootstrap';

type OrgContextType = {
  orgId: string | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const OrgContext = createContext<OrgContextType>({
  orgId: null,
  loading: true,
  error: null,
  reload: async () => {},
});

export const OrgProvider = ({ children }: { children: ReactNode }) => {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('memberships')
        .select('org_id')
        .limit(1)
        .maybeSingle();
      if (err) throw err;
      if (data) {
        setOrgId(data.org_id);
      } else {
        const res = await callBootstrapOrg();
        setOrgId(res.org_id);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <OrgContext.Provider value={{ orgId, loading, error, reload: load }}>
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => useContext(OrgContext);
