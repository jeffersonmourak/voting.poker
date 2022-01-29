import {NextApiRequest, NextApiResponse} from 'next';
import RoomModel from '@root/firebase/models/Room';
import {Session} from '@root/types/Session';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    const {id} = req.query as {id: string};
    const {body} = req as {body: Session};

    const room = new RoomModel(id);

    await room.fetch();

    if (!room.exists || req.method === 'POST') {
        res.status(404).end();
        return;
    }

    try {
        switch (req.method) {
            case 'GET':
                return res.status(200).json(room.data);
            case 'PUT': {
                await room.update(body);
                await room.save();

                return res.status(200).json(room.data);
            }
            case 'DELETE': {
                await room.delete();

                return res.status(200).json(room.data);
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
