import BasePage from "@voting.poker/next/components/BasePage";
import { lazy, Suspense } from 'react';
import Loading from './loading';

interface RoomPageProps {
  params: { roomId: string };
}

const DynamicPage = lazy(() => import('./_components/RoomPage'))

export default function RoomPageProviders({ params }: RoomPageProps) {
  return (
    <BasePage>
      <Suspense fallback={<Loading />}>
        <DynamicPage params={params} />
      </Suspense>
    </BasePage>
  );
}
