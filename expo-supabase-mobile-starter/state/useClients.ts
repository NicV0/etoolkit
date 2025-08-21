import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serverComm, type Client, type CreateClientData, type UpdateClientData } from '../lib/ServerComm';

// Re-export types for backward compatibility
export type { Client, CreateClientData, UpdateClientData };

// Real API functions using ServerComm
const getOrgClients = async (orgId: string): Promise<Client[]> => {
  return serverComm.getOrgClients(orgId);
};

const createClient = async (orgId: string, data: CreateClientData): Promise<Client> => {
  return serverComm.createClient(orgId, data);
};

const updateClient = async (clientId: string, data: UpdateClientData): Promise<Client> => {
  return serverComm.updateClient(clientId, data);
};

const deleteClient = async (clientId: string): Promise<void> => {
  return serverComm.deleteClient(clientId);
};

export const useClients = (orgId: string) => {
  const queryClient = useQueryClient();

  const {
    data: clients = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['clients', orgId],
    queryFn: () => getOrgClients(orgId),
    enabled: !!orgId,
  });

  const createClientMutation = useMutation({
    mutationFn: (data: CreateClientData) => createClient(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', orgId] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: UpdateClientData }) =>
      updateClient(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', orgId] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', orgId] });
    },
  });

  const searchClients = (query: string) => {
    if (!query.trim()) return clients;
    
    return clients.filter(client =>
      client.name.toLowerCase().includes(query.toLowerCase()) ||
      client.email?.toLowerCase().includes(query.toLowerCase()) ||
      client.phone?.includes(query)
    );
  };

  return {
    clients,
    isLoading,
    error,
    refetch,
    createClient: createClientMutation.mutateAsync,
    updateClient: updateClientMutation.mutateAsync,
    deleteClient: deleteClientMutation.mutateAsync,
    searchClients,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
  };
};
