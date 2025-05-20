import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, Star, Edit, Trash2, Clock, PieChart, DollarSign, Calendar as CalendarIcon, Flag, AlertCircle, CheckCircle, Circle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Board {
  id: string;
  title: string;
  description?: string;
  color: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  estimated_budget?: number;
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    status: 'not_started' | 'active' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
    risk: 'low' | 'medium' | 'high';
    start_date?: string;
    end_date?: string;
    tags: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  }>;
}

interface Props {
  board: Board;
}

const COLOR_PALETTE = [
  '#FFFFFF', '#000000', '#FF6900', '#FCB900', '#7BDCB5',
  '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C', '#00D084'
];

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

const PriorityBadge = ({ priority }: { priority: 'low' | 'medium' | 'high' }) => (
  <div className={`flex items-center gap-1 ${getPriorityColor(priority)}`}>
    <Flag className="h-4 w-4" />
    <span className="text-xs">{getPriorityText(priority)}</span>
  </div>
);

const RiskBadge = ({ risk }: { risk: 'low' | 'medium' | 'high' }) => (
  <div className={`flex items-center gap-1 ${getRiskColor(risk)}`}>
    <AlertCircle className="h-4 w-4" />
    <span className="text-xs">{getRiskText(risk)}</span>
  </div>
);

