import { useState, useEffect } from 'react';
import { Team } from '../types/team';
import { subscribeUserTeams } from '../services/teamService';

export const useTeams = (userId: string | null) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setTeams([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeUserTeams(
      userId,
      (fetchedTeams) => {
        setTeams(fetchedTeams);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, [userId]);

  return { teams, loading };
};
