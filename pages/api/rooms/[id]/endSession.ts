import {NextApiRequest, NextApiResponse} from 'next';
import RoomModel from '@root/firebase/models/Room';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    const {id} = req.query as {id: string};

    try {
        const room = new RoomModel(id);

        await room.fetch();

        if (!room.exists || req.method !== 'POST') {
            res.status(404).end();
            return;
        }

        const vote = await room.sessions?.end();
        await room.save();
        res.status(200).json(vote);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: (e as ErrorEvent).message});
        return;
    }
}
