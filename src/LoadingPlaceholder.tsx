import Box from '@mui/material/Box';
import { LoadingPanda } from './LoadingPanda';
import Typography from "@mui/material/Typography";
import Paper from '@mui/material/Paper';

export const LoadingPlaceholder = () => {
  return (
    <Paper sx={{ height: 250, width: "100%", display: 'flex', justifyContent: 'space-evenly', flexDirection: 'column', alignItems: 'center' }}>
      <Box component="div" sx={{ backgroundColor: 'white', display: 'flex', width: 100 }}>
        <LoadingPanda />
      </Box>
      <Typography variant="h6" sx={{ display: 'flex' }}>Loading...</Typography>
    </Paper>
  )
}