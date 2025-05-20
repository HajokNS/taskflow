import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Flag, Calendar as CalendarIcon, LayoutDashboard, X, Tag, AlertCircle, Clock, CheckCircle, Circle, Trash2, Check, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect } from 'react';

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
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
    color: string;
  };
  tags?: Tag[];
  subtasks?: Task[];
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

const COLOR_PALETTE = [
  '#FFFFFF', '#000000', '#FF6900', '#FCB900', '#7BDCB5',
  '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C', '#00D084'
];

const statusOptions = [
  { value: 'active', label: 'Активне' },
  { value: 'completed', label: 'Завершене' },
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
    case 'archived': return 'bg-gray-500/20 text-gray-400';
    default: return 'bg-gray-500/20 text-gray-400';
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

export default function EditTaskPage({ task, availableTags }: { task: Task, availableTags: Tag[] }) {
  const [currentTask, setCurrentTask] = useState<Task>(task);
  const [selectedTags, setSelectedTags] = useState<string[]>(task.tags?.map(tag => tag.id) || []);
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

  const handleTaskUpdate = (field: string, value: any) => {
    setCurrentTask(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'status' ? { is_completed: value === 'completed' } : {})
    } as Task));
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    const newDate = new Date(date);
    if (currentTask.start_date) {
      const prevDate = new Date(currentTask.start_date);
      newDate.setHours(prevDate.getHours());
      newDate.setMinutes(prevDate.getMinutes());
    }
    handleTaskUpdate('start_date', newDate.toISOString());
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;
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
    try {
      await router.put(`/tasks/${currentTask.id}`, {
        ...currentTask,
        tags: selectedTags
      }, {
        onSuccess: () => {
          router.get('/tasks', {}, { preserveState: true });
        }
      });
    } catch (error) {
      console.error('Помилка при оновленні завдання:', error);
    }
  };

  const deleteTask = async () => {
    try {
      await router.delete(`/tasks/${currentTask.id}`);
      router.visit(`/tasks`);
    } catch (error) {
      console.error('Помилка при видаленні завдання:', error);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Редагування завдання" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-white">Редагування завдання</h1>
          <Link href="/tasks">
            <Button variant="outline" className="bg-white/5 hover:bg-white/10 text-white border-white/10">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              До всіх завдань
            </Button>
          </Link>
        </div>

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
              <Link href="/tasks">
                <Button type="button" variant="outline">
                  Скасувати
                </Button>
              </Link>
              <Button 
                type="button" 
                onClick={updateTask}
              >
                Зберегти зміни
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}