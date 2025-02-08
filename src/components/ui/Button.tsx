"use client";

import { forwardRef } from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, styled } from '@mui/material';
import { motion } from 'framer-motion';

const StyledButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none',
  '&.size-large': {
    padding: '12px 24px',
    fontSize: '1rem',
  },
  '&.variant-gradient': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    color: 'white',
    border: 'none',
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    },
  },
  '&.variant-outline-gradient': {
    background: 'transparent',
    border: '2px solid transparent',
    backgroundImage: `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}), linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    '&:hover': {
      backgroundImage: `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}), linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    },
  },
  '&.variant-glass': {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: theme.palette.text.primary,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
    },
  },
}));

const MotionButton = motion(StyledButton);

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'contained' | 'outlined' | 'text' | 'gradient' | 'outline-gradient' | 'glass';
  withAnimation?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'contained', withAnimation = true, className = '', ...props }, ref) => {
    const buttonProps = {
      ...props,
      className: `${className} variant-${variant}`,
      ref,
    };

    if (!withAnimation) {
      return <StyledButton {...buttonProps} />;
    }

    return (
      <MotionButton
        {...buttonProps}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
