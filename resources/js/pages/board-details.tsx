import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, Star, Edit, Trash2, Plus, AlertTriangle, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from '@/components/task-card';

interface Board {
  id: string;
  title: string;
  description?: string;
  color: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    deadline?: string;
    tags: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  }>;
}

interface Props extends PageProps {
  board: Board;
}

export default function BoardDetails({ board }: Props) {
  // Групуємо задачі за статусами
  const tasksByStatus = {
    todo: board.tasks?.filter(task => task.status === 'todo') || [],
    in_progress: board.tasks?.filter(task => task.status === 'in_progress') || [],
    done: board.tasks?.filter(task => task.status === 'done') || []
  };

  const totalTasks = tasksByStatus.todo.length + tasksByStatus.in_progress.length + tasksByStatus.done.length;
  const completionPercentage = totalTasks > 0 
    ? Math.round((tasksByStatus.done.length / totalTasks) * 100) 
    : 0;

  const overdueTasks = [...tasksByStatus.todo, ...tasksByStatus.in_progress]
    .filter(task => task.deadline && new Date(task.deadline) < new Date());

  return (
    <AppLayout>
      <Head title={board.title} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href={route('boards.index')} className="flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад до всіх дошок
          </Link>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Редагувати
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Видалити
            </Button>
          </div>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center mb-2">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mr-3">
                {board.title}
              </h1>
              <Star 
                className={`h-5 w-5 ${board.is_favorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
              />
            </div>
            {board.description && (
              <p className="text-muted-foreground max-w-2xl">
                {board.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: board.color }}
            />
            <span className="text-sm text-muted-foreground">
              Створено: {new Date(board.created_at).toLocaleDateString('uk-UA')}
            </span>
          </div>
        </div>

        {overdueTasks.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200">
                {overdueTasks.length} протермінованих завдань
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                Деякі завдання мають минулий дедлайн
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <List className="h-5 w-5 mr-2 text-muted-foreground" />
                Прогрес
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={completionPercentage} className="h-2 mb-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {completionPercentage}% завершено
                </span>
                <span>
                  {tasksByStatus.done.length} з {totalTasks} завдань
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Високий пріоритет:</span>
                <Badge variant="destructive">
                  {[...tasksByStatus.todo, ...tasksByStatus.in_progress].filter(t => t.priority === 'high').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Протерміновано:</span>
                <Badge variant="destructive">
                  {overdueTasks.length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Швидкі дії</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full mb-2" asChild>
                <Link href={route('tasks.create', { board_id: board.id })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Додати завдання
                </Link>
              </Button>
              <Button variant="outline" className="w-full">
                Налаштування дошки
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <span className="h-3 w-3 rounded-full bg-gray-400 mr-2"></span>
              Заплановано
              <Badge variant="secondary" className="ml-2">
                {tasksByStatus.todo.length}
              </Badge>
            </h3>
            {tasksByStatus.todo.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <span className="h-3 w-3 rounded-full bg-blue-400 mr-2"></span>
              В роботі
              <Badge variant="secondary" className="ml-2">
                {tasksByStatus.in_progress.length}
              </Badge>
            </h3>
            {tasksByStatus.in_progress.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <span className="h-3 w-3 rounded-full bg-green-400 mr-2"></span>
              Виконано
              <Badge variant="secondary" className="ml-2">
                {tasksByStatus.done.length}
              </Badge>
            </h3>
            {tasksByStatus.done.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}