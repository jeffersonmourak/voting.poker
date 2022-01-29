import {NextApiRequest, NextApiResponse} from 'next';
import RoomModel from '@root/firebase/models/Room';
import {User} from '@root/types/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    const {id, userId} = req.query as {id: string; userId: string};
    const {body} = req as {body: User};

    const room = new RoomModel(id);

    await room.fetch();

    if (!room.users?.exists(userId) || req.method === 'POST') {
        res.status(404).end();
        return;
    }

    try {
        switch (req.method) {
            case 'GET':
                return res.status(200).json(room.users?.find(userId));
            case 'PUT': {
                const data = await room.users?.update(userId, body);
                await room.save();

                return res.status(200).json(data);
            }
            case 'DELETE': {
                const user = await room.users?.find(userId);
                await room.users?.remove(userId);
                await room.save();

                return res.status(200).json(user);
            }

            default:
                res.status(404).end();
                return;
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({error: (e as ErrorEvent).message});
        return;
    }
}
