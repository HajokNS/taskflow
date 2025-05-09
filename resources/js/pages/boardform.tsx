import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Star, Lock, Clock, DollarSign } from 'lucide-react';
import DateRangePicker from '@/components/date-range-picker';
import { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Дошки',
    href: '/boards',
  },
  {
    title: 'Нова дошка',
    href: '#',
  },
];

const COLOR_PALETTE = [
     
  '#FFFFFF', '#000000', '#FF6900', '#FCB900', '#7BDCB5', 
  '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C', '#00D084'
];

export default function BoardFormPage() {
  const [startDate, setStartDate] = useState<Date>(new Date('2025-08-01'));
  const [endDate, setEndDate] = useState<Date>(new Date('2025-09-31'));
  const [isFavorite, setIsFavorite] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState(0);
  const [budget, setBudget] = useState(0);
  const [isPublic, setIsPublic] = useState(false);
  const [color, setColor] = useState('#FFFFFF');
  const [showColorPicker, setShowColorPicker] = useState(false);
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

  const handleDateChange = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    router.post('/boards', {
      title: boardTitle,
      description,
      is_favorite: isFavorite,
      is_public: isPublic,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      estimated_hours: hours,
      estimated_budget: budget,
      color,
    }, {
      onSuccess: () => {
        router.visit('/boards');
      },
      onError: (errors) => {
        console.error('Помилки при збереженні:', errors);
      }
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Нова дошка" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          {/* Заголовок */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Назва дошки"
                className="text-3xl font-bold text-gray-800 dark:text-white bg-transparent border-none focus:ring-0 px-0 w-full focus:border-b focus:border-gray-300 dark:focus:border-gray-500 focus:outline-none focus:rounded-none transition-all duration-200"
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                required
                onInvalid={(e) => {
                  (e.target as HTMLInputElement).setCustomValidity(' ');
                  (e.target as HTMLInputElement).reportValidity();
                  setTimeout(() => {
                    (e.target as HTMLInputElement).setCustomValidity('Будь ласка, введіть назву дошки');
                  }, 50);
                }}
                onInput={(e) => {
                  (e.target as HTMLInputElement).setCustomValidity('');
                }}
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
              
              {/* Модальне вікно вибору кольору */}
              {showColorPicker && (
        <div 
          ref={colorPickerRef}
          className="absolute top-full left-0 mt-2 z-10 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
          style={{ width: '220px' }}
        >
          <div className="flex flex-col gap-3">
            {/* Перший рядок з 5 кольорами */}
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
                  title={`Колір ${c === '#FFFFFF' ? 'білий' : c === '#000000' ? 'чорний' : c}`}
                />
              ))}
            </div>
            
            {/* Другий рядок з 5 кольорами */}
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
                  title={`Колір ${c}`}
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
              className="w-full min-h-[120px] p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Файли проекту</h3>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">Перетягніть файли сюди або</p>
                <button 
                  type="button"
                  className="text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Виберіть файли
                </button>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">PNG, JPG, PDF (до 10MB)</p>
              </div>
            </div>
          </section>

          {/* Секція термінів */}
          <section className="rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <span>Термін</span>
            </h2>
            <DateRangePicker 
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
            />
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
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:text-white"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  min="0"
                />
              </div>
              
              <div>
                <h3 className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <span>Бюджет ($)</span>
                </h3>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:text-white"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </section>

          {/* Налаштування доступу */}
          <section className="rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <Lock className="h-5 w-5 text-blue-500" />
              <span>Доступ</span>
            </h2>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  id="access-private" 
                  name="access" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:text-blue-400"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                />
                <label htmlFor="access-private" className="text-gray-700 dark:text-gray-300">
                  Приватна
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  id="access-public" 
                  name="access" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:text-blue-400"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                />
                <label htmlFor="access-public" className="text-gray-700 dark:text-gray-300">
                  Публічна
                </label>
              </div>
            </div>
          </section>

          {/* Кнопки дій */}
          <div className="flex justify-end gap-3">
            <button 
              type="button"
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Скасувати
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Зберегти дошку
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}