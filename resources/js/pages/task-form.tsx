import { Head, Link, useForm, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { ArrowLeft, Plus, Minus, Calendar as CalendarIcon, Tag, AlertCircle, Flag, Check, List, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { log } from 'console'

export default function TaskCreator() {
    const { props } = usePage()
    const board_id = props.board_id || ''
    const availableTags = props.tags || []
    const availableTasks = props.tasks || []
  
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'))
  
    const [mode, setMode] = useState<'task' | 'subtasks'>('task')
    const [selectedTask, setSelectedTask] = useState('')
    const [subtasks, setSubtasks] = useState([{ 
      title: '', 
      deadline: '',
      priority: 'medium',
      risk: 'low',
      status: 'active',
      description: ''
    }])
  
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [tagSearch, setTagSearch] = useState('')
    const [tagsOpen, setTagsOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
  
    const { data, setData, post, processing, errors } = useForm({
      board_id: board_id,
      parent_id: null,
      title: '',
      description: '',
      deadline: '',
      priority: 'medium',
      risk: 'low',
      status: 'active',
      is_completed: false,
      tags: [],
    })

  const statusOptions = [
    { value: 'active', label: 'Активне' },
    { value: 'completed', label: 'Завершене' },
    { value: 'archived', label: 'Архівоване' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Низький' },
    { value: 'medium', label: 'Середній' },
    { value: 'high', label: 'Високий' }
  ]

  const riskOptions = [
    { value: 'low', label: 'Низький' },
    { value: 'medium', label: 'Середній' },
    { value: 'high', label: 'Високий' }
  ]

  const addSubtask = () => {
    setSubtasks([...subtasks, { 
      title: '', 
      deadline: '',
      priority: 'medium',
      risk: 'low',
      status: 'active',
      description: ''
    }])
  }

  const handleSetSelectedTask = (id: string) => {
        setMode('subtasks');
        setSelectedTask(id);
  }

  const removeSubtask = (index: number) => {
    if (subtasks.length <= 1) return
    const newSubtasks = [...subtasks]
    newSubtasks.splice(index, 1)
    setSubtasks(newSubtasks)
  }

  const updateSubtask = (index: number, field: string, value: any) => {
    const newSubtasks = [...subtasks]
    newSubtasks[index][field] = value
    setSubtasks(newSubtasks)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    )
  }

  const resetDeadline = () => {
    setData('deadline', '')
  }

  const resetSubtaskDeadline = (index: number) => {
    updateSubtask(index, 'deadline', '')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      if (mode === 'task') {
        // Створення основного завдання
        await post(route('tasks.store'), {
          ...data,
          is_completed: data.status === 'completed',
          tags: selectedTags,
          parent_id: null,
        })
      } else if (mode === 'subtasks' && selectedTask) {
        // Створення підзавдань окремими запитами
        for (const subtask of subtasks) {
            console.log(selectedTask);
          await post(route('tasks.store'), {
            title: subtask.title,
            description: subtask.description,
            deadline: subtask.deadline,
            priority: subtask.priority,
            risk: subtask.risk,
            status: subtask.status,
            is_completed: subtask.status === 'completed',
            board_id: board_id,
            tags: selectedTags,
            parent_id: selectedTask,
          })
        }
      }
      
      window.location.href = `/boards/${board_id}`
    } catch (error) {
      console.error('Помилка при створенні завдання:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <AppLayout>
      <Head title="Створення завдань" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href={`/boards/${board_id}`} className="flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Link>
        </div>

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
                  <label className="block text-sm font-medium mb-1">Основне завдання</label>
                  <Select
                    value={selectedTask}
                    onValueChange={handleSetSelectedTask}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть завдання" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          <div className="flex items-center">
                            <List className="h-4 w-4 mr-2" />
                            {task.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {mode === 'task' && (
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold">Створення завдання</h1>
                  
                  <div>
                    <Input
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      placeholder="Назва завдання"
                      className="text-xl"
                      required={mode === 'task'}
                    />
                    {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <Textarea
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Опис завдання"
                      className="min-h-[100px]"
                    />
                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Дедлайн</label>
                      <div className="flex gap-2">
                        <div className="flex-1 flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-[462px] justify-start text-left font-normal"
                              >
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                {data.deadline ? format(new Date(data.deadline), 'PPP') : 'Оберіть дату'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={data.deadline ? new Date(data.deadline) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    const newDate = new Date(date);
                                    if (data.deadline) {
                                      const prevDate = new Date(data.deadline);
                                      newDate.setHours(prevDate.getHours());
                                      newDate.setMinutes(prevDate.getMinutes());
                                    }
                                    setData('deadline', newDate.toISOString());
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <Select
                            value={data.deadline ? format(new Date(data.deadline), 'HH') : '--'}
                            onValueChange={(hour) => {
                              if (hour !== '--') {
                                if (data.deadline) {
                                  const newDate = new Date(data.deadline);
                                  newDate.setHours(parseInt(hour));
                                  setData('deadline', newDate.toISOString());
                                } else {
                                  const newDate = new Date();
                                  newDate.setHours(parseInt(hour));
                                  newDate.setMinutes(0);
                                  setData('deadline', newDate.toISOString());
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
                            value={data.deadline ? format(new Date(data.deadline), 'mm') : '--'}
                            onValueChange={(minute) => {
                              if (minute !== '--' && data.deadline) {
                                const newDate = new Date(data.deadline);
                                newDate.setMinutes(parseInt(minute));
                                setData('deadline', newDate.toISOString());
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
                          onClick={resetDeadline}
                          disabled={!data.deadline}
                          className="px-3"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {errors.deadline && <p className="text-sm text-red-500 mt-1">{errors.deadline}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Статус</label>
                      <Select
                        value={data.status}
                        onValueChange={(value) => setData('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть статус" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Пріоритет</label>
                      <Select
                        value={data.priority}
                        onValueChange={(value) => setData('priority', value)}
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
                      {errors.priority && <p className="text-sm text-red-500 mt-1">{errors.priority}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Ризик</label>
                      <Select
                        value={data.risk}
                        onValueChange={(value) => setData('risk', value)}
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
                      {errors.risk && <p className="text-sm text-red-500 mt-1">{errors.risk}</p>}
                    </div>
                  </div>
                </div>
              )}

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
                  <PopoverContent className="w-[300px] p-2">
                    <div className="space-y-2">
                      <Input
                        placeholder="Пошук тегів..."
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        className="mb-2"
                      />
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
                                    toggleTag(tag.id)
                                    setTagSearch('')
                                  }}
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
                    const tag = availableTags.find(t => t.id === tagId)
                    return tag ? (
                      <Badge 
                        key={tag.id} 
                        className="flex items-center"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                        <button 
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className="ml-1"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
                {errors.tags && <p className="text-sm text-red-500 mt-1">{errors.tags}</p>}
              </div>

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
                          <Input
                            value={subtask.title}
                            onChange={(e) => updateSubtask(index, 'title', e.target.value)}
                            placeholder="Назва підзадачі"
                            required
                          />
                          {errors[`subtasks.${index}.title`] && (
                            <p className="text-sm text-red-500">{errors[`subtasks.${index}.title`]}</p>
                          )}

                          <Textarea
                            value={subtask.description}
                            onChange={(e) => updateSubtask(index, 'description', e.target.value)}
                            placeholder="Опис підзадачі"
                            className="min-h-[80px]"
                          />

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Статус</label>
                              <Select
                                value={subtask.status}
                                onValueChange={(value) => updateSubtask(index, 'status', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Оберіть статус" />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

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

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Дедлайн</label>
                              <div className="flex gap-2">
                                <div className="flex-1 flex gap-2">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-[428px] justify-start text-left font-normal"
                                      >
                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                        {subtask.deadline ? format(new Date(subtask.deadline), 'PPP') : 'Оберіть дату'}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={subtask.deadline ? new Date(subtask.deadline) : undefined}
                                        onSelect={(date) => {
                                          if (date) {
                                            const newDate = new Date(date);
                                            if (subtask.deadline) {
                                              const prevDate = new Date(subtask.deadline);
                                              newDate.setHours(prevDate.getHours());
                                              newDate.setMinutes(prevDate.getMinutes());
                                            }
                                            updateSubtask(index, 'deadline', newDate.toISOString());
                                          }
                                        }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <Select
                                    value={subtask.deadline ? format(new Date(subtask.deadline), 'HH') : '--'}
                                    onValueChange={(hour) => {
                                      if (hour !== '--') {
                                        if (subtask.deadline) {
                                          const newDate = new Date(subtask.deadline);
                                          newDate.setHours(parseInt(hour));
                                          updateSubtask(index, 'deadline', newDate.toISOString());
                                        } else {
                                          const newDate = new Date();
                                          newDate.setHours(parseInt(hour));
                                          newDate.setMinutes(0);
                                          updateSubtask(index, 'deadline', newDate.toISOString());
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
                                    value={subtask.deadline ? format(new Date(subtask.deadline), 'mm') : '--'}
                                    onValueChange={(minute) => {
                                      if (minute !== '--' && subtask.deadline) {
                                        const newDate = new Date(subtask.deadline);
                                        newDate.setMinutes(parseInt(minute));
                                        updateSubtask(index, 'deadline', newDate.toISOString());
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
                                  onClick={() => resetSubtaskDeadline(index)}
                                  disabled={!subtask.deadline}
                                  className="px-3"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={processing}>
                  {mode === 'task' ? 'Створити завдання' : 'Створити підзадачі'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}