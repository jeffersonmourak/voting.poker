import { CssBaseline } from '@mui/material';

interface RoomLayoutProps {
  children: React.ReactNode;
  params: { roomId: string };
}

export default function RoomLayout({ children, params }: RoomLayoutProps) {
  return (
    <>
      <CssBaseline />
      {children}
    </>
  );
}
