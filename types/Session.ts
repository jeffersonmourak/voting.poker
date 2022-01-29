import {Vote} from './Vote';
export interface Session {
    id: string;
    startedAt: Date;
    votes: Record<string, Vote>;
    ended: boolean;
}
