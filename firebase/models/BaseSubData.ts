import {v4 as uuidv4} from 'uuid';

type Options<P> = {
    collection: string;
    parent: P & {data: any};
};

class BaseSubData<T, P> {
    options?: Options<P>;
    data = [] as (T & {id: string})[];

    constructor(data: (T & {id: string})[], options?: Options<P>) {
        this.data = data;

        this.options = options;
    }

    private updateParentData() {
        if (!this.options) {
            return;
        }

        const {parent, collection} = this.options;

        // @ts-ignore
        parent[collection] = this.data;
        // @ts-ignore
        parent.update({[collection]: this.data});
    }

    find(id: string) {
        return this.data.find((item) => item.id === id);
    }

    update(id: string, data: T): (T & {id: string}) | undefined {
        const item = this.find(id);

        if (!item) {
            return;
        }

        Object.assign(item, data);

        this.updateParentData();

        return item as T & {id: string};
    }

    add(data: Partial<T & {id: string}>): T & {id: string} {
        const id = data.id || uuidv4();

        const newData = {
            id,
            ...data,
        } as T & {id: string};

        this.data.push(newData);

        this.updateParentData();

        return newData;
    }

    remove(id: string) {
        const index = this.data.findIndex((item) => item.id === id);

        if (index === -1) {
            return;
        }

        this.data.splice(index, 1);
        this.updateParentData();
    }

    exists(id: string) {
        return !!this.find(id);
    }
}

export default BaseSubData;
