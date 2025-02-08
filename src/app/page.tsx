"use client";

import { Box, Container, Typography, Button, Stack, Paper, Grid, Divider, Avatar, Card, CardContent } from '@mui/material';
import { Security, Speed, Create, Cloud, Code, Group, LockOutlined, Timeline, DevicesOther } from '@mui/icons-material';
import Link from "next/link";
import Image from "next/image";
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

const features = [
  {
    icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'End-to-End Encryption',
    description: 'Your notes are encrypted and secure from end to end'
  },
  {
    icon: <Speed sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Lightning Fast',
    description: 'Optimized for speed and performance'
  },
  {
    icon: <Create sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Rich Text Editor',
    description: 'Full-featured markdown and rich text support'
  },
  {
    icon: <Cloud sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Cloud Sync',
    description: 'Access your notes from anywhere'
  },
  {
    icon: <Code sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Developer API',
    description: 'Build integrations with our robust API'
  },
  {
    icon: <Group sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Collaboration',
    description: 'Share and collaborate on notes in real-time'
  }
];

const platformFeatures = [
  {
    icon: <DevicesOther />,
    title: 'Cross-Platform',
    description: 'Available on web, desktop, and mobile'
  },
  {
    icon: <LockOutlined />,
    title: 'Secure Sharing',
    description: 'Share notes with end-to-end encryption'
  },
  {
    icon: <Timeline />,
    title: 'Version History',
    description: 'Track changes with full version history'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Software Developer',
    content: 'WhisperNote has completely transformed how I organize my development notes. The API integration is fantastic!',
    avatar: 'SJ'
  },
  {
    name: 'Michael Chen',
    role: 'Product Manager',
    content: 'The collaboration features are game-changing. Our team's productivity has increased significantly.',
    avatar: 'MC'
  },
  {
    name: 'Emily Davis',
    role: 'Content Creator',
    content: 'The rich text editor and cloud sync make it perfect for managing my content across devices.',
    avatar: 'ED'
  }
];

export default function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #3B82F6 0%, #EC4899 100%)',
        color: 'white',
        py: { xs: 8, md: 12 },
        mb: 8,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography 
                  variant="h2" 
                  component="h1" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                  }}
                >
                  Secure Your Thoughts
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ mb: 4, fontWeight: 300 }}
                >
                  A modern, encrypted note-taking platform for individuals and teams
                </Typography>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2}
                >
                  <Button
                    component={Link}
                    href="/signup"
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={{ 
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem'
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    component={Link}
                    href="#features"
                    variant="outlined"
                    size="large"
                    sx={{ 
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Learn More
                  </Button>
                </Stack>
              </MotionBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    height: 'auto',
                    position: 'relative'
                  }}
                >
                  <Image
                    src="/logo/whisperrnote.png"
                    alt="WhisperNote Interface"
                    width={500}
                    height={500}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '12px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}
                  />
                </Box>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Grid Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }} id="features">
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ mb: 6, fontWeight: 600 }}
        >
          Powerful Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <MotionPaper
                elevation={2}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{ p: 3, height: '100%' }}
              >
                {feature.icon}
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </MotionPaper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Platform Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>