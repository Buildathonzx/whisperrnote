"use client";

import { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  FormatSize,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatIndentDecrease,
  FormatIndentIncrease,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function NoteEditor({ content, onChange }: NoteEditorProps) {
  const [formats, setFormats] = useState<string[]>([]);
  const [headingMenuAnchor, setHeadingMenuAnchor] = useState<null | HTMLElement>(null);

  const handleFormat = useCallback(
    (event: React.MouseEvent<HTMLElement>, newFormats: string[]) => {
      setFormats(newFormats);
    },
    []
  );

  const handleHeadingMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setHeadingMenuAnchor(event.currentTarget);
  };

  const handleHeadingMenuClose = () => {
    setHeadingMenuAnchor(null);
  };

  return (
    <MotionPaper
      elevation={2}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ p: 2 }}
    >
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <ToggleButtonGroup
          value={formats}
          onChange={handleFormat}
          aria-label="text formatting"
          size="small"
        >
          <ToggleButton value="bold" aria-label="bold">
            <Tooltip title="Bold (⌘B)">
              <FormatBold />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="italic" aria-label="italic">
            <Tooltip title="Italic (⌘I)">
              <FormatItalic />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="underlined" aria-label="underlined">
            <Tooltip title="Underline (⌘U)">
              <FormatUnderlined />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

        <ToggleButtonGroup
          value={formats}
          onChange={handleFormat}
          aria-label="text alignment"
          size="small"
        >
          <ToggleButton value="left" aria-label="left aligned">
            <Tooltip title="Align Left">
              <FormatAlignLeft />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="center" aria-label="centered">
            <Tooltip title="Align Center">
              <FormatAlignCenter />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="right" aria-label="right aligned">
            <Tooltip title="Align Right">
              <FormatAlignRight />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

        <Box>
          <Tooltip title="Heading">
            <IconButton
              size="small"
              onClick={handleHeadingMenuOpen}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
            >
              <FormatSize />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={headingMenuAnchor}
            open={Boolean(headingMenuAnchor)}
            onClose={handleHeadingMenuClose}
          >
            {['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].map((heading) => (
              <MenuItem
                key={heading}
                onClick={handleHeadingMenuClose}
                sx={{ minWidth: 120 }}
              >
                <ListItemText 
                  primary={heading}
                  primaryTypographyProps={{
                    variant: heading.toLowerCase() as any,
                    sx: { fontWeight: 600 }
                  }}
                />
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <ToggleButtonGroup
          value={formats}
          onChange={handleFormat}
          aria-label="list formatting"
          size="small"
        >
          <ToggleButton value="bullet" aria-label="bullet list">
            <Tooltip title="Bullet List (⌘⇧8)">
              <FormatListBulleted />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="number" aria-label="numbered list">
            <Tooltip title="Numbered List (⌘⇧7)">
              <FormatListNumbered />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

        <ToggleButtonGroup
          value={formats}
          onChange={handleFormat}
          aria-label="text indentation"
          size="small"
        >
          <ToggleButton value="outdent" aria-label="decrease indent">
            <Tooltip title="Decrease Indent (⌘[)">
              <FormatIndentDecrease />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="indent" aria-label="increase indent">
            <Tooltip title="Increase Indent (⌘])">
              <FormatIndentIncrease />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

        <ToggleButtonGroup
          value={formats}
          onChange={handleFormat}
          aria-label="content formatting"
          size="small"
        >
          <ToggleButton value="quote" aria-label="block quote">
            <Tooltip title="Quote">
              <FormatQuote />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="code" aria-label="code block">
            <Tooltip title="Code Block">
              <Code />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

        <ToggleButtonGroup
          value={formats}
          onChange={handleFormat}
          aria-label="insert content"
          size="small"
        >
          <ToggleButton value="link" aria-label="insert link">
            <Tooltip title="Insert Link (⌘K)">
              <LinkIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="image" aria-label="insert image">
            <Tooltip title="Insert Image">
              <ImageIcon />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box
        component="div"
        role="textbox"
        contentEditable
        sx={{
          minHeight: 300,
          p: 2,
          outline: 'none',
          '&:focus': {
            outline: 'none',
          },
          lineHeight: 1.8,
          fontSize: '1rem',
        }}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </MotionPaper>
  );
}
