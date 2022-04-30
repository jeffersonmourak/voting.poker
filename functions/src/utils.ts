import * as admin from 'firebase-admin';

export const dataToType = <T>(data?: admin.firestore.DocumentData): T | undefined => {
    type Key = keyof T;

    if (!data) {
        return;
    }

    const keys = Object.keys(data);
    const result: any = {};

    keys.forEach((key) => {
        // @ts-ignore
        const value = data[key as Key];
        result[key] = value;
    });

    return result;
};
