import {NextApiRequest, NextApiResponse} from 'next';

import {firestore, realtimeDB} from '@root/firebase/clientApp';
import {ref, onValue, DatabaseReference, DataSnapshot} from 'firebase/database';
import Room from '@root/firebase/models/Room';
import {deleteDoc, doc, collection, getDocs} from 'firebase/firestore';
import {difference} from 'lodash';

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
        const toBeCheckedRooms: string[] = [];

        allRooms.forEach(async (room) => {
            if (!activeRooms.includes(room.id)) {
                toBeDeletedRooms.push(room.id);
            } else {
                toBeCheckedRooms.push(room.id);
            }
        });

        for (const roomId of toBeCheckedRooms) {
            const activeRoomUsers = Object.keys(roomsSnapshot.val()[roomId].users);

            const room = new Room(roomId);
            await room.fetch();

            const usersInTheRoom = room.users?.data.map((user) => user.id);

            const usersToBeRemoved = difference(usersInTheRoom, activeRoomUsers);

            for (const user of usersToBeRemoved) {
                await room.users?.remove(user);
            }

            await room.save();
        }

        for (const roomId of toBeDeletedRooms) {
            await deleteDoc(doc(firestore, 'rooms', roomId));
        }

        res.json({success: true});
    } else {
        res.status(404).end();
    }
}
