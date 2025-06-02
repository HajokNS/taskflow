import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, Star, Edit, Trash2, Clock, PieChart, DollarSign, Calendar as CalendarIcon, Flag, AlertCircle, CheckCircle, Circle, X, Plus, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Toaster, toast } from 'sonner';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';

ChartJS.register(ArcElement, Tooltip, Legend);

const quillStyles = `
  .ql-container {
    border: 1px solid rgba(100, 100, 100, 0.3);
    border-radius: 6px;
    color: #d4d4d4;
    font-size: 1rem;
    backdrop-filter: blur(8px);
    outline: none;
    height: 150px; /* 🔥 Фіксована висота */
    max-height: 200px;
  }

  .ql-editor {
    min-height: 150px;
    padding: 14px;
    color: #d4d4d4;
    outline: none;
    line-height: 1.6;
  }

  .ql-editor.ql-blank::before {
    content: "Введіть вміст вашого поста...";
    color: rgba(212, 212, 212, 0.4);
    font-style: italic;
    pointer-events: none;
    position: absolute;
  }

  .ql-container:focus, .ql-editor:focus {
    border: 1px solid #5e5e5e;
    box-shadow: 0 0 8px rgba(94, 94, 94, 0.5);
    outline: none;
  }

  .ql-toolbar {
    background: rgba(15, 15, 20, 0.95);
    border: 1px solid rgba(100, 100, 100, 0.3);
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    backdrop-filter: blur(8px);
  }

  .ql-toolbar .ql-formats {
    margin-right: 8px;
  }

  .ql-toolbar .ql-stroke {
    stroke: #d4d4d4;
  }

  .ql-toolbar .ql-fill {
    fill: #d4d4d4;
  }

  .ql-toolbar .ql-picker {
    color: #d4d4d4;
    font-size: 0.85rem;
  }

  .ql-toolbar .ql-active .ql-stroke,
  .ql-toolbar .ql-active .ql-fill {
    stroke: #bfbfbf;
    fill: #bfbfbf;
  }

  .ql-toolbar .ql-picker-label:hover,
  .ql-toolbar .ql-picker-item:hover {
    color: #bfbfbf;
  }

  .ql-toolbar button:hover .ql-stroke,
  .ql-toolbar button:hover .ql-fill {
    stroke: #bfbfbf;
    fill: #bfbfbf;
  }

  .ql-toolbar .ql-picker-options {
    background-color: rgba(20, 20, 25, 0.95);
    color: #d4d4d4;
    border: 1px solid rgba(100, 100, 100, 0.3);
  }

  .ql-editor a {
    color: #a0a0a0;
    text-decoration: underline;
  }
`;

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
  attachments?: string[];
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
        <div
          className="mt-1 text-xs text-muted-foreground line-clamp-2 break-words"
          dangerouslySetInnerHTML={{ __html: task.description }}
        />
      )}

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [boardData, setBoardData] = useState(board);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tasksByStatus = {
    not_started: boardData.tasks?.filter(task => task.status === 'not_started') || [],
    active: boardData.tasks?.filter(task => task.status === 'active') || [],
    completed: boardData.tasks?.filter(task => task.status === 'completed') || [],
    overdue: boardData.tasks?.filter(task => task.status === 'overdue') || []
  };

  const totalTasks = boardData.tasks?.length || 0;
  const completionPercentage = totalTasks > 0
    ? Math.round((tasksByStatus.completed.length / totalTasks) * 100) : 0;

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
          '#94a3b8',
          '#3b82f6',
          '#10b981',
          '#ef4444'
        ],
        borderWidth: 0,
      },
    ],
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!boardData.title.trim()) {
      newErrors.title = 'Назва дошки обов\'язкова';
      toast.error('Будь ласка, введіть назву дошки');
    } else if (boardData.title.length < 5) {
      newErrors.title = 'Назва повинна містити щонайменше 5 символів';
      toast.error('Назва повинна містити щонайменше 5 символів');
    } else if (boardData.title.length > 50) {
      newErrors.title = 'Назва не може перевищувати 50 символів';
      toast.error('Назва не може перевищувати 50 символів');
    }

    // Check description length (HTML stripped)
    const descriptionLength = boardData.description
      ? boardData.description.replace(/<[^>]*>/g, '').length
      : 0;
    if (descriptionLength > 1000) {
      newErrors.description = 'Опис не може перевищувати 1000 символів';
      toast.error('Опис не може перевищувати 1000 символів');
    }

    if (boardData.estimated_hours && boardData.estimated_hours < 0) {
      newErrors.estimated_hours = 'Години не можуть бути від\'ємними';
      toast.error('Години не можуть бути від\'ємними');
    }

    if (boardData.estimated_budget && boardData.estimated_budget < 0) {
      newErrors.estimated_budget = 'Бюджет не може бути від\'ємним';
      toast.error('Бюджет не може бути від\'ємним');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBoardUpdate = (field: string, value: any) => {
    setBoardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveBoard = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await router.put(route('boards.update', boardData.id), {
        title: boardData.title,
        description: boardData.description,
        is_favorite: boardData.is_favorite,
        color: boardData.color,
        estimated_hours: boardData.estimated_hours,
        estimated_budget: boardData.estimated_budget
      }, {
        onSuccess: () => {
          toast.success('Дошку успішно оновлено');
          setEditModalOpen(false);
        },
        onError: (errors) => {
          toast.error('Помилка при оновленні дошки');
          setErrors(errors);
        }
      });
    } catch (error) {
      console.error('Помилка при оновленні дошки:', error);
      toast.error('Сталася помилка при оновленні дошки');
    }
  };

  const deleteBoard = async () => {
    toast('Ви впевнені, що хочете видалити цю дошку?', {
      action: {
        label: 'Видалити',
        onClick: async () => {
          setIsDeleting(true);
          try {
            const promise = router.delete(route('boards.destroy', boardData.id));

            toast.promise(promise, {
              loading: 'Видалення дошки...',
              success: () => {
                router.get(route('boards.index'));
                return 'Дошку успішно видалено';
              },
              error: () => {
                setIsDeleting(false);
                return 'Не вдалося видалити дошку';
              }
            });

            await promise;
          } catch (error) {
            console.error('Помилка при видаленні дошки:', error);
            toast.error('Сталася помилка при видаленні дошки');
            setIsDeleting(false);
          }
        }
      },
      cancel: {
        label: 'Скасувати',
        onClick: () => {
          setIsDeleting(false);
        }
      },
      duration: 10000
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 10 * 1024 * 1024) {
        toast.error('Файл не може бути більше 10MB');
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(file.type)) {
        toast.error('Непідтримуваний тип файлу. Дозволені: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX');
        return;
      }

      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await router.post(`/boards/${boardData.id}/upload`, formData, {
        onSuccess: (page) => {
          setBoardData(page.props.board);
          toast.success('Файл успішно завантажено');
        },
        onError: (errors) => {
          toast.error('Сталася помилка при завантаженні файлу');
          console.error('Помилка при завантаженні файлу:', errors);
        },
        forceFormData: true,
        only: ['board']
      });
    } catch (error) {
      console.error('Помилка при завантаженні файлу:', error);
      toast.error('Сталася помилка при завантаженні файлу');
    }
  };

  const sanitizedDescription = DOMPurify.sanitize(boardData.description || '', {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });

  return (
    <AppLayout>
      <Head title={boardData.title} />
      <Toaster position="top-center" richColors />

      <div className="container mx-auto px-4 py-8 space-y-6">
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
            <Button
              variant="default"
              size="sm"
              asChild
            >
              <Link href={route('tasks.create', { board_id: board.id })}>
                <Plus className="h-4 w-4 mr-2" />
                Додати завдання
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Редагувати
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteBoard}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Видалення...' : 'Видалити'}
            </Button>
          </div>
        </div>

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
            <div
              className="text-muted-foreground max-w-3xl"
              style={{ overflow: 'hidden' }}
            >
              <style>{`
    .description-prose p {
      margin: 0 0 0.75rem;
      line-height: 1.6;
    }
    .description-prose ul {
      list-style-type: disc;
      padding-left: 1.25rem;
      margin: 0.75rem 0;
    }
    .description-prose ol {
      list-style-type: decimal;
      padding-left: 1.25rem;
      margin: 0.75rem 0;
    }
    .description-prose li {
      margin-bottom: 0.35rem;
    }
    .description-prose a {
      color: #3b82f6;
      text-decoration: underline;
    }
    .description-prose blockquote {
      border-left: 4px solid #9ca3af;
      padding-left: 0.75rem;
      color: #6b7280;
      margin: 0.75rem 0;
      font-style: italic;
    }
  `}</style>
              <div
                className="description-prose"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            </div>

          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-1 md:col-span-2 lg:col-span-4 border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Paperclip className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">Прикріплені файли</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {boardData.attachments?.length > 0 ? (
              <ul className="space-y-2">
                {boardData.attachments.map((file, index) => {
                  const fileUrl = typeof file === 'string' ? file : file.url;
                  const fileName = typeof file === 'string' ? file.split('/').pop() : file.name ?? file.url?.split('/').pop();
                  return (
                    <li key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <a href={fileUrl} download className="text-primary hover:underline break-all">{fileName}</a>
                      <Button variant="outline" size="sm" asChild>
                        <a href={fileUrl} download>Скачати</a>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Файлів не додано.</p>
            )}

            <div className="mt-4">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <Button
                variant="default"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Plus className="h-4 w-4 mr-2" /> Додати файл
              </Button>
            </div>
          </CardContent>
        </Card>

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
                  onChange={(e) => {
                    handleBoardUpdate('title', e.target.value);
                    if (errors.title) setErrors({ ...errors, title: '' });
                  }}
                  className="text-xl"
                  maxLength={50}
                />
                {errors.title && (
                  <div className="flex items-center text-sm text-red-500 mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.title}
                  </div>
                )}
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
              <style>{quillStyles}</style>
              <ReactQuill
                value={boardData.description || ''}
                onChange={(value) => {
                  handleBoardUpdate('description', value);
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline'],
                    ['link'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                  ],
                }}
                formats={['bold', 'italic', 'underline', 'link', 'list', 'bullet']}
                theme="snow"
                style={{ marginBottom: '24px' }}
              />
              <div className="flex justify-between mt-1">
                {errors.description && (
                  <div className="flex items-center text-sm text-red-500">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {boardData.description?.replace(/<[^>]*>/g, '').length || 0}/1000 символів
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Години</label>
                <Input
                  type="number"
                  value={boardData.estimated_hours || 0}
                  onChange={(e) => {
                    handleBoardUpdate('estimated_hours', Number(e.target.value));
                    if (errors.estimated_hours) setErrors({ ...errors, estimated_hours: '' });
                  }}
                  min="0"
                />
                {errors.estimated_hours && (
                  <div className="flex items-center text-sm text-red-500 mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.estimated_hours}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Бюджет (грн)</label>
                <Input
                  type="number"
                  value={boardData.estimated_budget || 0}
                  onChange={(e) => {
                    handleBoardUpdate('estimated_budget', Number(e.target.value));
                    if (errors.estimated_budget) setErrors({ ...errors, estimated_budget: '' });
                  }}
                  min="0"
                />
                {errors.estimated_budget && (
                  <div className="flex items-center text-sm text-red-500 mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.estimated_budget}
                  </div>
                )}
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
                      className={`w-8 h-8 rounded-full hover:scale-110 transition-transform ${boardData.color === color
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
    </AppLayout>
  );
}