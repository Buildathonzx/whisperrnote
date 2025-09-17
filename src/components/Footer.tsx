"use client";

import { Box, Container, Typography, IconButton, Stack, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import { GitHub, Twitter, LinkedIn, Facebook } from '@mui/icons-material';
import { motion } from 'framer-motion';

const footerLinks = {
  product: [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Security', href: '/security' },
    { name: 'Enterprise', href: '/enterprise' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '/api' },
    { name: 'Status', href: '/status' },
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

export default function Footer() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
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
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 4,
            }}
          >
            {Object.entries(footerLinks).map(([category, links]) => (
              <Box key={category}>
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
              </Box>
            ))}
          </Box>

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
              <IconButton color="inherit" size="small" component={motion.button} whileHover={{ scale: 1.1 }}>
                <GitHub />
              </IconButton>
              <IconButton color="inherit" size="small" component={motion.button} whileHover={{ scale: 1.1 }}>
                <Twitter />
              </IconButton>
              <IconButton color="inherit" size="small" component={motion.button} whileHover={{ scale: 1.1 }}>
                <LinkedIn />
              </IconButton>
              <IconButton color="inherit" size="small" component={motion.button} whileHover={{ scale: 1.1 }}>
                <Facebook />
              </IconButton>
            </Stack>
          </Box>
        </Container>
      </Box>
    </motion.div>
  );
}
