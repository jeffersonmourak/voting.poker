import {Timestamp} from 'firebase/firestore';
import {Vote} from './Vote';
export interface Session {
    id: string;
    startedAt: Timestamp;
    votes: Record<string, Vote>;
    ended: boolean;
}
