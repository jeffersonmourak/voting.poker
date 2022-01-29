import {v4 as uuidv4} from 'uuid';
import {Session} from '@root/types/Session';
import BaseSubData from './BaseSubData';

class SessionsSubData<P> extends BaseSubData<Session, P> {
    constructor(data: Session[], options?: {collection: string; parent: P & {data: any}}) {
        super(data, options);
    }

    private latestSession() {
        return this.data[this.data.length - 1];
    }

    add(data?: Partial<Session>): Session {
        const newData = {
            id: data?.id || uuidv4(),
            startedAt: new Date(),
            ended: false,
            votes: {},
            ...data,
        } as Session;

        return super.add(newData);
    }

    vote(userId: string, vote: string) {
        const session = this.latestSession();

        if (!session) {
            return;
        }

        session.votes[userId] = {
            value: vote,
            userId,
        };

        this.update(session.id, session);

        return {
            userId,
            vote,
        };
    }
}

export default SessionsSubData;
