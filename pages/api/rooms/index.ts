import {NextApiRequest, NextApiResponse} from 'next';
import RoomModel from '@root/firebase/models/Room';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    if (req.method === 'POST') {
        try {
            const room = new RoomModel();

            await room.fetch();

            room.sessions!.add();
            room.save();
            res.status(200).json(room.data);
        } catch (e) {
            console.error(e);
            res.status(500).json({error: (e as ErrorEvent).message});
            return;
        }
    } else {
        res.status(404).end();
    }
}
