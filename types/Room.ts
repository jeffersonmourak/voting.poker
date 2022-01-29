import {User} from './User';
import {Session} from './Session';

export interface Room {
    id: string;
    name: string;
    users: User[];
    createdAt: Date;
    sessions: Session[];
}
