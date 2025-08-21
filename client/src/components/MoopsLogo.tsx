import React from 'react';
import { Box, Typography } from '@mui/material';

interface MoopsLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const MoopsLogo: React.FC<MoopsLogoProps> = ({ size = 'medium', showText = true }) => {
  const getLogoSize = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40, fontSize: '1.2rem' };
      case 'large':
        return { width: 120, height: 120, fontSize: '2rem' }; // Bigger default large size
      default:
        return { width: 60, height: 60, fontSize: '1.5rem' };
    }
  };

  const logoSize = getLogoSize();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: showText ? 2 : 0,
      }}
    >
      {/* Your actual Moops logo image */}
      <Box
        component="img"
        src="./MoopsBookstore.png"
        alt="Moops Bookstore Logo"
        sx={{
          width: logoSize.width,
          height: logoSize.height,
          objectFit: 'contain',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(212, 165, 116, 0.3)',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      />

      {showText && (
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#3D2914', // Very dark brown for maximum contrast
            fontSize: logoSize.fontSize,
            letterSpacing: '0.5px',
            textShadow: '1px 1px 3px rgba(255,255,255,0.8)', // White shadow for extra pop
            fontFamily: '"Comic Neue", "Nunito", sans-serif',
          }}
        >
          Moops Bookstore
        </Typography>
      )}
    </Box>
  );
};

export default MoopsLogo;
