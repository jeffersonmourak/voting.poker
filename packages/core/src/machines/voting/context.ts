export interface User {
  id: string;
  name: string;
  emoji: string;
  avatar: string;
  moderator: boolean;
  vote: string | null;
}

export type RoomId = string;

export interface VotingContext {
  users: User[];
  roomId: RoomId;
  votes: Record<string, string>;
}
