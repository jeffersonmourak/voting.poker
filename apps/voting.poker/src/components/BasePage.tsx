import { Grid, Link } from '@mui/material';
import { ReactNode } from 'react';
interface BasePageProps {
  children: ReactNode;
}

const BasePage = ({ children }: BasePageProps) => {
  return (
    <Grid container direction="column" sx={{
      width: '100%',
      height: '100vh',
      flexWrap: 'nowrap',
    }}>
      <Grid item sx={{
        flex: 1,
      }}>
        {children}
      </Grid>

      <Grid item sx={{
        lineHeight: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        Made with&nbsp;<span style={{
          color: 'red',
          animation: `heart-beat 1s ease infinite`,
        }}>♥︎</span>&nbsp;by&nbsp;
        <Link href="https://github.com/jeffersonmourak" target="_blank" sx={{
          color: 'secondary.main',
        }}>
          jeffersonmourak
        </Link>
      </Grid>
    </Grid>
  );
};

export default BasePage;
