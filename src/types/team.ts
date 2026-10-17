export type TeamRole = 'leader' | 'member';

export interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  code: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface CreateTeamInput {
  name: string;
  description: string;
}
