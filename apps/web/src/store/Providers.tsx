'use client';
import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from './index';
import type { AppDispatch } from './index';
import { fetchCurrentUser } from './slices/authSlice';

function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return null;
}

export function Providers({ children } : { children: React.ReactNode}) {
  return (
    <Provider store={store}>
      <AuthInitializer />
      {children}
    </Provider>
  );
}