const TaskCard = ({ task }: { task: Board['tasks'][0] }) => {
  return (
    <div className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-card">
      <div className="flex items-start justify-between gap-2 min-h-[2.5rem]">
        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
          {task.status === 'completed' ? (
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          )}
          <h3 className="font-medium text-sm leading-tight line-clamp-2 break-words">
            {task.title}
          </h3>
        </div>
        <Badge className={`text-xs ${getStatusColor(task.status)}`}>
          {getStatusText(task.status)}
        </Badge>
      </div>

      {task.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 break-words">
          {task.description}
        </p>
      )}

      {/* Блок з датами та часом */}
      <div className="mt-2 space-y-1">
        {task.start_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            <span>{format(new Date(task.start_date), 'dd.MM.yy')}</span>
            <Clock className="h-3 w-3" />
            <span>{format(new Date(task.start_date), 'HH:mm')}</span>
          </div>
        )}
        {task.end_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            <span>{format(new Date(task.end_date), 'dd.MM.yy')}</span>
            <Clock className="h-3 w-3" />
            <span>{format(new Date(task.end_date), 'HH:mm')}</span>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        <PriorityBadge priority={task.priority} />
        <RiskBadge risk={task.risk} />
        
        {task.tags?.map((tag) => (
          <Badge 
            key={tag.id} 
            className="text-xs py-0.5 px-1.5" 
            style={{ backgroundColor: tag.color }}
          >
            #{tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

const TaskColumn = ({ title, tasks, color }: { title: string; tasks: Board['tasks'][0][]; color: string }) => (
  <div className="space-y-4 h-[calc(100vh-380px)]">
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm font-medium">
          <span className={`h-3 w-3 rounded-full ${color} mr-2`}></span>
          {title}
          <Badge variant="secondary" className="ml-2">
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 flex-1 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Немає завдань
          </p>
        )}
      </CardContent>
    </Card>
  </div>
);

export default function BoardDetails({ board }: Props) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [boardData, setBoardData] = useState(board);

  // Групуємо задачі за статусами
  const tasksByStatus = {
    not_started: boardData.tasks?.filter(task => task.status === 'not_started') || [],
    active: boardData.tasks?.filter(task => task.status === 'active') || [],
    completed: boardData.tasks?.filter(task => task.status === 'completed') || [],
    overdue: boardData.tasks?.filter(task => task.status === 'overdue') || []
  };

  const totalTasks = boardData.tasks?.length || 0;
  const completionPercentage = totalTasks > 0 
    ? Math.round((tasksByStatus.completed.length / totalTasks) * 100) : 0;

  // Розрахунок прогресу часу дошки
  const calculateTimeProgress = () => {
    if (!boardData.start_date || !boardData.end_date) return 0;
    
    const start = new Date(boardData.start_date).getTime();
    const end = new Date(boardData.end_date).getTime();
    const now = new Date().getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const timeProgress = calculateTimeProgress();

  // Дані для кругової діаграми
  const pieChartData = {
    labels: ['Не розпочато', 'Активні', 'Завершені', 'Прострочені'],
    datasets: [
      {
        data: [
          tasksByStatus.not_started.length,
          tasksByStatus.active.length,
          tasksByStatus.completed.length,
          tasksByStatus.overdue.length
        ],
        backgroundColor: [
          '#94a3b8', // сірий - не розпочато
          '#3b82f6', // синій - активні
          '#10b981', // зелений - завершені
          '#ef4444'  // червоний - прострочені
        ],
        borderWidth: 0,
      },
    ],
  };

  // Статистика для картки
  const highPriorityTasks = [...tasksByStatus.not_started, ...tasksByStatus.active]
    .filter(task => task.priority === 'high').length;

  const handleBoardUpdate = (field: string, value: any) => {
    setBoardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveBoard = async () => {
    try {
      await router.put(route('boards.update', boardData.id), {
        title: boardData.title,
        description: boardData.description,
        is_favorite: boardData.is_favorite,
        color: boardData.color,
        estimated_hours: boardData.estimated_hours,
        estimated_budget: boardData.estimated_budget
      });
      setEditModalOpen(false);
      router.reload();
    } catch (error) {
      console.error('Помилка при оновленні дошки:', error);
    }
  };

  const deleteBoard = async () => {
    setIsDeleting(true);
    try {
      await router.delete(route('boards.destroy', boardData.id));
      router.visit(route('boards.index'));
    } catch (error) {
      console.error('Помилка при видаленні дошки:', error);
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout>
      <Head title={boardData.title} />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Заголовок та кнопки управління */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href={route('boards.index')} 
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              До всіх дошок
            </Link>
            
            <div className="flex items-center space-x-2">
              <span 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: boardData.color }}
              />
              <span className="text-sm text-muted-foreground">
                {new Date(boardData.created_at).toLocaleDateString('uk-UA')}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Редагувати
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Видалити
            </Button>
          </div>
        </div>

        {/* Інформація про дошку */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {boardData.title}
            </h1>
            <Star 
              className={`h-5 w-5 ${boardData.is_favorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
            />
          </div>
          {boardData.description && (
            <p className="text-muted-foreground max-w-3xl">
              {boardData.description}
            </p>
          )}
        </div>

        {/* Перший ряд карток */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Картка інформації про дошку */}
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">
                  Інформація про дошку
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Статус:</span>
                  <Badge variant={timeProgress === 100 ? 'default' : 'secondary'}>
                    {timeProgress === 100 ? 'Завершено' : 'Активна'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Початок:</span>
                  <span className="text-sm font-medium">
                    {boardData.start_date ? new Date(boardData.start_date).toLocaleDateString('uk-UA') : 'Не вказано'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Кінець:</span>
                  <span className="text-sm font-medium">
                    {boardData.end_date ? new Date(boardData.end_date).toLocaleDateString('uk-UA') : 'Не вказано'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Картка прогресу часу */}
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">
                  Прогрес часу
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={timeProgress} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {timeProgress}% завершено
                  </span>
                  <span className="font-medium">
                    {timeProgress === 100 ? 'Проект завершено' : 'В процесі'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Картка кругової діаграми */}
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">
                  Статуси завдань
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[120px] flex items-center justify-center">
                <Pie 
                  data={pieChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      }
                    }
                  }} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Картка запланованих витрат */}
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">
                  Ресурси
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Години:</span>
                  <span className="text-sm font-medium">
                    {boardData.estimated_hours || 0} год
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Бюджет:</span>
                  <span className="text-sm font-medium">
                    {boardData.estimated_budget || 0} грн
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Високий пріоритет:</span>
                  <Badge variant="destructive" className="px-2">
                    {highPriorityTasks}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Другий ряд карток з завданнями */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TaskColumn 
            title="Не розпочаті" 
            tasks={tasksByStatus.not_started} 
            color="bg-gray-400" 
          />
          <TaskColumn 
            title="Активні" 
            tasks={tasksByStatus.active} 
            color="bg-blue-400" 
          />
          <TaskColumn 
            title="Завершені" 
            tasks={tasksByStatus.completed} 
            color="bg-green-400" 
          />
          <TaskColumn 
            title="Прострочені" 
            tasks={tasksByStatus.overdue} 
            color="bg-red-400" 
          />
        </div>
      </div>

      {/* Модальне вікно редагування */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Редагувати дошку</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Назва дошки"
                  value={boardData.title}
                  onChange={(e) => handleBoardUpdate('title', e.target.value)}
                  className="text-xl"
                  required
                />
              </div>
              <button 
                type="button"
                onClick={() => handleBoardUpdate('is_favorite', !boardData.is_favorite)}
                className={`transition-colors ${boardData.is_favorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
              >
                <Star className="h-6 w-6" />
              </button>
            </div>

            <div>
              <Textarea
                placeholder="Опис дошки"
                value={boardData.description || ''}
                onChange={(e) => handleBoardUpdate('description', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Години</label>
                <Input
                  type="number"
                  value={boardData.estimated_hours || 0}
                  onChange={(e) => handleBoardUpdate('estimated_hours', Number(e.target.value))}
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Бюджет (грн)</label>
                <Input
                  type="number"
                  value={boardData.estimated_budget || 0}
                  onChange={(e) => handleBoardUpdate('estimated_budget', Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Колір дошки</label>
              <div className="flex items-center gap-2">
                <div className="flex gap-2 flex-wrap">
                  {COLOR_PALETTE.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full hover:scale-110 transition-transform ${
                        boardData.color === color
                          ? 'border-2 border-gray-900 shadow-md'
                          : 'border border-transparent'
                      } ${color === '#FFFFFF' ? 'border border-gray-300' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleBoardUpdate('color', color)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setEditModalOpen(false)}
              >
                Скасувати
              </Button>
              <Button 
                type="button" 
                onClick={saveBoard}
              >
                Зберегти зміни
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Діалог підтвердження видалення */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Підтвердження видалення</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertDescription>
                Ви впевнені, що хочете видалити дошку "{boardData.title}"? Цю дію неможливо скасувати.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Скасувати
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={deleteBoard}
                disabled={isDeleting}
              >
                {isDeleting ? 'Видалення...' : 'Видалити'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}