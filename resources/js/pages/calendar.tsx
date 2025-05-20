import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ChevronLeft, ChevronRight, LayoutDashboard, Flag, Calendar as CalendarIcon, Star, CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { 
  format, 
  addWeeks, 
  subWeeks, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  isSameWeek,
  addDays
} from 'date-fns';
import { uk } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface Task {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  priority: 'low' | 'medium' | 'high';
  is_completed: boolean;
  board: {
    id: string;
    title: string;
    color: string;
  };
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
}

interface Board {
  id: string;
  title: string;
  color: string;
  end_date: string;
  is_favorite: boolean;
}

export default function CalendarPage({ tasks = [], boards = [] }: { tasks: Task[], boards: Board[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Календар',
      href: '/calendar',
    },
  ];

  const startDate = viewMode === 'week' 
    ? startOfWeek(currentDate, { weekStartsOn: 1 })
    : startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  
  const endDate = viewMode === 'week'
    ? endOfWeek(currentDate, { weekStartsOn: 1 })
    : endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const navigate = (direction: 'prev' | 'next') => {
    if (viewMode === 'week') {
      setCurrentDate(direction === 'prev' 
        ? subWeeks(currentDate, 1)
        : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev'
        ? subMonths(currentDate, 1)
        : addMonths(currentDate, 1));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'active': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'overdue': return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'not_started': return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершене';
      case 'active': return 'Активне';
      case 'overdue': return 'Прострочене';
      case 'not_started': return 'Не розпочато';
      default: return 'Не визначено';
    }
  };

  const getTaskStatus = (task: Task) => {
    if (task.is_completed) return 'completed';
    
    const now = new Date();
    const endDate = task.end_date ? new Date(task.end_date) : null;
    
    if (endDate && endDate < now) return 'overdue';
    if (task.start_date && new Date(task.start_date) <= now) return 'active';
    
    return 'not_started';
  };

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.end_date) return false;
      
      const taskEnd = new Date(task.end_date);
      return isSameDay(taskEnd, day);
    });
  };

  const getBoardsForDay = (day: Date) => {
    return boards.filter(board => 
      board.end_date && isSameDay(new Date(board.end_date), day)
    );
  };

  const getTaskStatusIcon = (is_completed: boolean) => {
    return is_completed ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <Circle className="h-4 w-4 text-gray-400" />
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Календар" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Календар</h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'week' ? 'default' : 'outline'}
                onClick={() => setViewMode('week')}
              >
                Тиждень
              </Button>
              <Button 
                variant={viewMode === 'month' ? 'default' : 'outline'}
                onClick={() => setViewMode('month')}
              >
                Місяць
              </Button>
            </div>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
              Сьогодні
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {viewMode === 'week' 
              ? `${format(startDate, 'd MMM yyyy', { locale: uk })} - ${format(endDate, 'd MMM yyyy', { locale: uk })}`
              : format(currentDate, 'MMMM yyyy', { locale: uk })}
          </h2>
          <Button variant="outline" size="icon" onClick={() => navigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800">
            {Array.from({ length: 7 }).map((_, index) => {
              const day = addDays(startDate, index);
              return (
                <div key={index} className="p-2 border-r last:border-r-0 text-center">
                  <div className="font-medium">
                    {format(day, 'EEE', { locale: uk })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 divide-x divide-y">
            {days.map((day, dayIndex) => (
              <div 
                key={day.toString()} 
                className={cn(
                  "min-h-32 p-2",
                  !isSameWeek(day, currentDate, { weekStartsOn: 1 }) && 'bg-gray-50/50 dark:bg-gray-800/50',
                  isToday(day) && 'bg-blue-50/30 dark:bg-blue-900/20'
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={cn(
                    "text-sm font-medium",
                    isToday(day) && 'text-blue-600 font-bold'
                  )}>
                    {format(day, 'd')}
                  </span>
                  {isToday(day) && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Сьогодні
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-[calc(100%-28px)] overflow-y-auto">
                  {getBoardsForDay(day).map(board => (
                    <Link 
                      key={board.id} 
                      href={`/boards/${board.id}`}
                      className={`
                        flex items-center gap-2 p-2 rounded text-sm
                        border-l-4 hover:shadow-md transition-shadow
                        cursor-pointer text-gray-800 dark:text-gray-200
                      `}
                      style={{ borderColor: board.color }}
                    >
                      {board.is_favorite && (
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      )}
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: board.color }}
                      />
                      <span className="truncate">{board.title}</span>
                    </Link>
                  ))}

                  {getTasksForDay(day).map(task => {
                    const status = getTaskStatus(task);
                    const statusColor = getStatusColor(status);
                    const statusText = getStatusText(status);
                    
                    return (
                      <Link
                        key={task.id}
                        href={route('tasks.edit', { task: task.id })}
                        className={`
                          flex flex-col gap-1 p-2 rounded text-sm
                          border hover:shadow-md transition-shadow
                          cursor-pointer ${statusColor}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <Flag className="h-4 w-4 flex-shrink-0" />
                            <div className="truncate font-medium">{task.title}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTaskStatusIcon(task.is_completed)}
                          </div>
                        </div>

                        <div className="text-xs flex items-center gap-1">
                          <div 
                            className="w-2 h-2 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: task.board.color }}
                          />
                          <span className="truncate">{task.board.title}</span>
                        </div>

                        <div className="inline-flex">
                          <span className="text-xs font-medium px-2 py-1 rounded bg-white/10">
                            {statusText}
                          </span>
                        </div>

                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map(tag => (
                              <span 
                                key={tag.id}
                                className="text-xs px-1.5 py-0.5 rounded-full"
                                style={{ 
                                  backgroundColor: `${tag.color}20`,
                                  border: `1px solid ${tag.color}`,
                                  color: tag.color
                                }}
                              >
                                #{tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function subMonths(date: Date, months: number) {
  return addMonths(date, -months);
}