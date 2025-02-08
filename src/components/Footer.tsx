"use client";

import { Box, Container, Grid, Typography, IconButton, Stack, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import { GitHub, Twitter, LinkedIn, Facebook } from '@mui/icons-material';

const Footer = () => {
  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Security', href: '/security' },
      { name: 'Enterprise', href: '/enterprise' },
    ],
    resources: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Status', href: '/status' },
      { name: 'Blog', href: '/blog' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
    download: [
      { name: 'iOS App', href: '#' },
      { name: 'Android App', href: '#' },
      { name: 'Desktop App', href: '#' },
      { name: 'Browser Extension', href: '#' },
    ],
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {Object.entries(footerLinks).map(([category, links]) => (
            <Grid item xs={12} sm={6} md={3} key={category}>
              <Typography
                variant="subtitle1"
                color="text.primary"
                gutterBottom
                sx={{ fontWeight: 600, textTransform: 'capitalize' }}
              >
                {category}
              </Typography>
              <Stack spacing={1}>
                {links.map((link) => (
                  <MuiLink
                    key={link.name}
                    href={link.href}
                    component={Link}
                    color="text.secondary"
                    sx={{
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {link.name}
                  </MuiLink>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} WhisperNote. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2}>
            <IconButton color="inherit" size="small">
              <GitHub />
            </IconButton>
            <IconButton color="inherit" size="small">
              <Twitter />
            </IconButton>
            <IconButton color="inherit" size="small">
              <LinkedIn />
            </IconButton>
            <IconButton color="inherit" size="small">
              <Facebook />
            </IconButton>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;