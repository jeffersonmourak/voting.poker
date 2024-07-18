import BasePage from "@voting.poker/next/components/BasePage";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loading from './loading';

interface RoomPageProps {
  params: { roomId: string };
}

const DynamicPage = dynamic(() => import('./_components/RoomPage'), { ssr: false })

export default function RoomPageProviders({ params }: RoomPageProps) {
  return (
    <BasePage>
      <Suspense fallback={<Loading />}>
        <DynamicPage params={params} />
      </Suspense>
    </BasePage>
  );
}
