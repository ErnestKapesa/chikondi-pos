import { createContext, useContext, useState, useEffect } from 'react';
import { getUser } from '../utils/dbUnified';
import { DEFAULT_CURRENCY, getCurrencyByCode, formatCurrency } from '../utils/currencies';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [currencyData, setCurrencyData] = useState(getCurrencyByCode(DEFAULT_CURRENCY));

  useEffect(() => {
    loadUserCurrency();
  }, []);

  const loadUserCurrency = async () => {
    try {
      const user = await getUser();
      if (user && user.currency) {
        setCurrency(user.currency);
        setCurrencyData(getCurrencyByCode(user.currency));
      }
    } catch (error) {
      console.error('Error loading user currency:', error);
    }
  };

  const formatAmount = (amount) => {
    return formatCurrency(amount, currency);
  };

  const value = {
    currency,
    currencyData,
    setCurrency,
    formatAmount,
    symbol: currencyData.symbol,
    name: currencyData.name
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}