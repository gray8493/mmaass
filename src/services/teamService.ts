import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  documentId,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { AppUser } from '../types/user';
import { Team, TeamMember, CreateTeamInput, TeamRole } from '../types/team';

const TEAMS_COLLECTION = 'teams';
const MEMBERS_COLLECTION = 'teamMembers';

/**
 * Sinh mã nhóm ngẫu nhiên 6 ký tự (dùng để tham gia nhóm).
 */
export const generateTeamCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const memberDocId = (teamId: string, userId: string): string => `${teamId}_${userId}`;

const mapTeam = (id: string, data: Record<string, unknown>): Team => ({
  id,
  name: (data.name as string) || '',
  description: (data.description as string) || '',
  ownerId: (data.ownerId as string) || '',
  code: (data.code as string) || '',
  createdAt: (data.createdAt as string) || new Date().toISOString(),
});

const mapMember = (id: string, data: Record<string, unknown>): TeamMember => ({
  id,
  teamId: (data.teamId as string) || '',
  userId: (data.userId as string) || '',
  role: ((data.role as TeamRole) || 'member') as TeamRole,
  joinedAt: (data.joinedAt as string) || new Date().toISOString(),
  name: (data.name as string) || '',
  email: (data.email as string) || '',
  avatarUrl: (data.avatarUrl as string) || '',
});

const buildMembership = (teamId: string, user: AppUser, role: TeamRole): TeamMember => ({
  id: memberDocId(teamId, user.id),
  teamId,
  userId: user.id,
  role,
  joinedAt: new Date().toISOString(),
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
});

/**
 * Tạo nhóm mới và tự động thêm người tạo làm trưởng nhóm (leader).
 */
export const createTeam = async (
  input: CreateTeamInput,
  owner: AppUser
): Promise<Team> => {
  const teamRef = doc(collection(db, TEAMS_COLLECTION));
  const team: Team = {
    id: teamRef.id,
    name: input.name.trim(),
    description: input.description.trim(),
    ownerId: owner.id,
    code: generateTeamCode(),
    createdAt: new Date().toISOString(),
  };

  await setDoc(teamRef, team);

  const membership = buildMembership(team.id, owner, 'leader');
  await setDoc(doc(db, MEMBERS_COLLECTION, membership.id), membership);

  return team;
};

/**
 * Tham gia nhóm bằng mã nhóm.
 */
export const joinTeamByCode = async (code: string, user: AppUser): Promise<Team> => {
  const normalized = code.trim().toUpperCase();
  const teamsQuery = query(
    collection(db, TEAMS_COLLECTION),
    where('code', '==', normalized)
  );
  const snapshot = await getDocs(teamsQuery);

  if (snapshot.empty) {
    throw new Error('Không tìm thấy nhóm nào với mã này. Vui lòng kiểm tra lại.');
  }

  const team = mapTeam(snapshot.docs[0].id, snapshot.docs[0].data());

  const membershipRef = doc(db, MEMBERS_COLLECTION, memberDocId(team.id, user.id));
  const existing = await getDoc(membershipRef);
  if (existing.exists()) {
    throw new Error('Bạn đã là thành viên của nhóm này rồi.');
  }

  const membership = buildMembership(team.id, user, 'member');
  await setDoc(membershipRef, membership);

  return team;
};

/**
 * Lắng nghe danh sách nhóm mà người dùng tham gia (real-time).
 */
export const subscribeUserTeams = (
  userId: string,
  onSuccess: (teams: Team[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const membershipsQuery = query(
    collection(db, MEMBERS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    membershipsQuery,
    async (membershipSnapshot) => {
      try {
        const teamIds = Array.from(
          new Set(
            membershipSnapshot.docs
              .map((d) => (d.data().teamId as string) || '')
              .filter(Boolean)
          )
        );

        if (teamIds.length === 0) {
          onSuccess([]);
          return;
        }

        const teamsSnapshot = await getDocs(
          query(
            collection(db, TEAMS_COLLECTION),
            where(documentId(), 'in', teamIds.slice(0, 30))
          )
        );

        const teams = teamsSnapshot.docs.map((d) => mapTeam(d.id, d.data()));
        teams.sort((a, b) => a.name.localeCompare(b.name));
        onSuccess(teams);
      } catch (error) {
        if (onError) onError(error as Error);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

/**
 * Lắng nghe thông tin của một nhóm (real-time).
 */
export const subscribeTeam = (
  teamId: string,
  onSuccess: (team: Team | null) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  return onSnapshot(
    doc(db, TEAMS_COLLECTION, teamId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onSuccess(null);
        return;
      }
      onSuccess(mapTeam(snapshot.id, snapshot.data()));
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

/**
 * Lấy thông tin nhóm một lần.
 */
export const getTeam = async (teamId: string): Promise<Team | null> => {
  const snapshot = await getDoc(doc(db, TEAMS_COLLECTION, teamId));
  if (!snapshot.exists()) return null;
  return mapTeam(snapshot.id, snapshot.data());
};

/**
 * Lấy danh sách thành viên của nhóm một lần (dùng cho dropdown giao việc).
 */
export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  const snapshot = await getDocs(
    query(collection(db, MEMBERS_COLLECTION), where('teamId', '==', teamId))
  );
  const members = snapshot.docs.map((d) => mapMember(d.id, d.data()));
  members.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
  return members;
};

/**
 * Lắng nghe danh sách thành viên của nhóm (real-time).
 */
export const subscribeTeamMembers = (
  teamId: string,
  onSuccess: (members: TeamMember[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const membersQuery = query(
    collection(db, MEMBERS_COLLECTION),
    where('teamId', '==', teamId)
  );

  return onSnapshot(
    membersQuery,
    (snapshot) => {
      const members = snapshot.docs.map((d) => mapMember(d.id, d.data()));
      members.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
      onSuccess(members);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};
