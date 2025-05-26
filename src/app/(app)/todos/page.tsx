"use client";

import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Typography, Box, Fab, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Stack, Chip, Card, CardContent, CardActions, IconButton, LinearProgress
} from '@mui/material';
import { 
  Add, Edit, Delete, CheckCircle, Schedule, Flag, Share, Archive,
  PriorityHigh, CalendarToday, Repeat
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { account } from '@/lib/appwrite';
import { ToDo, RecurrencePattern } from '@/types/notes';
import { createToDo, updateToDo, listToDos } from '@/lib/notes';

const MotionCard = motion(Card);

const priorityColors = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
  urgent: '#9C27B0'
};

const statusColors = {
  pending: '#757575',
  in_progress: '#2196F3',
  completed: '#4CAF50',
  cancelled: '#F44336'
};

interface TodoProps {
  todo: ToDo;
  onUpdate: (todoId: string, data: Partial<ToDo>) => void;
  onDelete: (todoId: string) => void;
}

function TodoCard({ todo, onUpdate, onDelete }: TodoProps) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleStatus = () => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    onUpdate(todo._id, { status: newStatus });
  };

  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && todo.status !== 'completed';

  return (
    <MotionCard
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: `2px solid ${priorityColors[todo.priority]}40`,
        borderLeft: `6px solid ${priorityColors[todo.priority]}`,
        opacity: todo.status === 'completed' ? 0.7 : 1
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              textDecoration: todo.status === 'completed' ? 'line-through' : 'none',
              color: todo.status === 'completed' ? 'text.secondary' : 'text.primary',
              pr: 1
            }}
          >
            {todo.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              size="small"
              label={todo.priority}
              sx={{
                backgroundColor: priorityColors[todo.priority],
                color: 'white',
                fontWeight: 'bold'
              }}
            />
            {isOverdue && (
              <Chip
                size="small"
                label="Overdue"
                color="error"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {todo.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 2 }}
          >
            {todo.description}
          </Typography>
        )}

        {/* Due Date */}
        {todo.due_date && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CalendarToday sx={{ fontSize: 16, color: isOverdue ? 'error.main' : 'text.secondary' }} />
            <Typography 
              variant="caption" 
              color={isOverdue ? 'error.main' : 'text.secondary'}
            >
              Due: {formatDate(todo.due_date)}
            </Typography>
          </Box>
        )}

        {/* Recurrence */}
        {todo.recurrence && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Repeat sx={{ fontSize: 16, color: 'info.main' }} />
            <Typography variant="caption" color="info.main">
              Repeats {todo.recurrence.type}
            </Typography>
          </Box>
        )}

        {/* Tags */}
        {todo.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
            {todo.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
            {todo.tags.length > 3 && (
              <Chip
                label={`+${todo.tags.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        )}

        {/* Status Progress */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Status
            </Typography>
            <Chip
              size="small"
              label={todo.status.replace('_', ' ')}
              sx={{
                backgroundColor: statusColors[todo.status],
                color: 'white',
                fontSize: '0.7rem'
              }}
            />
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={todo.status === 'completed' ? 100 : todo.status === 'in_progress' ? 50 : 0}
            sx={{ height: 4, borderRadius: 2 }}
            color={todo.status === 'completed' ? 'success' : todo.status === 'in_progress' ? 'info' : 'primary'}
          />
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box>
          <IconButton 
            size="small" 
            onClick={toggleStatus}
            color={todo.status === 'completed' ? 'success' : 'default'}
          >
            <CheckCircle />
          </IconButton>
          
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            <Edit />
          </IconButton>
        </Box>

        <Box>
          <IconButton size="small" color="error" onClick={() => onDelete(todo._id)}>
            <Delete />
          </IconButton>
        </Box>
      </CardActions>
    </MotionCard>
  );
}

export default function TodosPage() {
  const [todos, setTodos] = useState<ToDo[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    due_date: null as Date | null,
    reminder: null as Date | null,
    priority: 'medium' as const,
    tags: [] as string[],
    is_encrypted: false,
    recurrence: null as RecurrencePattern | null
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    const fetchUserAndTodos = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);
        
        const todosData = await listToDos(user.$id);
        setTodos((todosData.documents || []).map((doc: any) => ({
          _id: doc.$id,
          owner_id: doc.owner_id,
          title: doc.title,
          description: doc.description,
          due_date: doc.due_date,
          reminder: doc.reminder,
          priority: doc.priority || 'medium',
          status: doc.status || 'pending',
          tags: doc.tags || [],
          created_at: doc.created_at,
          updated_at: doc.updated_at,
          is_encrypted: doc.is_encrypted || false,
          shared_with: doc.shared_with || [],
          recurrence: doc.recurrence,
          linked_notes: doc.linked_notes || [],
          extension_data: doc.extension_data || {}
        })));
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserAndTodos();
    } else {
      account.get()
        .then(user => setUserId(user.$id))
        .catch(() => {});
    }
  }, [userId]);

  const handleCreateTodo = async () => {
    if (!userId || !newTodo.title.trim()) return;
    setCreating(true);
    try {
      const doc = await createToDo({
        ...newTodo,
        owner_id: userId,
        status: 'pending',
        shared_with: [],
        linked_notes: [],
        extension_data: {},
        due_date: newTodo.due_date?.toISOString(),
        reminder: newTodo.reminder?.toISOString()
      });
      
      if (doc) {
        const todo: ToDo = {
          _id: doc.$id,
          owner_id: userId,
          title: newTodo.title,
          description: newTodo.description,
          due_date: newTodo.due_date?.toISOString(),
          reminder: newTodo.reminder?.toISOString(),
          priority: newTodo.priority,
          status: 'pending',
          tags: newTodo.tags,
          created_at: doc.created_at,
          updated_at: doc.updated_at,
          is_encrypted: newTodo.is_encrypted,
          shared_with: [],
          recurrence: newTodo.recurrence,
          linked_notes: [],
          extension_data: {}
        };
        setTodos(prev => [todo, ...prev]);
        setOpen(false);
        setNewTodo({
          title: '',
          description: '',
          due_date: null,
          reminder: null,
          priority: 'medium',
          tags: [],
          is_encrypted: false,
          recurrence: null
        });
      }
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTodo = async (todoId: string, data: Partial<ToDo>) => {
    try {
      await updateToDo(todoId, data);
      setTodos(prev => prev.map(todo => 
        todo._id === todoId ? { ...todo, ...data } : todo
      ));
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await updateToDo(todoId, { status: 'cancelled' });
      setTodos(prev => prev.filter(todo => todo._id !== todoId));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true;
    return todo.status === filter;
  });

  const todoStats = {
    total: todos.length,
    completed: todos.filter(t => t.status === 'completed').length,
    pending: todos.filter(t => t.status === 'pending').length,
    overdue: todos.filter(t => 
      t.due_date && 
      new Date(t.due_date) < new Date() && 
      t.status !== 'completed'
    ).length
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading todos...</Typography>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #F44336 30%, #9C27B0 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Your Tasks
          </Typography>

          {/* Stats */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Chip label={`${todoStats.total} Total`} variant="outlined" />
            <Chip label={`${todoStats.completed} Completed`} color="success" />
            <Chip label={`${todoStats.pending} Pending`} color="info" />
            {todoStats.overdue > 0 && (
              <Chip label={`${todoStats.overdue} Overdue`} color="error" />
            )}
          </Stack>

          {/* Filter Buttons */}
          <Stack direction="row" spacing={1}>
            {(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* Todos Grid */}
        <Grid container spacing={3}>
          <AnimatePresence>
            {filteredTodos.map((todo, index) => (
              <Grid item xs={12} sm={6} md={4} key={todo._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <TodoCard 
                    todo={todo}
                    onUpdate={handleUpdateTodo}
                    onDelete={handleDeleteTodo}
                  />
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>

        {/* Floating Action Button */}
        <Fab 
          color="primary" 
          aria-label="add todo" 
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24,
            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.5)'
          }}
          component={motion.button}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(true)}
        >
          <Add />
        </Fab>

        {/* Create Todo Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Title"
                fullWidth
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              />
              
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              />

              <Stack direction="row" spacing={2}>
                <DateTimePicker
                  label="Due Date"
                  value={newTodo.due_date}
                  onChange={(date) => setNewTodo({ ...newTodo, due_date: date })}
                  sx={{ flex: 1 }}
                />
                
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newTodo.priority}
                    label="Priority"
                    onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as any })}
                  >
                    <MenuItem value="low">🟢 Low</MenuItem>
                    <MenuItem value="medium">🟡 Medium</MenuItem>
                    <MenuItem value="high">🔴 High</MenuItem>
                    <MenuItem value="urgent">🟣 Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateTodo} 
              variant="contained" 
              disabled={creating || !newTodo.title.trim()}
            >
              {creating ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}