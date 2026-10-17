import { useState, useEffect } from 'react';
import { Team, TeamMember } from '../types/team';
import { subscribeTeam, subscribeTeamMembers } from '../services/teamService';

export const useTeamDetail = (teamId: string) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);

    const unsubscribeTeam = subscribeTeam(teamId, setTeam);

    const unsubscribeMembers = subscribeTeamMembers(
      teamId,
      (fetchedMembers) => {
        setMembers(fetchedMembers);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => {
      unsubscribeTeam();
      unsubscribeMembers();
    };
  }, [teamId]);

  return { team, members, loading };
};
