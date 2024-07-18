import { Button, Container, Paper, Typography } from '@mui/material';
import { Box } from '@mui/system';


const LoadingModal = () => {
  return (
    <Box sx={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }} >
      <Paper>
        <Container maxWidth="sm" sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: [6, 4],
          gap: 4,
        }}>
          <Typography variant="h5" align="center">
            Loading the room...
          </Typography>
          <Button variant="contained" color="secondary" href='/'>
            Leave
          </Button>
        </Container>
      </Paper>
    </Box>
  );
};

export default LoadingModal;
