import React, { useState, useEffect } from 'react';
import { Timeline } from 'react-gantt-schedule-timeline-calendar';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GanttTask {
  id: string;
  title: string;
  start: Date;
  end: Date;
  bgColor: string;
  progress: number;
  status?: string;
  board?: {
    title: string;
    color: string;
  };
}

const GanttChart = () => {
  const { props } = usePage<PageProps>();
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<GanttTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeScale, setTimeScale] = useState<'day' | 'week' | 'month'>('week');
  const [boardFilter, setBoardFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Форматування даних при завантаженні
  useEffect(() => {
    if (props.tasks) {
      const formattedTasks = props.tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        start: new Date(task.start_date || new Date()),
        end: new Date(task.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        bgColor: getTaskColor(task),
        progress: task.is_completed ? 100 : 0,
        status: task.status,
        board: {
          title: task.board?.title,
          color: task.board?.color || '#3b82f6',
        },
      }));
      setTasks(formattedTasks);
      setFilteredTasks(formattedTasks);
      setIsLoading(false);
    }
  }, [props.tasks]);

  // Фільтрація завдань
  useEffect(() => {
    let result = [...tasks];
    
    if (boardFilter !== 'all') {
      result = result.filter(task => 
        task.board?.title.toLowerCase().includes(boardFilter.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    setFilteredTasks(result);
  }, [boardFilter, statusFilter, tasks]);

  const getTaskColor = (task: any) => {
    switch (task.status) {
      case 'completed':
        return '#10b981'; // green
      case 'overdue':
        return '#ef4444'; // red
      case 'active':
        return '#3b82f6'; // blue
      default:
        return '#6b7280'; // gray
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    window.location.reload();
  };

  const getUniqueBoards = () => {
    const boards = new Set<string>();
    tasks.forEach(task => {
      if (task.board?.title) {
        boards.add(task.board.title);
      }
    });
    return Array.from(boards);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <CardTitle>Діаграма Ганта</CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Select value={timeScale} onValueChange={(value: 'day' | 'week' | 'month') => setTimeScale(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Масштаб" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>День</span>
                  </div>
                </SelectItem>
                <SelectItem value="week">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Тиждень</span>
                  </div>
                </SelectItem>
                <SelectItem value="month">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Місяць</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={boardFilter} onValueChange={setBoardFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Усі дошки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі дошки</SelectItem>
                {getUniqueBoards().map(board => (
                  <SelectItem key={board} value={board}>
                    {board}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Усі статуси" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі статуси</SelectItem>
                <SelectItem value="not_started">Не розпочато</SelectItem>
                <SelectItem value="active">Активні</SelectItem>
                <SelectItem value="overdue">Прострочені</SelectItem>
                <SelectItem value="completed">Завершені</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Оновити
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Timeline
              data={filteredTasks}
              config={{
                scale: {
                  type: timeScale,
                  format: (date: Date) => {
                    if (timeScale === 'day') {
                      return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
                    } else if (timeScale === 'week') {
                      return `Тиждень ${date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}`;
                    } else {
                      return date.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
                    }
                  },
                },
                header: {
                  top: {
                    style: {
                      backgroundColor: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      borderBottom: '1px solid hsl(var(--border))',
                    },
                  },
                  middle: {
                    style: {
                      backgroundColor: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                    },
                  },
                },
                chart: {
                  style: {
                    backgroundColor: 'hsl(var(--background))',
                  },
                  progress: {
                    bar: {
                      style: {
                        backgroundColor: 'hsl(var(--primary))',
                      },
                    },
                  },
                  item: {
                    title: {
                      style: {
                        color: 'hsl(var(--foreground))',
                      },
                    },
                  },
                },
                taskList: {
                  style: {
                    backgroundColor: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    borderRight: '1px solid hsl(var(--border))',
                  },
                  title: {
                    style: {
                      backgroundColor: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      borderBottom: '1px solid hsl(var(--border))',
                    },
                  },
                },
              }}
              onItemClick={(item: GanttTask) => {
                console.log('Task clicked:', item);
                // Тут можна додати логіку відкриття модального вікна з деталями
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GanttChart;