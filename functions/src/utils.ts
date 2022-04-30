import * as admin from 'firebase-admin';

export const dataToType = <T>(data?: admin.firestore.DocumentData): T | undefined => {
    if (!data) {
        return;
    }

    const keys = Object.keys(data);

    type Key = keyof T;

    const result: any = {};

    keys.forEach((key) => {
        // @ts-ignore
        const value = data[key as Key];
        result[key] = value;
    });

    return result;
};
