import { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Flag, ChevronDown, ChevronUp, Calendar as CalendarIcon, LayoutDashboard, Search, X, ArrowUpDown, Trash2, Plus, Check, Minus, Tag, AlertCircle, Clock, CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'not_started' | 'active' | 'overdue' | 'completed';
  is_completed?: boolean;
  priority: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  start_date?: string;
  end_date?: string;
  board_id: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  board: {
    id: string;
    title: string;
  };
  tags?: Tag[];
  subtasks?: Task[];
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TaskItemProps {
  task: Task;
  onClick: () => void;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  onMarkAsCompleted: (taskId: string) => void;
}

const COLOR_PALETTE = [
  '#FFFFFF', '#000000', '#FF6900', '#FCB900', '#7BDCB5',
  '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C', '#00D084'
];

const priorityOptions = [
  { value: 'low', label: 'Низький' },
  { value: 'medium', label: 'Середній' },
  { value: 'high', label: 'Високий' }
];

const riskOptions = [
  { value: 'low', label: 'Низький' },
  { value: 'medium', label: 'Середній' },
  { value: 'high', label: 'Високий' }
];

const statusOptions = [
  { value: 'all', label: 'Усі' },
  { value: 'not_started', label: 'Не розпочаті' },
  { value: 'active', label: 'Активні' },
  { value: 'overdue', label: 'Прострочені' },
  { value: 'completed', label: 'Завершені' }
];

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-400';
    case 'medium': return 'text-yellow-400';
    case 'low': return 'text-green-400';
    default: return 'text-gray-400';
  }
};

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return 'Високий';
    case 'medium': return 'Середній';
    case 'low': return 'Низький';
    default: return 'Без пріоритету';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500/20 text-green-400';
    case 'active': return 'bg-blue-500/20 text-blue-400';
    case 'overdue': return 'bg-red-500/20 text-red-400';
    case 'not_started': return 'bg-gray-500/20 text-gray-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return 'Завершене';
    case 'active': return 'Активне';
    case 'overdue': return 'Прострочене';
    case 'not_started': return 'Не розпочато';
    default: return status;
  }
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'high': return 'text-red-400';
    case 'medium': return 'text-yellow-400';
    case 'low': return 'text-green-400';
    default: return 'text-gray-400';
  }
};

const getRiskText = (risk: string) => {
  switch (risk) {
    case 'high': return 'Високий';
    case 'medium': return 'Середній';
    case 'low': return 'Низький';
    default: return 'Без ризику';
  }
};

const TagBadge = ({ tag, onRemove }: { tag: Tag, onRemove?: () => void }) => (
  <Badge className="flex items-center pr-1" style={{ backgroundColor: tag.color }}>
    #{tag.name}
    {onRemove && (
      <button type="button" onClick={onRemove} className="ml-1">
        <Minus className="h-3 w-3" />
      </button>
    )}
  </Badge>
);

const PriorityBadge = ({ priority }: { priority: 'low' | 'medium' | 'high' }) => (
  <div className={`flex items-center gap-1 ${getPriorityColor(priority)}`}>
    <Flag className="h-4 w-4" />
    <span className="text-sm">{getPriorityText(priority)}</span>
  </div>
);

const RiskBadge = ({ risk }: { risk: 'low' | 'medium' | 'high' }) => (
  <div className={`flex items-center gap-1 ${getRiskColor(risk)}`}>
    <AlertCircle className="h-4 w-4" />
    <span className="text-sm">{getRiskText(risk)}</span>
  </div>
);

const DateRangeDisplay = ({ start, end }: { start?: string, end?: string }) => {
  if (!start && !end) return null;

  return (
    <div className="flex items-center gap-2">
      <CalendarIcon className="h-4 w-4 text-gray-400" />
      <span className="text-sm text-gray-300">
        {start ? format(new Date(start), 'dd.MM.yyyy') : '??.??.????'}
        {' - '}
        {end ? format(new Date(end), 'dd.MM.yyyy') : '??.??.????'}
      </span>
    </div>
  );
};

