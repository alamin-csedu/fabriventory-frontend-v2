import { useAuth as useAuthContext } from '@/contexts/auth-context';

export const useAuth = () => {
  const authContext = useAuthContext();

  const getEndpoint = (endpoint) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fbbackend.rakibulhoque.com/api/v1';
    return `${baseUrl}/${endpoint}`;
  };

  const getDownloadEndpoint = (endpoint) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fbbackend.rakibulhoque.com/api/v1';
    return `${baseUrl}/${endpoint}`;
  };

  return {
    ...authContext,
    getEndpoint,
    getDownloadEndpoint,
  };
};
