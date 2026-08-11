import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '@/core/store';

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <Provider store={store}>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '16px',
            background: '#0F172A',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600',
            padding: '12px 18px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.25)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Provider>
  );
};