const TaskItem = ({ 
  task, 
  onClick, 
  onToggleExpand, 
  isExpanded,
  onMarkAsCompleted
}: TaskItemProps) => (
  <div className="space-y-2">
    <Card 
      className="border-l-4 hover:shadow-md transition-shadow bg-white/5 backdrop-blur-sm border-white/10 cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
        <div className="flex items-center gap-2 flex-wrap w-full">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsCompleted(task.id);
            }}
            className="flex items-center justify-center"
          >
            {task.status === 'completed' ? (
              <CheckCircle className="text-green-500 w-6 h-6 hover:text-green-400" />
            ) : (
              <Circle className="text-gray-400 hover:text-green-500 w-6 h-6" />
            )}
          </button>
          <CardTitle className="text-xl font-semibold text-white break-words overflow-hidden text-ellipsis max-w-full">
            {task.title}
          </CardTitle>
        </div>
        {task.subtasks && task.subtasks.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand?.();
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="ml-1">{task.subtasks.length} підзавдань</span>
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="px-4">
        {task.description && (
          <p className="text-base text-gray-300 mb-3 line-clamp-2 break-words">
            {task.description}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {(task.start_date || task.end_date) && (
            <DateRangeDisplay start={task.start_date} end={task.end_date} />
          )}
          
          <Badge className={getStatusColor(task.status)}>
            {getStatusText(task.status)}
          </Badge>
          
          <PriorityBadge priority={task.priority} />
          <RiskBadge risk={task.risk} />
          
          {task.tags?.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function Tasks({ tasks, filters = {}, availableTags = [] }: { 
  tasks: { data: Task[] }, 
  filters: any, 
  availableTags: Tag[] 
}) {
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');
  const [riskFilter, setRiskFilter] = useState(filters.risk || 'all');
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [sortField, setSortField] = useState(filters.sort_field || 'created_at');
  const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');
  const [isSearching, setIsSearching] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(COLOR_PALETTE[2]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Завдання',
      href: '/tasks',
    },
  ];

  const markAsCompleted = async (taskId: string) => {
    try {

        const task = tasks.data.find(t => t.id === taskId);
        if (!task && task.status === 'completed') return;

      await router.post(`/tasks/${taskId}/complete`);
      router.reload();
    } catch (error) {
      console.error('Помилка при оновленні статусу завдання:', error);
    }
  };

  const groupedTasks = useMemo(() => {
    return tasks.data.reduce((acc: Record<string, { board: { id: string; title: string }, tasks: Task[] }>, task: Task) => {
      if (!acc[task.board_id]) {
        acc[task.board_id] = {
          board: task.board,
          tasks: []
        };
      }
      
      if (!task.parent_id) {
        acc[task.board_id].tasks.push({
          ...task,
          subtasks: tasks.data.filter((t: Task) => t.parent_id === task.id)
        });
      }
      
      return acc;
    }, {});
  }, [tasks.data]);

  const sortTasks = useCallback((tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      if (sortField === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      }
      if (sortField === 'start_date') {
        const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
        const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortField === 'end_date') {
        const dateA = a.end_date ? new Date(a.end_date).getTime() : 0;
        const dateB = b.end_date ? new Date(b.end_date).getTime() : 0;
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [sortField, sortDirection]);

  const filteredGroups = useMemo(() => {
    return Object.values(groupedTasks)
      .map((group) => ({
        ...group,
        tasks: sortTasks(group.tasks.filter((task) => {
          const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
          const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
          const matchesRisk = riskFilter === 'all' || task.risk === riskFilter;
          const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              task.description?.toLowerCase().includes(searchQuery.toLowerCase());
          
          return matchesStatus && matchesPriority && matchesRisk && matchesSearch;
        }))
      }))
      .filter((group) => group.tasks.length > 0);
  }, [groupedTasks, sortTasks, statusFilter, priorityFilter, riskFilter, searchQuery]);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (priorityFilter !== 'all') params.append('priority', priorityFilter);
    if (riskFilter !== 'all') params.append('risk', riskFilter);
    params.append('sort_field', sortField);
    params.append('sort_direction', sortDirection);

    router.get(`/tasks?${params.toString()}`, {}, {
      preserveState: true,
      replace: true,
    });
    setIsSearching(false);
  }, [searchQuery, statusFilter, priorityFilter, riskFilter, sortField, sortDirection]);

  useEffect(() => {
    if (isSearching) {
      const timer = setTimeout(updateUrl, 500);
      return () => clearTimeout(timer);
    }
  }, [isSearching, updateUrl]);

  const handleTaskClick = (task: Task) => {
    setCurrentTask(task);
    setSelectedTags(task.tags?.map(tag => tag.id) || []);
    setIsEditModalOpen(true);
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleTaskUpdate = (field: string, value: any) => {
    if (!currentTask) return;
    setCurrentTask(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date || !currentTask) return;
    const newDate = new Date(date);
    if (currentTask.start_date) {
      const prevDate = new Date(currentTask.start_date);
      newDate.setHours(prevDate.getHours());
      newDate.setMinutes(prevDate.getMinutes());
    }
    handleTaskUpdate('start_date', newDate.toISOString());
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date || !currentTask) return;
    const newDate = new Date(date);
    if (currentTask.end_date) {
      const prevDate = new Date(currentTask.end_date);
      newDate.setHours(prevDate.getHours());
      newDate.setMinutes(prevDate.getMinutes());
    }
    handleTaskUpdate('end_date', newDate.toISOString());
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setIsCreatingTag(true);
    
    try {
      await router.post('/tags', {
        name: newTagName,
        color: newTagColor
      });
      
      setNewTagName('');
      setTagSearch('');
      router.reload({ only: ['availableTags'] });
    } finally {
      setIsCreatingTag(false);
    }
  };

  const updateTask = async () => {
    if (!currentTask) return;

    try {
      await router.put(`/tasks/${currentTask.id}`, {
        title: currentTask.title,
        description: currentTask.description,
        start_date: currentTask.start_date,
        end_date: currentTask.end_date,
        priority: currentTask.priority,
        risk: currentTask.risk,
        tags: selectedTags
      });
      
      setIsEditModalOpen(false);
      router.reload({ only: ['tasks'] });
    } catch (error) {
      console.error('Помилка при оновленні завдання:', error);
    }
  };

  const deleteTask = async () => {
    if (!currentTask) return;

    try {
      await router.delete(`/tasks/${currentTask.id}`);
      setIsEditModalOpen(false);
      router.reload({ only: ['tasks'] });
    } catch (error) {
      console.error('Помилка при видаленні завдання:', error);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setRiskFilter('all');
    setIsSearching(true);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Мої завдання" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-white">Мої завдання</h1>
          <Link href="/boards">
            <Button variant="outline" className=" hover:bg-white/10 text-white border-white/10">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Перейти до дошок
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Пошук завдань..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearching(true);
              }}
              className="border-white/10 text-white placeholder-gray-400 focus:border-blue-400 pl-10"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setIsSearching(true);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select 
            value={statusFilter} 
            onValueChange={(value) => {
              setStatusFilter(value);
              setIsSearching(true);
            }}
          >
            <SelectTrigger className="border-white/10 text-white w-[140px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent className="border-white/10 text-white">
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={priorityFilter} 
            onValueChange={(value) => {
              setPriorityFilter(value);
              setIsSearching(true);
            }}
          >
            <SelectTrigger className="border-white/10 text-white w-[140px]">
              <SelectValue placeholder="Пріоритет" />
            </SelectTrigger>
            <SelectContent className="border-white/10 text-white">
              <SelectItem value="all">Усі</SelectItem>
              <SelectItem value="high">Високий</SelectItem>
              <SelectItem value="medium">Середній</SelectItem>
              <SelectItem value="low">Низький</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={riskFilter} 
            onValueChange={(value) => {
              setRiskFilter(value);
              setIsSearching(true);
            }}
          >
            <SelectTrigger className="border-white/10 text-white w-[140px]">
              <SelectValue placeholder="Ризик" />
            </SelectTrigger>
            <SelectContent className="border-white/10 text-white">
              <SelectItem value="all">Усі</SelectItem>
              <SelectItem value="high">Високий</SelectItem>
              <SelectItem value="medium">Середній</SelectItem>
              <SelectItem value="low">Низький</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-white/10 text-white gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Сортування
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-white/10 text-white">
              <DropdownMenuLabel>Сортувати за:</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => {
                  setSortField('title');
                  setIsSearching(true);
                }}
                className={cn(sortField === 'title' && 'bg-white/10')}
              >
                Назвою
                {sortField === 'title' && (
                  <span className="ml-auto">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortField('start_date');
                  setIsSearching(true);
                }}
                className={cn(sortField === 'start_date' && 'bg-white/10')}
              >
                Початковою датою
                {sortField === 'start_date' && (
                  <span className="ml-auto">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortField('end_date');
                  setIsSearching(true);
                }}
                className={cn(sortField === 'end_date' && 'bg-white/10')}
              >
                Кінцевою датою
                {sortField === 'end_date' && (
                  <span className="ml-auto">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortField('created_at');
                  setIsSearching(true);
                }}
                className={cn(sortField === 'created_at' && 'bg-white/10')}
              >
                Датою створення
                {sortField === 'created_at' && (
                  <span className="ml-auto">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || riskFilter !== 'all') && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm text-gray-400">Фільтри:</span>
            {searchQuery && (
              <Badge variant="outline" className="text-white border-white/10 gap-1">
                Пошук: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="outline" className="text-white border-white/10 gap-1">
                Статус: {getStatusText(statusFilter)}
                <button onClick={() => setStatusFilter('all')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {priorityFilter !== 'all' && (
              <Badge variant="outline" className="text-white border-white/10 gap-1">
                Пріоритет: {getPriorityText(priorityFilter)}
                <button onClick={() => setPriorityFilter('all')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {riskFilter !== 'all' && (
              <Badge variant="outline" className="text-white border-white/10 gap-1">
                Ризик: {getRiskText(riskFilter)}
                <button onClick={() => setRiskFilter('all')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/10"
              onClick={clearAllFilters}
            >
              Очистити все
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <div key={group.board.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Link href={`/boards/${group.board.id}`}>
                    <h2 className="cursor-pointer text-xl font-bold text-white bg-gradient-to-r from-blue-600/30 to-purple-600/30 px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-blue-600/40 transition">
                      {group.board.title}
                    </h2>
                  </Link>
                  <Badge variant="outline" className="text-white border-white/10">
                    {group.tasks.length} завдань
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {group.tasks.map((task) => (
                    <div key={task.id}>
                      <TaskItem 
                        task={task} 
                        onClick={() => handleTaskClick(task)}
                        onToggleExpand={() => toggleTaskExpansion(task.id)}
                        isExpanded={expandedTasks[task.id]}
                        onMarkAsCompleted={markAsCompleted}
                      />
                      
                      {expandedTasks[task.id] && task.subtasks && task.subtasks.length > 0 && (
                        <div className="ml-8 space-y-3 mt-2">
                          {task.subtasks.map((subtask) => (
                            <TaskItem 
                              key={subtask.id} 
                              task={subtask} 
                              onClick={() => handleTaskClick(subtask)}
                              onMarkAsCompleted={markAsCompleted}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Завдань не знайдено</p>
              <Button 
                variant="outline" 
                className="mt-4 text-white border-white/10 hover:bg-white/10"
                onClick={clearAllFilters}
              >
                Скинути всі фільтри
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen} modal={false}>
        <DialogContent className="sm:max-w-[700px] border-white/10 text-white">
          {currentTask && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Редагувати завдання</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Input
                    value={currentTask.title}
                    onChange={(e) => handleTaskUpdate('title', e.target.value)}
                    placeholder="Назва завдання"
                    className="text-xl"
                    required
                  />
                </div>

                <div>
                  <Textarea
                    value={currentTask.description || ''}
                    onChange={(e) => handleTaskUpdate('description', e.target.value)}
                    placeholder="Опис завдання"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Початкова дата</label>
                    <div className="flex gap-2">
                      <div className="flex-1 flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              {currentTask.start_date ? format(new Date(currentTask.start_date), 'PPP') : 'Оберіть дату'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={currentTask.start_date ? new Date(currentTask.start_date) : undefined}
                              onSelect={handleStartDateChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Select
                          value={currentTask.start_date ? format(new Date(currentTask.start_date), 'HH') : '--'}
                          onValueChange={(hour) => {
                            if (hour !== '--') {
                              const newDate = currentTask.start_date 
                                ? new Date(currentTask.start_date)
                                : new Date();
                              newDate.setHours(parseInt(hour));
                              if (!currentTask.start_date) {
                                newDate.setMinutes(0);
                              }
                              handleTaskUpdate('start_date', newDate.toISOString());
                            }
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <Clock className="h-4 w-4 mr-2 opacity-50" />
                            <SelectValue placeholder="Година" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            <SelectItem value="--">--</SelectItem>
                            {hours.map((hour) => (
                              <SelectItem key={hour} value={hour}>
                                {hour}:00
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={currentTask.start_date ? format(new Date(currentTask.start_date), 'mm') : '--'}
                          onValueChange={(minute) => {
                            if (minute !== '--' && currentTask.start_date) {
                              const newDate = new Date(currentTask.start_date);
                              newDate.setMinutes(parseInt(minute));
                              handleTaskUpdate('start_date', newDate.toISOString());
                            }
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Хв" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            <SelectItem value="--">--</SelectItem>
                            {minutes.map((minute) => (
                              <SelectItem key={minute} value={minute}>
                                {minute}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleTaskUpdate('start_date', null)}
                        disabled={!currentTask.start_date}
                        className="px-3"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Кінцева дата</label>
                    <div className="flex gap-2">
                      <div className="flex-1 flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              {currentTask.end_date ? format(new Date(currentTask.end_date), 'PPP') : 'Оберіть дату'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={currentTask.end_date ? new Date(currentTask.end_date) : undefined}
                              onSelect={handleEndDateChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Select
                          value={currentTask.end_date ? format(new Date(currentTask.end_date), 'HH') : '--'}
                          onValueChange={(hour) => {
                            if (hour !== '--') {
                              const newDate = currentTask.end_date 
                                ? new Date(currentTask.end_date)
                                : new Date();
                              newDate.setHours(parseInt(hour));
                              if (!currentTask.end_date) {
                                newDate.setMinutes(0);
                              }
                              handleTaskUpdate('end_date', newDate.toISOString());
                            }
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <Clock className="h-4 w-4 mr-2 opacity-50" />
                            <SelectValue placeholder="Година" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            <SelectItem value="--">--</SelectItem>
                            {hours.map((hour) => (
                              <SelectItem key={hour} value={hour}>
                                {hour}:00
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={currentTask.end_date ? format(new Date(currentTask.end_date), 'mm') : '--'}
                          onValueChange={(minute) => {
                            if (minute !== '--' && currentTask.end_date) {
                              const newDate = new Date(currentTask.end_date);
                              newDate.setMinutes(parseInt(minute));
                              handleTaskUpdate('end_date', newDate.toISOString());
                            }
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Хв" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            <SelectItem value="--">--</SelectItem>
                            {minutes.map((minute) => (
                              <SelectItem key={minute} value={minute}>
                                {minute}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleTaskUpdate('end_date', null)}
                        disabled={!currentTask.end_date}
                        className="px-3"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Пріоритет</label>
                    <Select
                      value={currentTask.priority}
                      onValueChange={(value) => handleTaskUpdate('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Оберіть пріоритет" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center">
                              <Flag className={`h-4 w-4 mr-2 ${
                                option.value === 'high' ? 'text-red-500' : 
                                option.value === 'medium' ? 'text-yellow-500' : 'text-green-500'
                              }`} />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Ризик</label>
                    <Select
                      value={currentTask.risk || 'low'}
                      onValueChange={(value) => handleTaskUpdate('risk', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Оберіть ризик" />
                      </SelectTrigger>
                      <SelectContent>
                        {riskOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center">
                              <AlertCircle className={`h-4 w-4 mr-2 ${
                                option.value === 'high' ? 'text-red-500' : 
                                option.value === 'medium' ? 'text-yellow-500' : 'text-green-500'
                              }`} />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Теги</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Tag className="h-4 w-4 mr-2" />
                        {selectedTags.length > 0 
                          ? `${selectedTags.length} обрано` 
                          : 'Оберіть теги'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-2">
                      <div className="space-y-2">
                        <Input
                          placeholder="Пошук тегів..."
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                          className="mb-2"
                        />
                        
                        <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Input
                            placeholder="Новий тег"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            className="flex-1"
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: newTagColor }}
                              />
                            </PopoverTrigger>
                            <PopoverContent className="w-[220px] p-4">
                              <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-5 gap-3">
                                  {COLOR_PALETTE.slice(0, 5).map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      className={`w-8 h-8 rounded-full hover:scale-110 transition-transform ${
                                        newTagColor === color
                                          ? 'border-2 border-white dark:border-gray-900 shadow-md'
                                          : 'border border-transparent'
                                      } ${color === '#FFFFFF' ? 'border border-gray-300' : ''}`}
                                      style={{ backgroundColor: color }}
                                      onClick={() => setNewTagColor(color)}
                                    />
                                  ))}
                                </div>
                                <div className="grid grid-cols-5 gap-3">
                                  {COLOR_PALETTE.slice(5, 10).map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      className={`w-8 h-8 rounded-full hover:scale-110 transition-transform ${
                                        newTagColor === color
                                          ? 'border-2 border-white dark:border-gray-900 shadow-md'
                                          : 'border border-transparent'
                                      }`}
                                      style={{ backgroundColor: color }}
                                      onClick={() => setNewTagColor(color)}
                                    />
                                  ))}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <Button
                            size="sm"
                            onClick={handleCreateTag}
                            disabled={!newTagName.trim() || isCreatingTag}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="max-h-[200px] overflow-y-auto">
                          {availableTags
                            .filter(tag => 
                              tag.name.toLowerCase().includes(tagSearch.toLowerCase())
                            )
                            .length === 0 ? (
                              <div className="text-sm text-muted-foreground py-2 text-center">
                                Тегів не знайдено
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {availableTags
                                  .filter(tag => 
                                    tag.name.toLowerCase().includes(tagSearch.toLowerCase())
                                  )
                                  .map((tag) => (
                                    <div
                                      key={tag.id}
                                      className="flex items-center p-2 rounded hover:bg-accent cursor-pointer"
                                      onClick={() => toggleTag(tag.id)}
                                    >
                                      <div 
                                        className="w-3 h-3 rounded-full mr-2" 
                                        style={{ backgroundColor: tag.color }}
                                      />
                                      <span>{tag.name}</span>
                                      {selectedTags.includes(tag.id) && (
                                        <Check className="ml-auto h-4 w-4" />
                                      )}
                                    </div>
                                  ))}
                              </div>
                            )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTags.map(tagId => {
                      const tag = availableTags.find(t => t.id === tagId);
                      return tag ? (
                        <TagBadge 
                          key={tag.id} 
                          tag={tag}
                          onRemove={() => toggleTag(tag.id)}
                        />
                      ) : null;
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={deleteTask}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Видалити
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      Скасувати
                    </Button>
                    <Button 
                      type="button" 
                      onClick={updateTask}
                    >
                      Зберегти зміни
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}