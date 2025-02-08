"use client";

import { Box, Container, Typography, Button, Stack, Paper, Grid, Divider, Avatar, Card, CardContent } from '@mui/material';
import { Security, Speed, Create, Cloud, Code, Group, LockOutlined, Timeline, DevicesOther, 
  SmartToy, Psychology, AutoAwesome, Storage, Keyboard, Extension, Article, ExpandMore } from '@mui/icons-material';
import Link from "next/link";
import Image from "next/image";
import { motion } from 'framer-motion';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

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
    content: "The collaboration features are game-changing. Our team's productivity has increased significantly.",
    avatar: 'MC'
  },
  {
    name: 'Emily Davis',
    role: 'Content Creator',
    content: 'The rich text editor and cloud sync make it perfect for managing my content across devices.',
    avatar: 'ED'
  }
];

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Up to 100 notes',
      '5 MB storage',
      'Basic encryption',
      'Web access only'
    ],
    isPopular: false
  },
  {
    name: 'Pro',
    price: '$8',
    period: 'per month',
    features: [
      'Unlimited notes',
      '50 GB storage',
      'End-to-end encryption',
      'All platform access',
      'Priority support',
      'API access'
    ],
    isPopular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'per user/month',
    features: [
      'Everything in Pro',
      'Custom storage limits',
      'Advanced admin controls',
      'SSO integration',
      'Dedicated support',
      'Custom API limits'
    ],
    isPopular: false
  }
];

const aiFeatures = [
  {
    title: 'Smart Summarization',
    description: 'AI-powered note summarization for quick review',
    icon: <SmartToy />
  },
  {
    title: 'Topic Analysis',
    description: 'Automatic categorization and tagging of notes',
    icon: <Psychology />
  },
  {
    title: 'Content Enhancement',
    description: 'AI suggestions for better writing and organization',
    icon: <AutoAwesome />
  }
];

const integrations = [
  {
    title: 'Browser Extension',
    description: 'Save content directly from your browser',
    icon: <Extension />
  },
  {
    title: 'Cloud Storage',
    description: 'Sync with Google Drive, Dropbox, and more',
    icon: <Storage />
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Powerful shortcuts for quick note-taking',
    icon: <Keyboard />
  }
];

const faqs = [
  {
    question: 'How secure are my notes?',
    answer: 'Your notes are protected with end-to-end encryption. Only you and those you choose to share with can access them. We use industry-standard encryption protocols to ensure your data remains private.'
  },
  {
    question: 'Can I access my notes offline?',
    answer: 'Yes! Our desktop and mobile apps support offline access. Your notes sync automatically when you're back online.'
  },
  {
    question: 'What happens if I exceed my storage limit?',
    answer: 'You'll receive a notification when approaching your limit. You can either upgrade your plan or manage your storage by archiving or deleting unused notes.'
  },
  {
    question: 'How does the AI summarization work?',
    answer: 'Our AI analyzes your notes\' content and generates concise summaries while preserving key information. This feature is available on Pro and Enterprise plans.'
  },
  {
    question: 'Can I import notes from other apps?',
    answer: 'Yes, we support importing notes from Evernote, OneNote, and plain text files. Our import tool helps preserve your note formatting.'
  }
];

