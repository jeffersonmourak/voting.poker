import {database, logger} from 'firebase-functions';
import * as admin from 'firebase-admin';
import {Room} from '@coreTypes/Room';
import {dataToType} from '../utils';

admin.initializeApp();

export const onUserDisconnect = database
    .ref('/rooms/{roomId}/users/{userId}')
    .onDelete(async (_snapshot, context) => {
        const {roomId, userId} = context.params;

        const room = admin.firestore().doc(`rooms/${roomId}`);

        const roomSnapshot = await room.get();

        const roomData = dataToType<Room>(roomSnapshot.data());

        if (!roomData) {
            logger.error('Room not found', {roomId});
            return;
        }

        const newUsers = roomData.users.filter((user) => user.id !== userId);

        if (newUsers.length === 0) {
            await room.delete();
        } else {
            await room.update({
                users: newUsers,
            });
        }
    });
