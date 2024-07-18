import BasePage from "@voting.poker/next/components/BasePage";
import dynamic from 'next/dynamic';
import Loading from './loading';

interface RoomPageProps {
  params: { roomId: string };
}

const DynamicPage = dynamic(() => import('./_components/RoomPage'), { ssr: false, loading: Loading });

export default function RoomPageProviders({ params }: RoomPageProps) {
  return (
    <BasePage>
      <DynamicPage params={params} />
    </BasePage>
  );
}
