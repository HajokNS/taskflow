import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, Plus, Minus, Calendar as CalendarIcon, Tag, AlertCircle, Flag, Check, List, Clock, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const COLOR_PALETTE = [
    '#FFFFFF', '#000000', '#FF6900', '#FCB900', '#7BDCB5',
    '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C', '#00D084'
];

const MAX_TAG_LENGTH = 20;

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

export default function TaskCreator() {
    const { props } = usePage();
    const { errors } = props;
    const board_id = props.board_id || '';
    const availableTags = props.tags || [];
    const availableTasks = props.tasks || [];
    const boardDeadline = props.board?.end_date ? new Date(props.board.end_date) : null;
    if (boardDeadline) {
        boardDeadline.setHours(23, 59, 59, 999);
    }

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

    const [mode, setMode] = useState<'task' | 'subtasks'>('task');
    const [selectedTask, setSelectedTask] = useState('');
    const [subtasks, setSubtasks] = useState([{
        title: '',
        start_date: '',
        end_date: '',
        priority: 'medium',
        risk: 'low',
        description: '',
        tags: [] as string[]
    }]);

    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagSearch, setTagSearch] = useState('');
    const [tagsOpen, setTagsOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState(COLOR_PALETTE[2]);
    const [isCreatingTag, setIsCreatingTag] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const colorPopoverRef = useRef<HTMLDivElement>(null);

    const [taskData, setTaskData] = useState({
        board_id: board_id,
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        priority: 'medium',
        risk: 'low',
        status: 'active',
        is_completed: false,
        parent_id: null,
    });

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

    const isDateValid = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
    };

    const boardStartDate = props.board?.start_date ? new Date(props.board.start_date) : null;
    if (boardStartDate) {
        boardStartDate.setHours(0, 0, 0, 0);
    }

    const isDateWithinBoardDeadline = (date: Date) => {
        if (!boardDeadline) return true;
        return date <= boardDeadline;
    };

    const handleTaskStartDateChange = (date: Date | undefined) => {
        if (!date) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!isDateValid(date)) {
            toast.error('Не можна встановити дату в минулому');
            return;
        }

        if (boardStartDate && date < boardStartDate) {
            toast.error(`Дата не може бути раніше початку дошки (${format(boardStartDate, 'PPP')})`);
            return;
        }

        if (!isDateWithinBoardDeadline(date)) {
            toast.error(`Дата не може бути пізніше дедлайну дошки (${format(boardDeadline!, 'PPP')})`);
            return;
        }

        const newDate = new Date(date);
        if (taskData.start_date) {
            const prevDate = new Date(taskData.start_date);
            newDate.setHours(prevDate.getHours());
            newDate.setMinutes(prevDate.getMinutes());
        }
        handleTaskDataChange('start_date', newDate.toISOString());
    };

    const handleTaskEndDateChange = (date: Date | undefined) => {
        if (!date) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!isDateValid(date)) {
            toast.error('Не можна встановити дату в минулому');
            return;
        }

        if (taskData.start_date) {
            const startDate = new Date(taskData.start_date);
            if (date < startDate) {
                toast.error('Кінцева дата не може бути раніше початкової');
                return;
            }
        }

        if (boardStartDate && date < boardStartDate) {
            toast.error(`Дата не може бути раніше початку дошки (${format(boardStartDate, 'PPP')})`);
            return;
        }

        if (!isDateWithinBoardDeadline(date)) {
            toast.error(`Дата не може бути пізніше дедлайну дошки (${format(boardDeadline!, 'PPP')})`);
            return;
        }

        const newDate = new Date(date);
        if (taskData.end_date) {
            const prevDate = new Date(taskData.end_date);
            newDate.setHours(prevDate.getHours());
            newDate.setMinutes(prevDate.getMinutes());
        }
        handleTaskDataChange('end_date', newDate.toISOString());
    };

    const handleSubtaskStartDateChange = (index: number, date: Date | undefined) => {
        if (!date) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!isDateValid(date)) {
            toast.error('Не можна встановити дату в минулому');
            return;
        }

        if (!isDateWithinBoardDeadline(date)) {
            toast.error(`Дата не може бути пізніше дедлайну дошки (${format(boardDeadline!, 'PPP')})`);
            return;
        }

        let parentStartDate: Date | null = null;
        let parentEndDate: Date | null = null;
        
        if (mode === 'subtasks' && selectedTask) {
            const parentTask = availableTasks.find(t => t.id === selectedTask);
            if (parentTask) {
                parentStartDate = parentTask.start_date ? new Date(parentTask.start_date) : null;
                parentEndDate = parentTask.end_date ? new Date(parentTask.end_date) : null;
            }
        } else if (mode === 'task') {
            parentStartDate = taskData.start_date ? new Date(taskData.start_date) : null;
            parentEndDate = taskData.end_date ? new Date(taskData.end_date) : null;
        }

        if (parentStartDate && date < parentStartDate) {
            toast.error(`Дата початку підзадачі не може бути раніше початку основного завдання (${format(parentStartDate, 'PPP')})`);
            return;
        }

        if (parentEndDate && date > parentEndDate) {
            toast.error(`Дата початку підзадачі не може бути пізніше завершення основного завдання (${format(parentEndDate, 'PPP')})`);
            return;
        }

        const newDate = new Date(date);
        if (subtasks[index].start_date) {
            const prevDate = new Date(subtasks[index].start_date);
            newDate.setHours(prevDate.getHours());
            newDate.setMinutes(prevDate.getMinutes());
        }
        updateSubtask(index, 'start_date', newDate.toISOString());
    };

    const handleSubtaskEndDateChange = (index: number, date: Date | undefined) => {
        if (!date) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!isDateValid(date)) {
            toast.error('Не можна встановити дату в минулому');
            return;
        }

        if (subtasks[index].start_date) {
            const startDate = new Date(subtasks[index].start_date);
            if (date < startDate) {
                toast.error('Кінцева дата не може бути раніше початкової');
                return;
            }
        }

        if (!isDateWithinBoardDeadline(date)) {
            toast.error(`Дата не може бути пізніше дедлайну дошки (${format(boardDeadline!, 'PPP')})`);
            return;
        }

        let parentStartDate: Date | null = null;
        let parentEndDate: Date | null = null;
        
        if (mode === 'subtasks' && selectedTask) {
            const parentTask = availableTasks.find(t => t.id === selectedTask);
            if (parentTask) {
                parentStartDate = parentTask.start_date ? new Date(parentTask.start_date) : null;
                parentEndDate = parentTask.end_date ? new Date(parentTask.end_date) : null;
            }
        } else if (mode === 'task') {
            parentStartDate = taskData.start_date ? new Date(taskData.start_date) : null;
            parentEndDate = taskData.end_date ? new Date(taskData.end_date) : null;
        }

        if (parentStartDate && date < parentStartDate) {
            toast.error(`Дата завершення підзадачі не може бути раніше початку основного завдання (${format(parentStartDate, 'PPP')})`);
            return;
        }

        if (parentEndDate && date > parentEndDate) {
            toast.error(`Дата завершення підзадачі не може бути пізніше завершення основного завдання (${format(parentEndDate, 'PPP')})`);
            return;
        }

        const newDate = new Date(date);
        if (subtasks[index].end_date) {
            const prevDate = new Date(subtasks[index].end_date);
            newDate.setHours(prevDate.getHours());
            newDate.setMinutes(prevDate.getMinutes());
        }
        updateSubtask(index, 'end_date', newDate.toISOString());
    };

    const CalendarMainTask = ({ type }: { type: 'start' | 'end' }) => (
        <Calendar
            mode="single"
            selected={type === 'start'
                ? (taskData.start_date ? new Date(taskData.start_date) : undefined)
                : (taskData.end_date ? new Date(taskData.end_date) : undefined)}
            onSelect={type === 'start' ? handleTaskStartDateChange : handleTaskEndDateChange}
            initialFocus
            disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (boardStartDate && date < boardStartDate) return true;

                if (type === 'end' && taskData.start_date) {
                    const startDate = new Date(taskData.start_date);
                    startDate.setHours(0, 0, 0, 0);
                    if (date < startDate) return true;
                }

                if (date < today) return true;

                if (boardDeadline && date > boardDeadline) return true;

                return false;
            }}
        />
    );

    const availableParentTasks = availableTasks.filter(task => 
        !task.is_completed && task.status !== 'completed'
    );

    const CalendarSubtask = ({ index, type }: { index: number, type: 'start' | 'end' }) => {
        let parentStartDate: Date | null = null;
        let parentEndDate: Date | null = null;
        
        if (mode === 'subtasks' && selectedTask) {
            const parentTask = availableTasks.find(t => t.id === selectedTask);
            if (parentTask) {
                parentStartDate = parentTask.start_date ? new Date(parentTask.start_date) : null;
                parentEndDate = parentTask.end_date ? new Date(parentTask.end_date) : null;
            }
        } else if (mode === 'task') {
            parentStartDate = taskData.start_date ? new Date(taskData.start_date) : null;
            parentEndDate = taskData.end_date ? new Date(taskData.end_date) : null;
        }

        return (
            <Calendar
                mode="single"
                selected={type === 'start' 
                    ? (subtasks[index].start_date ? new Date(subtasks[index].start_date) : undefined)
                    : (subtasks[index].end_date ? new Date(subtasks[index].end_date) : undefined)}
                onSelect={type === 'start' 
                    ? (date) => handleSubtaskStartDateChange(index, date)
                    : (date) => handleSubtaskEndDateChange(index, date)}
                initialFocus
                disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (type === 'start' && date < today) return true;

                    if (type === 'end' && subtasks[index].start_date) {
                        const startDate = new Date(subtasks[index].start_date);
                        startDate.setHours(0, 0, 0, 0);
                        if (date < startDate) return true;
                    }

                    if (parentStartDate && date < parentStartDate) return true;
                    if (parentEndDate && date > parentEndDate) return true;

                    if (boardDeadline && date > boardDeadline) return true;

                    return false;
                }}
            />
        );
    };

    const addSubtask = () => {
        setSubtasks([...subtasks, {
            title: '',
            start_date: '',
            end_date: '',
            priority: 'medium',
            risk: 'low',
            description: '',
            tags: []
        }]);
    };

    const handleSetSelectedTask = (id: string) => {
        setMode('subtasks');
        setSelectedTask(id);
    };

    const removeSubtask = (index: number) => {
        if (subtasks.length <= 1) {
            toast.error('Повинна залишитися хоча б одна підзадача');
            return;
        }
        const newSubtasks = [...subtasks];
        newSubtasks.splice(index, 1);
        setSubtasks(newSubtasks);
    };

    const updateSubtask = (index: number, field: string, value: any) => {
        const newSubtasks = [...subtasks];
        newSubtasks[index] = {
            ...newSubtasks[index],
            [field]: value
        };
        setSubtasks(newSubtasks);
    };

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const toggleSubtaskTag = (index: number, tagId: string) => {
        const newSubtasks = [...subtasks];
        const currentTags = newSubtasks[index].tags;

        newSubtasks[index].tags = currentTags.includes(tagId)
            ? currentTags.filter(id => id !== tagId)
            : [...currentTags, tagId];

        setSubtasks(newSubtasks);
    };

    const resetTaskStartDate = () => {
        handleTaskDataChange('start_date', '');
    };

    const resetTaskEndDate = () => {
        handleTaskDataChange('end_date', '');
    };

    const resetSubtaskStartDate = (index: number) => {
        updateSubtask(index, 'start_date', '');
    };

    const resetSubtaskEndDate = (index: number) => {
        updateSubtask(index, 'end_date', '');
    };

    const handleTaskDataChange = (field: string, value: any) => {
        setTaskData({
            ...taskData,
            [field]: value,
            ...(field === 'status' ? { is_completed: value === 'completed' } : {})
        });
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) {
            toast.error('Назва тегу не може бути порожньою');
            return;
        }

        if (newTagName.length > MAX_TAG_LENGTH) {
            toast.error(`Назва тегу не може перевищувати ${MAX_TAG_LENGTH} символів`);
            return;
        }

        // Перевірка на існуючий тег
        const tagExists = availableTags.some(
            tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase()
        );

        if (tagExists) {
            toast.error('Тег з такою назвою вже існує');
            return;
        }

        setIsCreatingTag(true);

        try {
            await router.post(route('tags.store'), {
                name: newTagName,
                color: newTagColor
            }, {
                onSuccess: () => {
                    setNewTagName('');
                    setTagSearch('');
                    toast.success('Тег успішно створено');
                    router.reload({ only: ['tags'] });
                },
                onError: (errors) => {
                    if (errors.name) {
                        toast.error(errors.name);
                    } else {
                        toast.error('Помилка при створенні тегу');
                    }
                }
            });
        } catch (error) {
            toast.error('Сталася помилка при створенні тегу');
        } finally {
            setIsCreatingTag(false);
        }
    };

    const validateTask = () => {
        if (!taskData.title.trim()) {
            toast.error('Назва завдання обов\'язкова');
            return false;
        }

        if (taskData.title.length < 5) {
            toast.error('Назва завдання повинна містити мінімум 5 символів');
            return false;
        }

        if (taskData.title.length > 100) {
            toast.error('Назва завдання не може перевищувати 100 символів');
            return false;
        }

        const plainTextDescription = taskData.description.replace(/<[^>]*>/g, '');
        if (plainTextDescription.length > 1000) {
            toast.error('Опис завдання не може перевищувати 1000 символів');
            return false;
        }

        if (!taskData.start_date) {
            toast.error('Будь ласка, вкажіть початкову дату');
            return false;
        }

        if (!taskData.end_date) {
            toast.error('Будь ласка, вкажіть кінцеву дату');
            return false;
        }

        return true;
    };

    const validateTaskDates = () => {
        if (taskData.start_date && taskData.end_date) {
            const startDate = new Date(taskData.start_date);
            const endDate = new Date(taskData.end_date);
            if (endDate < startDate) {
                toast.error('Кінцева дата не може бути раніше початкової');
                return false;
            }
        }
        return true;
    };

    const validateSubtasks = () => {
        for (const [index, subtask] of subtasks.entries()) {
            if (!subtask.title.trim()) {
                toast.error(`Підзадача ${index + 1}: назва обов'язкова`);
                return false;
            }

            if (subtask.title.length < 5) {
                toast.error(`Підзадача ${index + 1}: назва повинна містити мінімум 5 символів`);
                return false;
            }

            if (subtask.title.length > 100) {
                toast.error(`Підзадача ${index + 1}: назва не може перевищувати 100 символів`);
                return false;
            }

            const plainTextDescription = subtask.description.replace(/<[^>]*>/g, '');
            if (plainTextDescription.length > 1000) {
                toast.error(`Підзадача ${index + 1}: опис не може перевищувати 1000 символів`);
                return false;
            }

            if (!subtask.start_date) {
                toast.error(`Підзадача ${index + 1}: будь ласка, вкажіть початкову дату`);
                return false;
            }

            if (!subtask.end_date) {
                toast.error(`Підзадача ${index + 1}: будь ласка, вкажіть кінцеву дату`);
                return false;
            }
        }
        return true;
    };

    const validateSubtaskDates = (index: number) => {
        const subtask = subtasks[index];
        if (subtask.start_date && subtask.end_date) {
            const startDate = new Date(subtask.start_date);
            const endDate = new Date(subtask.end_date);
            if (endDate < startDate) {
                toast.error(`Підзадача ${index + 1}: кінцева дата не може бути раніше початкової`);
                return false;
            }
        }
        return true;
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            if (mode === 'task') {
                if (!validateTask() || !validateTaskDates()) {
                    return;
                }

                const taskPayload = {
                    title: taskData.title,
                    description: taskData.description,
                    start_date: taskData.start_date || null,
                    end_date: taskData.end_date || null,
                    priority: taskData.priority,
                    risk: taskData.risk,
                    board_id: taskData.board_id,
                    tags: selectedTags,
                    parent_id: null
                };

                await axios.post(route('tasks.store'), taskPayload);
                toast.success('Завдання успішно створено');
                router.visit(`/boards/${board_id}`);
            } else if (mode === 'subtasks') {
                if (!selectedTask) {
                    toast.error('Будь ласка, оберіть основне завдання');
                    return;
                }

                if (!validateSubtasks()) {
                    return;
                }

                // Додаткова перевірка дат для всіх підзадач
                for (let i = 0; i < subtasks.length; i++) {
                    if (!validateSubtaskDates(i)) {
                        return;
                    }
                }

                let successCount = 0;
                const promises = subtasks.map(subtask => {
                    const subtaskPayload = {
                        title: subtask.title,
                        description: subtask.description,
                        start_date: subtask.start_date || null,
                        end_date: subtask.end_date || null,
                        priority: subtask.priority,
                        risk: subtask.risk,
                        board_id: board_id,
                        tags: subtask.tags,
                        parent_id: selectedTask
                    };

                    return axios.post(route('tasks.store'), subtaskPayload)
                        .then(() => successCount++)
                        .catch(error => {
                            console.error('Помилка при створенні підзадачі:', error);
                            toast.error(`Помилка при створенні підзадачі: ${subtask.title}`);
                        });
                });

                await Promise.all(promises);

                if (successCount === subtasks.length) {
                    toast.success(`Усі підзадачі (${successCount}) успішно створені`);
                } else if (successCount > 0) {
                    toast.warning(`Створено ${successCount} з ${subtasks.length} підзадач`);
                } else {
                    toast.error('Не вдалося створити жодної підзадачі');
                    return;
                }

                router.visit(`/boards/${board_id}`);
            }
        } catch (error) {
            console.error('Помилка при створенні:', error);
            toast.error('Сталася помилка при збереженні');
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
                (!colorPopoverRef.current || !colorPopoverRef.current.contains(event.target as Node))) {
                setTagsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderTagSelector = (tags: string[], onToggleTag: (tagId: string) => void) => {
        return (
            <div className="space-y-2">
                <Input
                    placeholder="Пошук тегів..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="mb-2"
                />

                <div className="flex items-center gap-2 mb-2 p-2 rounded-lg">
                    <Input
                        placeholder="Новий тег"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="flex-1"
                        maxLength={MAX_TAG_LENGTH}
                    />
                    <span className="text-xs text-muted-foreground">
                        {newTagName.length}/{MAX_TAG_LENGTH}
                    </span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: newTagColor }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-[220px] p-4"
                            ref={colorPopoverRef}
                            onInteractOutside={(e) => e.preventDefault()}
                        >
                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-5 gap-3">
                                    {COLOR_PALETTE.slice(0, 5).map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`w-8 h-8 rounded-full hover:scale-110 transition-transform ${newTagColor === color
                                                    ? 'border-2 border-white dark:border-gray-900 shadow-md'
                                                    : 'border border-transparent'
                                                } ${color === '#FFFFFF' ? 'border border-gray-300' : ''}`}
                                            style={{
                                                backgroundColor: color,
                                                boxShadow: newTagColor === color
                                                    ? `0 0 0 2px ${color === '#FFFFFF' ? '#000000' : color}`
                                                    : 'none',
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setNewTagColor(color);
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="grid grid-cols-5 gap-3">
                                    {COLOR_PALETTE.slice(5, 10).map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`w-8 h-8 rounded-full hover:scale-110 transition-transform ${newTagColor === color
                                                    ? 'border-2 border-white dark:border-gray-900 shadow-md'
                                                    : 'border border-transparent'
                                                }`}
                                            style={{
                                                backgroundColor: color,
                                                boxShadow: newTagColor === color
                                                    ? `0 0 0 2px ${color}`
                                                    : 'none',
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setNewTagColor(color);
                                            }}
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
                    {availableTags.length === 0 ? (
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
                                        onClick={() => {
                                            onToggleTag(tag.id);
                                            setTagSearch('');
                                        }}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: tag.color }}
                                        />
                                        <span>{tag.name}</span>
                                        {tags.includes(tag.id) && (
                                            <Check className="ml-auto h-4 w-4" />
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderTagBadges = (tags: string[], onRemoveTag: (tagId: string) => void) => {
        return (
            <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tagId => {
                    const tag = availableTags.find(t => t.id === tagId);
                    return tag ? (
                        <Badge
                            key={tag.id}
                            className="flex items-center pr-1"
                            style={{ backgroundColor: tag.color }}
                        >
                            #{tag.name}
                            <button
                                type="button"
                                onClick={() => onRemoveTag(tag.id)}
                                className="ml-1"
                            >
                                <Minus className="h-3 w-3" />
                            </button>
                        </Badge>
                    ) : null;
                })}
            </div>
        );
    };

    return (
        <AppLayout>
            <Toaster position="top-center" richColors />
            <Head title="Створення завдань" />

            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <Link href={`/boards/${board_id}`} className="flex items-center text-sm text-muted-foreground hover:text-primary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Назад
                    </Link>
                </div>

                {errors.message && (
                    toast.error(errors.message)
                )}

                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex rounded-md shadow-sm" role="group">
                            <Button
                                variant={mode === 'task' ? 'default' : 'outline'}
                                onClick={() => setMode('task')}
                                className="rounded-r-none"
                            >
                                Нове завдання
                            </Button>
                            <Button
                                variant={mode === 'subtasks' ? 'default' : 'outline'}
                                onClick={() => setMode('subtasks')}
                                className="rounded-l-none"
                            >
                                Група підзавдань
                            </Button>
                        </div>
                    </div>

                    <form onSubmit={submit}>
                        <div className="space-y-6">
                            {mode === 'subtasks' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Основне завдання *</label>
                                    <Select
                                        value={selectedTask}
                                        onValueChange={handleSetSelectedTask}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={
                                                availableParentTasks.length === 0 
                                                    ? "Немає активних завдань" 
                                                    : "Оберіть завдання"
                                            } />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableParentTasks.length === 0 ? (
                                                <div className="text-sm text-muted-foreground py-2 text-center">
                                                    Усі завдання завершені або відсутні
                                                </div>
                                            ) : (
                                                availableParentTasks.map((task) => (
                                                    <SelectItem key={task.id} value={task.id}>
                                                        <div className="flex items-center">
                                                            <List className="h-4 w-4 mr-2" />
                                                            {task.title}
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {mode === 'task' && (
                                <div className="space-y-4">
                                    <h1 className="text-2xl font-bold">Створення завдання</h1>

                                    <div>
                                        <Input
                                            value={taskData.title}
                                            onChange={(e) => handleTaskDataChange('title', e.target.value)}
                                            placeholder="Назва завдання"
                                            className="text-xl"
                                        />
                                    </div>

                                    <div>
                                        <style>{quillStyles}</style>
                                        <ReactQuill
                                            value={taskData.description}
                                            onChange={(value) => handleTaskDataChange('description', value)}
                                            modules={{
                                                toolbar: [
                                                    ['bold', 'italic', 'underline'],
                                                    ['link'],
                                                    [{ list: 'ordered' }, { list: 'bullet' }],
                                                ],
                                            }}
                                            formats={['bold', 'italic', 'underline', 'link', 'list', 'bullet']}
                                            theme="snow"
                                            style={{ marginBottom: '8px' }}
                                        />
                                        <div className="text-xs text-muted-foreground mt-1 text-right">
                                            {taskData.description.replace(/<[^>]*>/g, '').length}/1000 символів
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Початкова дата *</label>
                                            <div className="flex gap-2">
                                                <div className="flex-1 flex gap-2">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="w-[462px] justify-start text-left font-normal"
                                                            >
                                                                <CalendarIcon className="h-4 w-4 mr-2" />
                                                                {taskData.start_date ? format(new Date(taskData.start_date), 'PPP') : 'Оберіть дату'}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <CalendarMainTask type="start" />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <Select
                                                        value={taskData.start_date ? format(new Date(taskData.start_date), 'HH') : '--'}
                                                        onValueChange={(hour) => {
                                                            if (hour !== '--') {
                                                                if (taskData.start_date) {
                                                                    const newDate = new Date(taskData.start_date);
                                                                    newDate.setHours(parseInt(hour));
                                                                    handleTaskDataChange('start_date', newDate.toISOString());
                                                                } else {
                                                                    const newDate = new Date();
                                                                    newDate.setHours(parseInt(hour));
                                                                    newDate.setMinutes(0);
                                                                    handleTaskDataChange('start_date', newDate.toISOString());
                                                                }
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
                                                        value={taskData.start_date ? format(new Date(taskData.start_date), 'mm') : '--'}
                                                        onValueChange={(minute) => {
                                                            if (minute !== '--' && taskData.start_date) {
                                                                const newDate = new Date(taskData.start_date);
                                                                newDate.setMinutes(parseInt(minute));
                                                                handleTaskDataChange('start_date', newDate.toISOString());
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
                                                    onClick={resetTaskStartDate}
                                                    disabled={!taskData.start_date}
                                                    className="px-3"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Кінцева дата *</label>
                                            <div className="flex gap-2">
                                                <div className="flex-1 flex gap-2">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="w-[462px] justify-start text-left font-normal"
                                                            >
                                                                <CalendarIcon className="h-4 w-4 mr-2" />
                                                                {taskData.end_date ? format(new Date(taskData.end_date), 'PPP') : 'Оберіть дату'}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <CalendarMainTask type="end" />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <Select
                                                        value={taskData.end_date ? format(new Date(taskData.end_date), 'HH') : '--'}
                                                        onValueChange={(hour) => {
                                                            if (hour !== '--') {
                                                                if (taskData.end_date) {
                                                                    const newDate = new Date(taskData.end_date);
                                                                    newDate.setHours(parseInt(hour));
                                                                    handleTaskDataChange('end_date', newDate.toISOString());
                                                                } else {
                                                                    const newDate = new Date();
                                                                    newDate.setHours(parseInt(hour));
                                                                    newDate.setMinutes(0);
                                                                    handleTaskDataChange('end_date', newDate.toISOString());
                                                                }
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
                                                        value={taskData.end_date ? format(new Date(taskData.end_date), 'mm') : '--'}
                                                        onValueChange={(minute) => {
                                                            if (minute !== '--' && taskData.end_date) {
                                                                const newDate = new Date(taskData.end_date);
                                                                newDate.setMinutes(parseInt(minute));
                                                                handleTaskDataChange('end_date', newDate.toISOString());
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
                                                    onClick={resetTaskEndDate}
                                                    disabled={!taskData.end_date}
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
                                                value={taskData.priority}
                                                onValueChange={(value) => handleTaskDataChange('priority', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Оберіть пріоритет" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {priorityOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            <div className="flex items-center">
                                                                <Flag className={`h-4 w-4 mr-2 ${option.value === 'high' ? 'text-red-500' :
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
                                                value={taskData.risk}
                                                onValueChange={(value) => handleTaskDataChange('risk', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Оберіть ризик" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {riskOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            <div className="flex items-center">
                                                                <AlertCircle className={`h-4 w-4 mr-2 ${option.value === 'high' ? 'text-red-500' :
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
                                        <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start">
                                                    <Tag className="h-4 w-4 mr-2" />
                                                    {selectedTags.length > 0
                                                        ? `${selectedTags.length} обрано`
                                                        : 'Оберіть теги'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent ref={popoverRef} className="w-[300px] p-2">
                                                {renderTagSelector(selectedTags, toggleTag)}
                                            </PopoverContent>
                                        </Popover>
                                        {renderTagBadges(selectedTags, toggleTag)}
                                    </div>
                                </div>
                            )}

                            {mode === 'subtasks' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">Підзадачі</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addSubtask}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Додати підзадачу
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {subtasks.map((subtask, index) => (
                                            <div key={index} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-medium">
                                                        Підзадача {index + 1}
                                                    </span>
                                                    {subtasks.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-600"
                                                            onClick={() => removeSubtask(index)}
                                                        >
                                                            <Minus className="h-4 w-4 mr-1" />
                                                            Видалити
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <Input
                                                            value={subtask.title}
                                                            onChange={(e) => updateSubtask(index, 'title', e.target.value)}
                                                            placeholder="Назва підзадачі"
                                                        />
                                                    </div>

                                                    <div>
                                                        <style>{quillStyles}</style>
                                                        <ReactQuill
                                                            value={subtask.description}
                                                            onChange={(value) => updateSubtask(index, 'description', value)}
                                                            modules={{
                                                                toolbar: [
                                                                    ['bold', 'italic', 'underline'],
                                                                    ['link'],
                                                                    [{ list: 'ordered' }, { list: 'bullet' }],
                                                                ],
                                                            }}
                                                            formats={['bold', 'italic', 'underline', 'link', 'list', 'bullet']}
                                                            theme="snow"
                                                            style={{ marginBottom: '8px' }}
                                                        />
                                                        <div className="text-xs text-muted-foreground mt-1 text-right">
                                                            {subtask.description.replace(/<[^>]*>/g, '').length}/1000 символів
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Початкова дата *</label>
                                                            <div className="flex gap-2">
                                                                <div className="flex-1 flex gap-2">
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                className="w-[428px] justify-start text-left font-normal"
                                                                            >
                                                                                <CalendarIcon className="h-4 w-4 mr-2" />
                                                                                {subtask.start_date ? format(new Date(subtask.start_date), 'PPP') : 'Оберіть дату'}
                                                                            </Button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="w-auto p-0">
                                                                            <CalendarSubtask index={index} type="start" />
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                    <Select
                                                                        value={subtask.start_date ? format(new Date(subtask.start_date), 'HH') : '--'}
                                                                        onValueChange={(hour) => {
                                                                            if (hour !== '--') {
                                                                                if (subtask.start_date) {
                                                                                    const newDate = new Date(subtask.start_date);
                                                                                    newDate.setHours(parseInt(hour));
                                                                                    updateSubtask(index, 'start_date', newDate.toISOString());
                                                                                } else {
                                                                                    const newDate = new Date();
                                                                                    newDate.setHours(parseInt(hour));
                                                                                    newDate.setMinutes(0);
                                                                                    updateSubtask(index, 'start_date', newDate.toISOString());
                                                                                }
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
                                                                        value={subtask.start_date ? format(new Date(subtask.start_date), 'mm') : '--'}
                                                                        onValueChange={(minute) => {
                                                                            if (minute !== '--' && subtask.start_date) {
                                                                                const newDate = new Date(subtask.start_date);
                                                                                newDate.setMinutes(parseInt(minute));
                                                                                updateSubtask(index, 'start_date', newDate.toISOString());
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
                                                                    onClick={() => resetSubtaskStartDate(index)}
                                                                    disabled={!subtask.start_date}
                                                                    className="px-3"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Кінцева дата *</label>
                                                            <div className="flex gap-2">
                                                                <div className="flex-1 flex gap-2">
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                className="w-[428px] justify-start text-left font-normal"
                                                                            >
                                                                                <CalendarIcon className="h-4 w-4 mr-2" />
                                                                                {subtask.end_date ? format(new Date(subtask.end_date), 'PPP') : 'Оберіть дату'}
                                                                            </Button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="w-auto p-0">
                                                                            <CalendarSubtask index={index} type="end" />
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                    <Select
                                                                        value={subtask.end_date ? format(new Date(subtask.end_date), 'HH') : '--'}
                                                                        onValueChange={(hour) => {
                                                                            if (hour !== '--') {
                                                                                if (subtask.end_date) {
                                                                                    const newDate = new Date(subtask.end_date);
                                                                                    newDate.setHours(parseInt(hour));
                                                                                    updateSubtask(index, 'end_date', newDate.toISOString());
                                                                                } else {
                                                                                    const newDate = new Date();
                                                                                    newDate.setHours(parseInt(hour));
                                                                                    newDate.setMinutes(0);
                                                                                    updateSubtask(index, 'end_date', newDate.toISOString());
                                                                                }
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
                                                                        value={subtask.end_date ? format(new Date(subtask.end_date), 'mm') : '--'}
                                                                        onValueChange={(minute) => {
                                                                            if (minute !== '--' && subtask.end_date) {
                                                                                const newDate = new Date(subtask.end_date);
                                                                                newDate.setMinutes(parseInt(minute));
                                                                                updateSubtask(index, 'end_date', newDate.toISOString());
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
                                                                    onClick={() => resetSubtaskEndDate(index)}
                                                                    disabled={!subtask.end_date}
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
                                                                value={subtask.priority}
                                                                onValueChange={(value) => updateSubtask(index, 'priority', value)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Оберіть пріоритет" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {priorityOptions.map((option) => (
                                                                        <SelectItem key={option.value} value={option.value}>
                                                                            <div className="flex items-center">
                                                                                <Flag className={`h-4 w-4 mr-2 ${option.value === 'high' ? 'text-red-500' :
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
                                                                value={subtask.risk}
                                                                onValueChange={(value) => updateSubtask(index, 'risk', value)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Оберіть ризик" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {riskOptions.map((option) => (
                                                                        <SelectItem key={option.value} value={option.value}>
                                                                            <div className="flex items-center">
                                                                                <AlertCircle className={`h-4 w-4 mr-2 ${option.value === 'high' ? 'text-red-500' :
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
                                                        <label className="block text-sm font-medium mb-1">Теги підзадачі</label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="outline" className="w-full justify-start">
                                                                    <Tag className="h-4 w-4 mr-2" />
                                                                    {subtask.tags.length > 0
                                                                        ? `${subtask.tags.length} обрано`
                                                                        : 'Оберіть теги'}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-[300px] p-2">
                                                                {renderTagSelector(subtask.tags, (tagId) => toggleSubtaskTag(index, tagId))}
                                                            </PopoverContent>
                                                        </Popover>
                                                        {renderTagBadges(subtask.tags, (tagId) => toggleSubtaskTag(index, tagId))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={isProcessing}>
                                    {mode === 'task' ? 'Створити завдання' : 'Створити підзадачі'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}