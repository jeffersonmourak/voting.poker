import {Room} from '@root/types/Room';
import {User} from '@root/types/User';
import {Session} from '@root/types/Session';
import {v4 as uuidv4} from 'uuid';
import BaseModel from './BaseModel';
import SessionsSubData from './SessionSubData';
import UsersSubData from './UsersSubData';

class RoomModel extends BaseModel<Room> {
    sessions: SessionsSubData<RoomModel> | null = null;
    users: UsersSubData<RoomModel> | null = null;

    constructor(id?: string) {
        super('rooms');

        this.isNew = !id;

        this.data = {
            id: id || uuidv4(),
            name: '',
            createdAt: new Date(),
            users: [],
            sessions: [],
        };
    }

    async fetch() {
        await super.fetch();

        this.sessions = new SessionsSubData(this.data.sessions, {
            collection: 'sessions',
            parent: this,
        });

        this.users = new UsersSubData(this.data.users, {
            collection: 'users',
            parent: this,
        });
    }
}

export default RoomModel;
