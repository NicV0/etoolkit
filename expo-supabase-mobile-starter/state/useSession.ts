import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { serverComm, type Organization, type CreateOrgData } from '../lib/ServerComm';

// Re-export types for backward compatibility
export type { Organization, CreateOrgData };

export const useSession = () => {
  const { session, user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrganization();
  }, [user]);

  const loadOrganization = async () => {
    if (!user) {
      setOrganization(null);
      setIsLoading(false);
      return;
    }

    try {
      const org = await serverComm.getCurrentOrganization();
      setOrganization(org);
    } catch (error) {
      console.error('Failed to load organization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrganization = async (data: CreateOrgData): Promise<Organization> => {
    if (!user) {
      throw new Error('User must be authenticated to create organization');
    }

    try {
      const newOrg = await serverComm.createOrganization(data);
      setOrganization(newOrg);
      return newOrg;
    } catch (error) {
      console.error('Failed to create organization:', error);
      throw error;
    }
  };

  const updateOrganization = async (updates: Partial<Organization>): Promise<Organization> => {
    if (!organization) {
      throw new Error('No organization to update');
    }

    try {
      // TODO: Implement organization update in ServerComm
      const updatedOrg = { ...organization, ...updates };
      setOrganization(updatedOrg);
      return updatedOrg;
    } catch (error) {
      console.error('Failed to update organization:', error);
      throw error;
    }
  };

  const clearOrganization = async () => {
    try {
      setOrganization(null);
    } catch (error) {
      console.error('Failed to clear organization:', error);
    }
  };

  return {
    session,
    user,
    organization,
    isLoading,
    createOrganization,
    updateOrganization,
    clearOrganization,
  };
};
