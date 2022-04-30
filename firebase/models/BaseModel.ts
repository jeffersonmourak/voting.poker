import {doc, DocumentData, DocumentReference, getDoc, setDoc} from 'firebase/firestore';
import {deleteDoc} from 'firebase/firestore';
import {firestore} from '../clientApp';

class BaseModel<T> {
    collection: string = '';

    data: T & {id: string} = {id: ''} as T & {id: string};

    exists: boolean = true;
    isNew: boolean = false;

    protected doc: DocumentReference<DocumentData> | null = null;

    constructor(collection: string) {
        this.collection = collection;
    }

    protected async getDoc(id: string) {
        this.doc = doc(firestore, `${this.collection}/${id}`);

        const roomDoc = await getDoc(this.doc);

        if (roomDoc.exists()) {
            this.updateFields(roomDoc.data() as T);
            this.exists = true;
        } else {
            this.exists = false;
        }
    }

    protected updateFields(fields: Partial<T>) {
        const keys = Object.keys(fields);

        type Key = keyof T;

        keys.forEach((key) => {
            const value = fields[key as Key]!;
            // @todo find a better way to do this
            //@ts-ignore
            this.data[key] = value;
        });
    }

    private blockIfNotReady() {
        if (!this.isNew && (!this.doc || !this.exists)) {
            throw new Error('Document not ready!');
        }
    }

    async fetch() {
        await this.getDoc(this.data.id);
    }

    async save() {
        this.blockIfNotReady();
        return await setDoc(this.doc!, this.data);
    }

    async update(fields: Partial<T>) {
        this.blockIfNotReady();
        this.updateFields(fields);
    }

    async delete() {
        this.blockIfNotReady();
        return await deleteDoc(this.doc!);
    }
}

export default BaseModel;
