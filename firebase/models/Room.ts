import {Room} from '@root/types/Room';
import BaseModel from './BaseModel';
import SessionsSubData from './SessionSubData';
import UsersSubData from './UsersSubData';

function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

class RoomModel extends BaseModel<Room> {
    sessions: SessionsSubData<RoomModel> | null = null;
    users: UsersSubData<RoomModel> | null = null;

    constructor(id?: string) {
        super('rooms');

        this.isNew = !id;

        this.data = {
            id: id || makeid(7),
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
