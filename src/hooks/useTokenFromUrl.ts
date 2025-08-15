import { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

export function useTokenFromUrl(): string | null {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Try to get token from URL parameters
  const tokenFromParams = searchParams.get('token');
  
  // Try to get token from hash
  const tokenFromHash = window.location.hash.includes('token=') 
    ? window.location.hash.split('token=')[1]?.split('&')[0] 
    : null;

  // Try to get token from path (for URLs like /jwt-token)
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const tokenFromPath = pathSegments.length === 1 && pathSegments[0].length > 50 ? pathSegments[0] : null;

  const finalToken = tokenFromParams || tokenFromHash || tokenFromPath;
  console.log('Token extraction results:', {
    tokenFromParams,
    tokenFromHash,
    tokenFromPath,
    finalToken,
    pathname: location.pathname
  });
  
  return finalToken;
}