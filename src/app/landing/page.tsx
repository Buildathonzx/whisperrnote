"use client";

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  Paper, 
  Grid, 
  Card, 
  Chip,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import { 
  ArrowForward,
  PlayArrow,
  Star,
  Shield,
  Rocket,
  AutoAwesome,
  Group,
  Extension,
  Cloud,
} from '@mui/icons-material';
import Link from "next/link";
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionPaper = motion(Paper);

const features = [
  {
    icon: <Shield sx={{ fontSize: 48 }} />,
    title: 'Military-Grade Security',
    description: 'End-to-end encryption with blockchain-verified integrity. Your thoughts remain truly private.',
    color: '#4CAF50',
  },
  {
    icon: <Rocket sx={{ fontSize: 48 }} />,
    title: 'Lightning Fast',
    description: 'Optimized for speed with instant sync across all your devices. Never miss a thought.',
    color: '#2196F3',
  },
  {
    icon: <AutoAwesome sx={{ fontSize: 48 }} />,
    title: 'AI-Powered Insights',
    description: 'Smart summaries, auto-tagging, and content suggestions that learn from your style.',
    color: '#FF9800',
  },
  {
    icon: <Group sx={{ fontSize: 48 }} />,
    title: 'Real-time Collaboration',
    description: 'Work together seamlessly with live cursors, comments, and synchronized editing.',
    color: '#9C27B0',
  },
  {
    icon: <Extension sx={{ fontSize: 48 }} />,
    title: 'Extensible Platform',
    description: 'Customize your workflow with powerful plugins and integrations.',
    color: '#FF5722',
  },
  {
    icon: <Cloud sx={{ fontSize: 48 }} />,
    title: 'Universal Access',
    description: 'Access your notes anywhere - web, desktop, mobile, or offline.',
    color: '#607D8B',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Product Designer',
    content: "WhisperNote transformed our design process. The collaboration features are incredible!",
    rating: 5,
  },
  {
    name: 'Marcus Thompson',
    role: 'Software Engineer',
    content: "The API integration capabilities are outstanding. Perfect for technical documentation.",
    rating: 5,
  },
  {
    name: 'Elena Rodriguez',
    role: 'Content Creator',
    content: "I love how the AI helps organize my thoughts. It's like having a personal assistant.",
    rating: 5,
  },
];

const stats = [
  { number: '50K+', label: 'Active Users' },
  { number: '1M+', label: 'Notes Created' },
  { number: '99.9%', label: 'Uptime' },
  { number: '24/7', label: 'Support' },
];

export default function LandingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
    }}>
      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 8, md: 12 },
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <MotionBox
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <MotionBox variants={itemVariants}>
                  <Chip
                    label="🚀 Now with AI-powered insights"
                    sx={{
                      mb: 3,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                      border: `2px solid ${theme.palette.primary.main}40`,
                      fontWeight: 600,
                    }}
                  />
                </MotionBox>

                <MotionBox variants={itemVariants}>
                  <Typography 
                    variant="h1"
                    sx={{ 
                      fontWeight: 800,
                      fontSize: { xs: '2.5rem', md: '4rem' },
                      lineHeight: 1.1,
                      mb: 2,
                      background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Your Ideas,{' '}
                    <Box component="span" sx={{ 
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      Amplified
                    </Box>
                  </Typography>
                </MotionBox>

                <MotionBox variants={itemVariants}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 4, 
                      color: 'text.secondary',
                      fontWeight: 400,
                      lineHeight: 1.6,
                    }}
                  >
                    The only note-taking app you'll ever need. Secure, intelligent, and designed for the way you think.
                  </Typography>
                </MotionBox>

                <MotionBox variants={itemVariants}>
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2}
                    sx={{ mb: 4 }}
                  >
                    <Button
                      component={Link}
                      href="/signup"
                      variant="contained"
                      size="large"
                      sx={{ 
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                        },
                      }}
                      endIcon={<ArrowForward />}
                    >
                      Start Free Today
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{ 
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          transform: 'translateY(-2px)',
                        },
                      }}
                      startIcon={<PlayArrow />}
                    >
                      Watch Demo
                    </Button>
                  </Stack>
                </MotionBox>

                <MotionBox variants={itemVariants}>
                  <Stack direction="row" spacing={4} sx={{ mt: 4 }}>
                    {stats.map((stat, index) => (
                      <Box key={index} sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {stat.number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </MotionBox>
              </MotionBox>
            </Grid>

            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                sx={{ 
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: '24px',
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
                    transform: 'rotate(3deg)',
                    '&:hover': {
                      transform: 'rotate(0deg) scale(1.02)',
                      transition: 'all 0.3s ease',
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 300, md: 400 },
                      height: { xs: 400, md: 500 },
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      App Preview
                    </Typography>
                    
                    {/* Floating elements for visual interest */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 3,
                          delay: i * 0.5,
                          repeat: Infinity,
                        }}
                        style={{
                          position: 'absolute',
                          left: `${20 + i * 15}%`,
                          top: `${20 + (i % 3) * 20}%`,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: theme.palette.primary.main,
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{ textAlign: 'center', mb: 8 }}
          >
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700,
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Everything You Need
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Powerful features designed to enhance your productivity and creativity
            </Typography>
          </MotionBox>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  sx={{ 
                    height: '100%',
                    p: 3,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${feature.color}08 100%)`,
                    border: `2px solid ${feature.color}20`,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 40px ${feature.color}20`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '20px',
                      background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}40)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: feature.color,
                      mb: 3,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${theme.palette.action.hover} 0%, ${theme.palette.background.paper} 100%)`,
      }}>
        <Container maxWidth="lg">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{ textAlign: 'center', mb: 8 }}
          >
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Loved by Professionals
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Join thousands of satisfied users who've transformed their workflow
            </Typography>
          </MotionBox>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  sx={{ 
                    height: '100%',
                    p: 4,
                    background: theme.palette.background.paper,
                  }}
                >
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} sx={{ color: '#FFD700', fontSize: 20 }} />
                    ))}
                  </Box>
                  <Typography 
                    sx={{ 
                      mb: 3,
                      fontStyle: 'italic',
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                    }}
                  >
                    "{testimonial.content}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        mr: 2,
                        width: 50,
                        height: 50,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      }}
                    >
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
      }}>
        <Container maxWidth="lg">
          <MotionPaper
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            sx={{
              p: { xs: 4, md: 8 },
              textAlign: 'center',
              borderRadius: '24px',
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
            }}
          >
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700,
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Ready to Transform Your Ideas?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Join thousands of professionals who've already revolutionized their note-taking experience
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                component={Link}
                href="/signup"
                variant="contained"
                size="large"
                sx={{ 
                  py: 2,
                  px: 6,
                  fontSize: '1.2rem',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                }}
                endIcon={<ArrowForward />}
              >
                Start Your Journey
              </Button>
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                size="large"
                sx={{ 
                  py: 2,
                  px: 6,
                  fontSize: '1.2rem',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                Sign In
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              No credit card required • Free forever plan available
            </Typography>
          </MotionPaper>
        </Container>
      </Box>
    </Box>
  );
}