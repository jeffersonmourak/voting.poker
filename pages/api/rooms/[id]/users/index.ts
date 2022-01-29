import {NextApiRequest, NextApiResponse} from 'next';
import RoomModel from '@root/firebase/models/Room';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    const {id} = req.query as {id: string};
    const body = req.body as {name: string};
    const room = new RoomModel(id);
    await room.fetch();

    if (!room.exists || req.method !== 'POST') {
        res.status(404).end();
        return;
    }

    try {
        const user = await room.users?.add({name: body.name});
        await room.save();
        res.status(200).json(user);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: (e as ErrorEvent).message});
        return;
    }
}
