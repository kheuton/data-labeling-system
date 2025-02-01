import { createClient } from '@tanstack/react-query';

export const queryClient = createClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});