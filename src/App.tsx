import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Tag, 
  Plus, 
  X, 
  Edit, 
  Trash2, 
  AlertTriangle,
  ArrowUpDown,
  Filter
} from 'lucide-react';

// Define task interface
interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string | null;
  createdAt: string;
}

function App() {
  // State management
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCategory, setNewCategory] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Get unique categories from tasks
  const categories = ['all', ...new Set(tasks.map(task => task.category).filter(Boolean))];

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Check for upcoming due dates and show notifications
  useEffect(() => {
    const checkDueDates = () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      tasks.forEach(task => {
        if (task.dueDate && !task.completed) {
          const dueDate = new Date(task.dueDate);
          if (dueDate <= tomorrow && dueDate >= today) {
            // This would be where you'd show a notification in a real app
            console.log(`Task "${task.title}" is due soon!`);
          }
        }
      });
    };
    
    checkDueDates();
    const interval = setInterval(checkDueDates, 3600000); // Check every hour
    
    return () => clearInterval(interval);
  }, [tasks]);

  // Add a new task
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      description: newDescription,
      completed: false,
      priority: newPriority,
      category: newCategory,
      dueDate: newDueDate || null,
      createdAt: new Date().toISOString(),
    };
    
    setTasks([...tasks, task]);
    resetForm();
  };

  // Update an existing task
  const updateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !newTask.trim()) return;
    
    setTasks(tasks.map(task => 
      task.id === editingTask.id 
        ? {
            ...task,
            title: newTask,
            description: newDescription,
            priority: newPriority,
            category: newCategory,
            dueDate: newDueDate || null,
          }
        : task
    ));
    
    resetForm();
  };

  // Toggle task completion status
  const toggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Start editing a task
  const startEdit = (task: Task) => {
    setEditingTask(task);
    setNewTask(task.title);
    setNewDescription(task.description);
    setNewPriority(task.priority);
    setNewCategory(task.category);
    setNewDueDate(task.dueDate || '');
    setIsFormOpen(true);
  };

  // Reset form fields
  const resetForm = () => {
    setNewTask('');
    setNewDescription('');
    setNewPriority('medium');
    setNewCategory('');
    setNewDueDate('');
    setIsFormOpen(false);
    setEditingTask(null);
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter(task => {
      // Apply completion filter
      if (filter === 'active' && task.completed) return false;
      if (filter === 'completed' && !task.completed) return false;
      
      // Apply category filter
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
      
      // Apply priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected criteria
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return sortDirection === 'asc' ? 1 : -1;
        if (!b.dueDate) return sortDirection === 'asc' ? -1 : 1;
        return sortDirection === 'asc' 
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      
      if (sortBy === 'priority') {
        const priorityValues = { high: 3, medium: 2, low: 1 };
        return sortDirection === 'asc'
          ? priorityValues[a.priority] - priorityValues[b.priority]
          : priorityValues[b.priority] - priorityValues[a.priority];
      }
      
      // Default sort by creation date
      return sortDirection === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Check if a task is due soon (within 24 hours)
  const isDueSoon = (dateString: string | null) => {
    if (!dateString) return false;
    
    const dueDate = new Date(dateString);
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return hoursDiff > 0 && hoursDiff <= 24;
  };

  // Check if a task is overdue
  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    
    const dueDate = new Date(dateString);
    const now = new Date();
    
    return dueDate < now;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-800 mb-2">Smart Task Manager</h1>
          <p className="text-gray-600">Organize your tasks efficiently and manage your time effectively</p>
        </header>

        {/* Task Form */}
        <div className="mb-8">
          {!isFormOpen ? (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex items-center justify-center w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add New Task
            </button>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingTask ? 'Edit Task' : 'Add New Task'}
                </h2>
                <button 
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={editingTask ? updateTask : addTask}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="What needs to be done?"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add details about this task..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      id="category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Work, Personal, Shopping"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    {editingTask ? 'Update Task' : 'Add Task'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-md ${filter === 'all' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-3 py-1 rounded-md ${filter === 'active' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1 rounded-md ${filter === 'completed' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                >
                  Completed
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Priority
              </label>
              <select
                id="priorityFilter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
            <div className="flex items-center mr-4">
              <ArrowUpDown size={16} className="text-gray-500 mr-1" />
              <label htmlFor="sortBy" className="text-sm font-medium text-gray-700 mr-2">
                Sort by:
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'createdAt')}
                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredAndSortedTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg mb-2">No tasks found</p>
              <p className="text-sm">Add a new task or adjust your filters</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAndSortedTasks.map((task) => (
                <li key={task.id} className={`p-4 hover:bg-gray-50 ${task.completed ? 'bg-gray-50' : ''}`}>
                  <div className="flex items-start">
                    <button
                      onClick={() => toggleComplete(task.id)}
                      className="mt-1 mr-3 flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        {task.priority && (
                          <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)} bg-opacity-10`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className={`text-sm mb-2 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center text-xs text-gray-500 mt-2">
                        {task.category && (
                          <div className="flex items-center mr-3">
                            <Tag size={14} className="mr-1" />
                            <span>{task.category}</span>
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <div className={`flex items-center mr-3 ${
                            task.completed ? 'text-gray-400' : 
                            isOverdue(task.dueDate) ? 'text-red-600' : 
                            isDueSoon(task.dueDate) ? 'text-yellow-600' : 
                            'text-gray-500'
                          }`}>
                            {isOverdue(task.dueDate) && !task.completed ? (
                              <AlertTriangle size={14} className="mr-1" />
                            ) : isDueSoon(task.dueDate) && !task.completed ? (
                              <Clock size={14} className="mr-1" />
                            ) : (
                              <Calendar size={14} className="mr-1" />
                            )}
                            <span>
                              {isOverdue(task.dueDate) && !task.completed ? 'Overdue: ' : 
                               isDueSoon(task.dueDate) && !task.completed ? 'Due soon: ' : 
                               'Due: '}
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0 flex">
                      <button
                        onClick={() => startEdit(task)}
                        className="mr-2 text-gray-400 hover:text-gray-600"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Task Summary */}
        <div className="mt-6 text-sm text-gray-600 flex justify-between items-center">
          <div>
            <span className="font-medium">{tasks.filter(t => !t.completed).length}</span> tasks left
          </div>
          {tasks.length > 0 && (
            <button
              onClick={() => setTasks(tasks.filter(t => !t.completed))}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Clear completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;