import { useState, useCallback } from 'react';
import type { ClaimUI } from '../types';

interface UseOptimisticVoteResult {
  userVotes: Set<string>;
  optimisticallyAddVote: (claimId: string) => void;
  optimisticallyRemoveVote: (claimId: string) => void;
  revertVote: (claimId: string, wasAdding: boolean) => void;
  setUserVotes: React.Dispatch<React.SetStateAction<Set<string>>>;
  updateClaimVotes: (claimId: string, delta: number) => void;
}

/**
 * Custom hook to manage optimistic UI updates for voting
 */
export const useOptimisticVote = (
  setClaims: React.Dispatch<React.SetStateAction<ClaimUI[]>>
): UseOptimisticVoteResult => {
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  const updateClaimVotes = useCallback((claimId: string, delta: number) => {
    setClaims(prev =>
      prev.map(claim =>
        claim.id === claimId
          ? { ...claim, votes: Math.max(0, claim.votes + delta) }
          : claim
      )
    );
  }, [setClaims]);

  const optimisticallyAddVote = useCallback((claimId: string) => {
    updateClaimVotes(claimId, 1);
    setUserVotes(prev => new Set(prev).add(claimId));
  }, [updateClaimVotes]);

  const optimisticallyRemoveVote = useCallback((claimId: string) => {
    updateClaimVotes(claimId, -1);
    setUserVotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(claimId);
      return newSet;
    });
  }, [updateClaimVotes]);

  const revertVote = useCallback((claimId: string, wasAdding: boolean) => {
    if (wasAdding) {
      optimisticallyRemoveVote(claimId);
    } else {
      optimisticallyAddVote(claimId);
    }
  }, [optimisticallyAddVote, optimisticallyRemoveVote]);

  return {
    userVotes,
    optimisticallyAddVote,
    optimisticallyRemoveVote,
    revertVote,
    setUserVotes,
    updateClaimVotes
  };
};
