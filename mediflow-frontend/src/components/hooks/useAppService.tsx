import React, { createContext, useContext } from 'react';

const AppServiceContext = createContext<any>(null);

export const AppServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppServiceContext.Provider value={{ userManagementAppService: null }}>
      {children}
    </AppServiceContext.Provider>
  );
};

export const useAppService = () => {
  const context = useContext(AppServiceContext);
  return context || { userManagementAppService: null };
};
