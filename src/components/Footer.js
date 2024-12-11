import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
          component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0074D9',
        color: 'white',
        textAlign: 'center',
        padding: '10px 0',
      }}
    >
      <Typography variant="body2">
        Made with ❤️ by Shahnawaz |{' '}
        <a href="https://www.instagram.com/theshahnawaaz" target='blank' style={{ color: 'white', textDecoration: 'underline' }}>
          @TheShahnawaaz
        </a>
      </Typography>
    </Box>
  );
};

export default Footer;
