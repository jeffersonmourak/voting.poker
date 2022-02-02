import {NextApiRequest, NextApiResponse} from 'next';

import {firestore, realtimeDB} from '@root/firebase/clientApp';
import {ref, onValue, DatabaseReference, DataSnapshot} from 'firebase/database';
import Room from '@root/firebase/models/Room';
import {deleteDoc, doc, collection, getDocs} from 'firebase/firestore';

const onValuePromise = (ref: DatabaseReference) =>
    new Promise<DataSnapshot>((resolve, reject) => {
        onValue(
            ref,
            (snapshot) => {
                resolve(snapshot);
            },
            (error) => {
                reject(error);
            }
        );
    });

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    if (req.method === 'GET') {
        const presenceRef = ref(realtimeDB, `rooms/`);
        const roomsSnapshot = await onValuePromise(presenceRef);
        const activeRooms = Object.keys(roomsSnapshot.val() || {});
        const allRooms = await getDocs(collection(firestore, 'rooms'));
        const toBeDeletedRooms: string[] = [];

        allRooms.forEach(async (room) => {
            if (!activeRooms.includes(room.id)) {
                toBeDeletedRooms.push(room.id);
            }
        });

        for (const roomId of toBeDeletedRooms) {
            await deleteDoc(doc(firestore, 'rooms', roomId));
        }

        res.json({success: true});
    } else {
        res.status(404).end();
    }
}
