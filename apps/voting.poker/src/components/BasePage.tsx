import { Grid, keyframes, styled } from '@mui/material';
import { ReactNode } from 'react';
interface BasePageProps {
  children: ReactNode;
}

const bounce = keyframes`
  from, 20%, 53%, 80%, to {
    transform: scale(1);
  }

  40%, 43% {
    transform: scale(1.1);
  }

  70% {
    transform: scale(1.04);
  }

  90% {
    transform: scale(1.1);
  }
`;

const Root = styled(Grid)({
  width: '100%',
  height: '100vh',
  flexWrap: 'nowrap',
})

const Content = styled(Grid)({
  flex: 1,
})

const Footer = styled(Grid)(({ theme }) => ({
  lineHeight: theme.spacing(6),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const Heart = styled('span')({
  color: 'red',
  animation: `${bounce} 1s ease infinite`,
})

const Link = styled('a')(({ theme }) => ({
  color: theme.palette.secondary.main,
}))


const BasePage = ({ children }: BasePageProps) => {
  return (
    <Root container direction="column">
      <Content item>
        {children}
      </Content>

      <Footer item>
        Made with&nbsp;<Heart>♥︎</Heart>&nbsp;by&nbsp;
        <Link href="https://github.com/jeffersonmourak" target="_blank">
          jeffersonmourak
        </Link>
      </Footer>
    </Root>
  );
};

export default BasePage;
