import {v4 as uuidv4} from 'uuid';
import {User} from '@root/types/User';
import BaseSubData from './BaseSubData';

class UsersSubData<P> extends BaseSubData<User, P> {
    constructor(data: User[], options?: {collection: string; parent: P & {data: any}}) {
        super(data, options);
    }

    add(data?: Partial<User>): User {
        const newData = {
            id: data?.id || uuidv4(),
            name: '',
            avatar: '',
            moderator: this.data.length === 0,
            ...data,
        } as User;

        return super.add(newData) as User;
    }
}

export default UsersSubData;
