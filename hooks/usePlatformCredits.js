'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserId, initUser, getCredits, spendCredits, earnCredits, getTransactionHistory } from '@/lib/platforms-credits';

export function usePlatformCredits() {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [userInitialized, setUserInitialized] = useState(false);

  const refetch = useCallback(async () => {
    const data = await getCredits();
    if (data && typeof data.credits === 'number') setCredits(data.credits);
    setLoading(false);
  }, []);

  const refetchHistory = useCallback(async () => {
    const data = await getTransactionHistory();
    if (data && Array.isArray(data.transactions)) setTransactions(data.transactions);
  }, []);

  useEffect(() => {
    async function init() {
      const uid = getUserId();
      if (!uid) return;
      const result = await initUser();
      if (result.success || result.alreadyExists) {
        setUserInitialized(true);
        await refetch();
        await refetchHistory();
      }
      setLoading(false);
    }
    init();
  }, [refetch, refetchHistory]);

  const spend = useCallback(async (amount, description, refId = '') => {
    const result = await spendCredits(amount, description, refId);
    if (result.success) {
      setCredits(result.credits);
      await refetchHistory();
    }
    return result;
  }, [refetchHistory]);

  const earn = useCallback(async (amount, description, refId = '') => {
    const result = await earnCredits(amount, description, refId);
    if (result.success) {
      setCredits(result.credits);
      await refetchHistory();
    }
    return result;
  }, [refetchHistory]);

  return { credits, loading, transactions, userInitialized, spend, earn, refetch, refetchHistory };
}