const blogPosts = [
  {
    title: 'Maximizing Productivity with AI Note-Taking',
    excerpt: 'Learn how AI-powered features can transform your note-taking workflow...',
    author: 'Sarah Johnson',
    date: 'March 15, 2024',
    readTime: '5 min read',
    image: '/blog/ai-notes.jpg'
  },
  {
    title: 'The Future of Collaborative Note-Taking',
    excerpt: 'Discover how real-time collaboration is changing the way teams work together...',
    author: 'Michael Chen',
    date: 'March 12, 2024',
    readTime: '4 min read',
    image: '/blog/collaboration.jpg'
  },
  {
    title: 'Security Best Practices for Note-Taking',
    excerpt: 'Essential tips to keep your digital notes secure and private...',
    author: 'Emily Davis',
    date: 'March 10, 2024',
    readTime: '6 min read',
    image: '/blog/security.jpg'
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

      {/* AI Features Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 600 }}
          >
            Powered by AI
          </Typography>
          <Grid container spacing={4}>
            {aiFeatures.map((feature, index) => (
              <Grid item xs={12} md={4} key={feature.title}>
                <MotionPaper
                  elevation={2}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{ p: 4, height: '100%', textAlign: 'center' }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom>
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
      </Box>

      {/* Integrations Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ mb: 6, fontWeight: 600 }}
        >
          Seamless Integrations
        </Typography>
        <Grid container spacing={4}>
          {integrations.map((integration, index) => (
            <Grid item xs={12} md={4} key={integration.title}>
              <MotionPaper
                elevation={2}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{ p: 4, height: '100%' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    mr: 2,
                    color: 'primary.main',
                    bgcolor: 'primary.light',
                    p: 1,
                    borderRadius: 2
                  }}>
                    {integration.icon}
                  </Box>
                  <Typography variant="h6">
                    {integration.title}
                  </Typography>
                </Box>
                <Typography color="text.secondary">
                  {integration.description}
                </Typography>
              </MotionPaper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 1, fontWeight: 600 }}
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            Choose the plan that works best for you
          </Typography>
          <Grid container spacing={4}>
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={4} key={plan.name}>
                <MotionCard
                  elevation={plan.isPopular ? 8 : 2}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{ 
                    p: 4,
                    height: '100%',
                    position: 'relative',
                    border: plan.isPopular ? 2 : 0,
                    borderColor: 'primary.main'
                  }}
                >
                  {plan.isPopular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        right: 24
                      }}
                    />
                  )}
                  <Typography variant="h5" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h3" component="span">
                      {plan.price}
                    </Typography>
                    <Typography variant="subtitle1" component="span" color="text.secondary">
                      /{plan.period}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 3 }} />
                  <List>
                    {plan.features.map((feature) => (
                      <ListItem key={feature} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Check color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    variant={plan.isPopular ? "contained" : "outlined"}
                    fullWidth
                    size="large"
                    sx={{ mt: 3 }}
                    component={Link}
                    href="/signup"
                  >
                    Get Started
                  </Button>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Platform Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 600 }}
          >
            Platform Features
          </Typography>
          <Grid container spacing={4}>
            {platformFeatures.map((feature, index) => (
              <Grid item xs={12} md={4} key={feature.title}>
                <MotionPaper
                  elevation={2}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{ p: 4, height: '100%', textAlign: 'center' }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom>
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
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 600 }}
          >
            What Our Users Say
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={testimonial.name}>
                <MotionPaper
                  elevation={2}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{ p: 4, height: '100%', textAlign: 'center' }}
                >
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mb: 2 }}>
                    {testimonial.avatar}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {testimonial.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {testimonial.role}
                  </Typography>
                  <Typography color="text.secondary">
                    {testimonial.content}
                  </Typography>
                </MotionPaper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ mb: 6, fontWeight: 600 }}
        >
          Frequently Asked Questions
        </Typography>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {faqs.map((faq, index) => (
            <MotionPaper
              key={index}
              component={Accordion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              sx={{ mb: 2 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ '&.Mui-expanded': { minHeight: 64 } }}
              >
                <Typography variant="h6">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </MotionPaper>
          ))}
        </Box>
      </Container>

      {/* Blog Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 6 
          }}>
            <Typography variant="h3" sx={{ fontWeight: 600 }}>
              Latest from Our Blog
            </Typography>
            <Button 
              variant="outlined" 
              component={Link} 
              href="/blog"
              endIcon={<ArrowForward />}
            >
              View All Posts
            </Button>
          </Box>
          <Grid container spacing={4}>
            {blogPosts.map((post, index) => (
              <Grid item xs={12} md={4} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{ height: '100%' }}
                >
                  <Box 
                    sx={{ 
                      height: 200, 
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      style={{ 
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Typography 
                      variant="h5" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 600,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {post.title}
                    </Typography>
                    <Typography 
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {post.excerpt}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24,
                            mr: 1,
                            bgcolor: 'primary.main'
                          }}
                        >
                          {post.author[0]}
                        </Avatar>
                        <Typography variant="caption">
                          {post.author}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {post.readTime}
                      </Typography>
                    </Box>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}