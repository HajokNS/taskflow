import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Star, Clock, DollarSign, Paperclip, Trash2, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Calendar } from '@/components/ui/calendar';
import { format, isBefore, differenceInDays, isSameDay, addDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Дошки',
    href: '/boards',
  },
];

const COLOR_PALETTE = [
  '#FFFFFF', '#000000', '#FF6900', '#FCB900', '#7BDCB5', 
  '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C', '#00D084'
];

export default function BoardFormPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(() => addDays(today, 7));
  const [isFavorite, setIsFavorite] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState(0);
  const [budget, setBudget] = useState(0);
  const [color, setColor] = useState('#FFFFFF');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDateChange = (type: 'start' | 'end', date: Date | undefined) => {
    if (!date) return;

    if (type === 'start') {
      if (isBefore(date, today)) {
        toast.error('Не можна встановити дату в минулому');
        return;
      }
      setStartDate(date);
      if (isBefore(endDate, date)) {
        setEndDate(date);
      }
    } else {
      if (isBefore(date, today)) {
        toast.error('Не можна встановити дату в минулому');
        return;
      }
      if (isBefore(date, startDate)) {
        toast.error('Дата завершення не може бути раніше дати початку');
        return;
      }
      setEndDate(date);
    }
  };

  const getDaysCount = () => {
    return differenceInDays(endDate, startDate) + 1;
  };

  const getDayText = (days: number) => {
    if (days % 10 === 1 && days % 100 !== 11) return 'день';
    if (days % 10 >= 2 && days % 10 <= 4 && (days % 100 < 10 || days % 100 >= 20)) return 'дні';
    return 'днів';
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.error(`Деякі файли перевищують 10MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
        return;
      }

      setFiles([...files, ...newFiles.filter(file => file.size <= 10 * 1024 * 1024)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      
      const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.error(`Деякі файли перевищують 10MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
        return;
      }

      setFiles([...files, ...newFiles.filter(file => file.size <= 10 * 1024 * 1024)]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!boardTitle.trim()) {
      newErrors.title = 'Назва дошки обов\'язкова';
      toast.error('Будь ласка, введіть назву дошки');
    } else if (boardTitle.length > 100) {
      newErrors.title = 'Назва не може перевищувати 100 символів';
      toast.error('Назва дошки занадто довга');
    }

    if (description.length > 1000) {
      newErrors.description = 'Опис не може перевищувати 1000 символів';
      toast.error('Опис занадто довгий');
    }

    if (hours < 0) {
      newErrors.hours = 'Години не можуть бути від\'ємними';
      toast.error('Години не можуть бути від\'ємними');
    }

    if (budget < 0) {
      newErrors.budget = 'Бюджет не може бути від\'ємним';
      toast.error('Бюджет не може бути від\'ємним');
    }

    if (files.length > 5) {
      newErrors.files = 'Максимально 5 файлів';
      toast.error('Можна додати не більше 5 файлів');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    
    formData.append('title', boardTitle);
    formData.append('description', description);
    formData.append('is_favorite', isFavorite ? '1' : '0');
    formData.append('start_date', startDate.toISOString().split('T')[0]);
    formData.append('end_date', endDate.toISOString().split('T')[0]);
    formData.append('estimated_hours', String(hours));
    formData.append('estimated_budget', String(budget));
    formData.append('color', color);
    
    files.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

    router.post('/boards', formData, {
      onSuccess: () => {
        toast.success('Дошку успішно створено');
        router.visit('/boards');
      },
      onError: (errors) => {
        console.error('Помилки при збереженні:', errors);
        setErrors(errors);
        toast.error('Сталася помилка при збереженні дошки');
        setIsSubmitting(false);
      },
      forceFormData: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Toaster position="top-center" richColors />
      <Head title="Нова дошка" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          {/* Заголовок */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Назва дошки *"
                className={`text-3xl font-bold text-gray-800 dark:text-white bg-transparent border-none focus:ring-0 px-0 w-full focus:border-b ${
                  errors.title ? 'border-b-red-500' : 'focus:border-gray-300 dark:focus:border-gray-500'
                } focus:outline-none focus:rounded-none transition-all duration-200`}
                value={boardTitle}
                onChange={(e) => {
                  setBoardTitle(e.target.value);
                  if (errors.title) setErrors({...errors, title: ''});
                }}
                maxLength={50}
              />
              
            </div>
            <div className="flex items-center gap-2 relative">
              <button 
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title="Вибрати колір"
              >
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: color }}
                />
              </button>
              
              {showColorPicker && (
                <div 
                  ref={colorPickerRef}
                  className="absolute top-full left-0 mt-2 z-10 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
                  style={{ width: '220px' }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-5 gap-3">
                      {COLOR_PALETTE.slice(0, 5).map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`w-8 h-8 rounded-full hover:scale-110 transition-transform ${
                            color === c 
                              ? 'border-2 border-white dark:border-gray-900 shadow-md' 
                              : 'border border-transparent'
                          } ${
                            c === '#FFFFFF' ? 'border border-gray-300' : ''
                          }`}
                          style={{ 
                            backgroundColor: c,
                            boxShadow: color === c ? `0 0 0 2px ${c === '#FFFFFF' ? '#000000' : c}` : 'none'
                          }}
                          onClick={() => {
                            setColor(c);
                            setShowColorPicker(false);
                          }}
                        />
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-5 gap-3">
                      {COLOR_PALETTE.slice(5, 10).map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`w-8 h-8 rounded-full hover:scale-110 transition-transform ${
                            color === c 
                              ? 'border-2 border-white dark:border-gray-900 shadow-md' 
                              : 'border border-transparent'
                          }`}
                          style={{ 
                            backgroundColor: c,
                            boxShadow: color === c ? `0 0 0 2px ${c}` : 'none'
                          }}
                          onClick={() => {
                            setColor(c);
                            setShowColorPicker(false);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <button 
                type="button"
                onClick={toggleFavorite}
                className={`transition-colors ${isFavorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'} dark:${isFavorite ? 'text-yellow-300' : 'text-gray-400 hover:text-yellow-300'}`}
              >
                <Star className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Секція опису */}
          <section className="rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <span>Опис проекту</span>
            </h2>
            <textarea
              placeholder="Додайте опис вашого проекту..."
              className={`w-full min-h-[120px] p-3 border ${
                errors.description ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:text-white`}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({...errors, description: ''});
              }}
            />
            <div className="flex justify-between mt-1">
              <div className="flex items-center">
                {errors.description && (
                  <div className="flex items-center text-sm text-red-500">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {description.length}/1000 символів
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Файли проекту</h3>
              
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx"
                />
                
                <Paperclip className="h-10 w-10 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  {isDragging ? 'Відпустіть файли для завантаження' : 'Перетягніть файли сюди або'}
                </p>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Виберіть файли
                </button>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">PNG, JPG, PDF, DOC, XLS (до 10MB)</p>
              </div>
              
              {errors.files && (
                <div className="flex items-center mt-2 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.files}
                </div>
              )}
              
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 p-1"
                        title="Видалити файл"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Секція термінів */}
          <section className="rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <span>Термін</span>
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Початок *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(startDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => handleDateChange('start', date)}
                      disabled={(date) => !isSameDay(date, today)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Завершення *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(endDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => handleDateChange('end', date)}
                      disabled={(date) => isBefore(date, today) || isBefore(date, startDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500 dark:text-white">
              Тривалість: {getDaysCount()} {getDayText(getDaysCount())}
            </div>
          </section>

          {/* Секція плану */}
          <section className="rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <span>План</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Години</span>
                </h3>
                <input
                  type="number"
                  className={`w-full p-2 border ${
                    errors.hours ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:text-white`}
                  value={hours}
                  onChange={(e) => {
                    setHours(Number(e.target.value));
                    if (errors.hours) setErrors({...errors, hours: ''});
                  }}
                />
                
              </div>
              
              <div>
                <h3 className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <span>Бюджет (грн)</span>
                </h3>
                <input
                  type="number"
                  className={`w-full p-2 border ${
                    errors.budget ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:text-white`}
                  value={budget}
                  onChange={(e) => {
                    setBudget(Number(e.target.value));
                    if (errors.budget) setErrors({...errors, budget: ''});
                  }}
                  step="1"
                />
                
              </div>
            </div>
          </section>

          {/* Кнопки дій */}
          <div className="flex justify-end gap-3">
            <button 
              type="button"
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              onClick={() => router.visit('/boards')}
            >
              Скасувати
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 min-w-32 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Збереження...
                </>
              ) : 'Зберегти дошку'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}