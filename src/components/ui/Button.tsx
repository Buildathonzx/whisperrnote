"use client";

import { forwardRef } from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, styled } from '@mui/material';
import { motion } from 'framer-motion';

const StyledButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: theme.palette.mode === 'light' 
    ? '0 4px 14px rgba(0, 0, 0, 0.08)' 
    : '0 4px 14px rgba(0, 0, 0, 0.25)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
    transform: 'scale(5)',
    opacity: 0,
    transition: 'transform 0.5s, opacity 0.6s',
  },
  '&:hover::after': {
    opacity: 0.4,
    transform: 'scale(0)',
    transition: 'transform 0.3s, opacity 0.3s',
  },
  '&.size-large': {
    padding: '14px 30px',
    fontSize: '1.1rem',
  },
  '&.variant-gradient': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    color: 'white',
    border: 'none',
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
      boxShadow: '0 7px 20px rgba(59, 130, 246, 0.4), 0 5px 12px rgba(236, 72, 153, 0.3)',
      transform: 'translateY(-3px)',
    },
    '&:active': {
      transform: 'translateY(-1px)',
      boxShadow: '0 3px 10px rgba(59, 130, 246, 0.3), 0 2px 5px rgba(236, 72, 153, 0.2)',
    }
  },
  '&.variant-outline-gradient': {
    background: 'transparent',
    border: '2px solid transparent',
    backgroundImage: `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}), linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    '&:hover': {
      backgroundImage: `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}), linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
      boxShadow: '0 7px 14px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-3px)',
    },
  },
  '&.variant-glass': {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: theme.palette.text.primary,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.25)',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-3px)',
    },
  },
  '&.variant-soft': {
    background: theme.palette.mode === 'light' 
      ? 'rgba(59, 130, 246, 0.1)' 
      : 'rgba(59, 130, 246, 0.15)',
    color: theme.palette.primary.main,
    border: 'none',
    '&:hover': {
      background: theme.palette.mode === 'light'
        ? 'rgba(59, 130, 246, 0.2)'
        : 'rgba(59, 130, 246, 0.25)',
      boxShadow: '0 6px 15px rgba(59, 130, 246, 0.15)',
      transform: 'translateY(-3px)',
    },
  },
  '&.variant-3d': {
    position: 'relative',
    transformStyle: 'preserve-3d',
    '&::before': {
      content: '""',
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      bottom: '-6px',
      background: 'inherit',
      filter: 'brightness(70%)',
      transformOrigin: 'bottom',
      transform: 'translateZ(-1px) skewX(0.5deg) scaleY(0.9)',
      borderRadius: 'inherit',
    },
    '&:hover': {
      transform: 'translateY(-5px) translateZ(0)',
    },
    '&:active': {
      transform: 'translateY(-2px) translateZ(0)',
    },
  },
}));

const MotionButton = motion(StyledButton);

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'contained' | 'outlined' | 'text' | 'gradient' | 'outline-gradient' | 'glass' | 'soft' | '3d';
  withAnimation?: boolean;
  animationScale?: number;
  glowEffect?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'contained', withAnimation = true, animationScale = 1.05, glowEffect = false, className = '', ...props }, ref) => {
    const buttonProps = {
      ...props,
      className: `${className} variant-${variant} ${glowEffect ? 'glow-effect' : ''}`,
      ref,
    };

    if (!withAnimation) {
      return <StyledButton {...buttonProps} />;
    }

    return (
      <MotionButton
        {...buttonProps}
        whileHover={{ scale: animationScale }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
