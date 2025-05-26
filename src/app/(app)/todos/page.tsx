"use client";

import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Fab, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Chip, Stack, Typography, Box, Tab, Tabs,
  FormControlLabel, Switch, Select, FormControl, InputLabel, IconButton,
  Card, CardContent, Tooltip, Divider
} from '@mui/material';
import {
  Add, FilterList, Sort, ViewModule, ViewList, Search, CalendarToday,
  Flag, CheckCircle, AccessTime, RadioButtonUnchecked, Archive
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../../lib/auth';
import { listToDos, createToDo, updateToDo, deleteToDo } from '../../../lib/notes';
import { ToDo } from '../../../types/notes';
import ToDoComponent from './ToDo';

const MotionContainer = motion(Container);
const MotionGrid = motion(Grid);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`todo-tabpanel-${index}`}
      aria-labelledby={`todo-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ToDosPage() {
  const [todos, setTodos] = useState<ToDo[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    status: 'pending' as const,
    due_date: '',
    reminder: '',
    tags: [] as string[],
    is_encrypted: true,
    shared_with: [] as string[],
    linked_notes: [] as string[],
    extension_data: {},
    owner_id: ''
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    tags: [] as string[],
    due_date: ''
  });
  const [sortBy, setSortBy] = useState('updated_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const initUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.$id);
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error getting user:', error);
        router.push('/auth/login');
      }
    };

    initUser();
  }, [router]);

  useEffect(() => {
    const loadTodos = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const todosData = await listToDos(userId, filters.status);
        setTodos(todosData);
      } catch (error) {
        console.error('Error loading todos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, [userId, filters]);

  const handleCreateTodo = async () => {
    if (!userId || !newTodo.title.trim()) return;

    try {
      setCreating(true);
      await createToDo({
        ...newTodo,
        owner_id: userId
      });
      
      // Reload todos
      const todosData = await listToDos(userId, filters.status);
      setTodos(todosData);
      
      // Reset form
      setNewTodo({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        reminder: '',
        tags: [],
        is_encrypted: true,
        shared_with: [],
        linked_notes: [],
        extension_data: {},
        owner_id: ''
      });
      setOpen(false);
    } catch (error) {
      console.error('Error creating todo:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await deleteToDo(todoId);
      setTodos(todos.filter(todo => todo._id !== todoId));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleToggleStatus = async (todoId: string, status: ToDo['status']) => {
    try {
      await updateToDo(todoId, { status });
      setTodos(todos.map(todo => 
        todo._id === todoId ? { ...todo, status } : todo
      ));
    } catch (error) {
      console.error('Error updating todo status:', error);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (searchTerm && !todo.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filters.priority && todo.priority !== filters.priority) {
      return false;
    }
    if (filters.tags.length > 0 && !filters.tags.some(tag => todo.tags.includes(tag))) {
      return false;
    }
    return true;
  });

  const todosByStatus = {
    pending: filteredTodos.filter(todo => todo.status === 'pending'),
    in_progress: filteredTodos.filter(todo => todo.status === 'in_progress'),
    completed: filteredTodos.filter(todo => todo.status === 'completed'),
    cancelled: filteredTodos.filter(todo => todo.status === 'cancelled')
  };

  const getTabLabel = (status: string, count: number) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {status === 'pending' && <RadioButtonUnchecked fontSize="small" />}
      {status === 'in_progress' && <AccessTime fontSize="small" />}
      {status === 'completed' && <CheckCircle fontSize="small" />}
      {status === 'cancelled' && <Archive fontSize="small" />}
      <Typography variant="button">
        {status.replace('_', ' ')} ({count})
      </Typography>
    </Box>
  );

  return (
    <MotionContainer
      maxWidth="xl"
      sx={{ py: 4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          My ToDos
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search todos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority}
              label="Priority"
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>

          <IconButton onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <ViewList /> : <ViewModule />}
          </IconButton>
        </Stack>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
          <Tab label={getTabLabel('pending', todosByStatus.pending.length)} />
          <Tab label={getTabLabel('in_progress', todosByStatus.in_progress.length)} />
          <Tab label={getTabLabel('completed', todosByStatus.completed.length)} />
          <Tab label={getTabLabel('cancelled', todosByStatus.cancelled.length)} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <MotionGrid container spacing={3}>
          <AnimatePresence>
            {todosByStatus.pending.map((todo) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={todo._id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <ToDoComponent
                    todo={todo}
                    onDelete={handleDeleteTodo}
                    onToggleStatus={handleToggleStatus}
                  />
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </MotionGrid>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <MotionGrid container spacing={3}>
          <AnimatePresence>
            {todosByStatus.in_progress.map((todo) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={todo._id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <ToDoComponent
                    todo={todo}
                    onDelete={handleDeleteTodo}
                    onToggleStatus={handleToggleStatus}
                  />
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </MotionGrid>
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <MotionGrid container spacing={3}>
          <AnimatePresence>
            {todosByStatus.completed.map((todo) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={todo._id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <ToDoComponent
                    todo={todo}
                    onDelete={handleDeleteTodo}
                    onToggleStatus={handleToggleStatus}
                  />
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </MotionGrid>
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <MotionGrid container spacing={3}>
          <AnimatePresence>
            {todosByStatus.cancelled.map((todo) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={todo._id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <ToDoComponent
                    todo={todo}
                    onDelete={handleDeleteTodo}
                    onToggleStatus={handleToggleStatus}
                  />
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </MotionGrid>
      </TabPanel>

      {/* FAB */}
      <Fab
        color="primary"
        aria-label="add todo"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        }}
      >
        <Add />
      </Fab>

      {/* Create Todo Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New ToDo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newTodo.description}
            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTodo.priority}
                label="Priority"
                onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as any })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>

            <TextField
              type="datetime-local"
              label="Due Date"
              fullWidth
              value={newTodo.due_date}
              onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <TextField
            type="datetime-local"
            label="Reminder"
            fullWidth
            value={newTodo.reminder}
            onChange={(e) => setNewTodo({ ...newTodo, reminder: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={newTodo.is_encrypted}
                onChange={(e) => setNewTodo({ ...newTodo, is_encrypted: e.target.checked })}
              />
            }
            label="Encrypt this todo"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateTodo} 
            variant="contained"
            disabled={creating || !newTodo.title.trim()}
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </MotionContainer>
  );
}