import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Plus, Star, Search, X, Filter } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import DOMPurify from 'dompurify';

interface Board {
  id: string;
  title: string;
  description?: string;
  is_favorite: boolean;
  color: string;
  updated_at: string;
  created_at: string;
}

interface Props extends PageProps {
  boards: Board[];
  favorites: Board[];
  filters?: {
    search?: string;
    sort?: 'title_asc' | 'title_desc' | 'date_asc' | 'date_desc';
  };
}

export default function Boards({ boards, favorites, filters = {} }: Props) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [sortValue, setSortValue] = useState(filters.sort || null);
  const [isSearching, setIsSearching] = useState(false);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (searchValue) params.append('search', searchValue);
    if (sortValue) params.append('sort', sortValue);

    router.get(`/boards?${params.toString()}`, {}, {
      preserveState: true,
      replace: true,
    });
    setIsSearching(false);
  }, [searchValue, sortValue]);

  useEffect(() => {
    if (isSearching) {
      const timer = setTimeout(updateUrl, 500);
      return () => clearTimeout(timer);
    }
  }, [isSearching, updateUrl]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setIsSearching(true);
  };

  const handleSortChange = (sortType: 'title_asc' | 'title_desc' | 'date_asc' | 'date_desc') => {
    setSortValue(sortType === sortValue ? null : sortType);
    setIsSearching(true);
  };

  const clearSearch = () => {
    setSearchValue('');
    setIsSearching(true);
  };

  const clearSort = () => {
    setSortValue(null);
    setIsSearching(true);
  };

  const clearAllFilters = () => {
    setSearchValue('');
    setSortValue(null);
    router.get('/boards', {}, {
      preserveState: true,
      replace: true,
    });
  };

  const getContrastText = (bgColor: string) => {
    if (!bgColor) return '#000000';
    const color = bgColor.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 150 ? '#000000' : '#FFFFFF';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('uk-UA')} ${date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <AppLayout>
      <Head title="Мої дошки" />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Мої дошки</h1>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0 md:w-64">
              <Input
                placeholder="Пошук дошок..."
                className="pl-10"
                value={searchValue}
                onChange={handleSearchChange}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {searchValue && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Фільтри
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <div className="px-2 py-1.5 text-sm font-semibold">Сортування</div>
                <DropdownMenuItem
                  onClick={() => handleSortChange('title_asc')}
                  className={sortValue === 'title_asc' ? 'bg-accent' : ''}
                >
                  За назвою (А-Я)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSortChange('title_desc')}
                  className={sortValue === 'title_desc' ? 'bg-accent' : ''}
                >
                  За назвою (Я-А)
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem
                  onClick={() => handleSortChange('date_asc')}
                  className={sortValue === 'date_asc' ? 'bg-accent' : ''}
                >
                  За датою (старі → нові)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSortChange('date_desc')}
                  className={sortValue === 'date_desc' ? 'bg-accent' : ''}
                >
                  За датою (нові → старі)
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem onClick={clearAllFilters}>
                  Скинути фільтри
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {(searchValue || sortValue) && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Активні фільтри:</span>
            {searchValue && (
              <Badge variant="secondary" className="gap-1">
                Пошук: "{searchValue}"
                <button onClick={clearSearch} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {sortValue && (
              <Badge variant="secondary" className="gap-1">
                {getSortLabel(sortValue)}
                <button onClick={clearSort} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {favorites.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              Улюблені
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favorites.map(board => (
                <BoardCard
                  key={board.id}
                  board={board}
                  getContrastText={getContrastText}
                  formatDateTime={formatDateTime}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Всі дошки</h2>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Link
              href={route('boards.create')}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary rounded-xl flex flex-col items-center justify-center min-h-[180px] transition-colors bg-white dark:bg-gray-800 group"
            >
              <div className="p-4 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                  <Plus className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-gray-600 dark:text-gray-400 font-medium group-hover:text-primary transition-colors">Нова дошка</span>
              </div>
            </Link>

            {boards.map(board => (
              <BoardCard
                key={board.id}
                board={board}
                getContrastText={getContrastText}
                formatDateTime={formatDateTime}
              />
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function getSortLabel(sortType: string) {
  switch (sortType) {
    case 'title_asc': return 'За назвою (А-Я)';
    case 'title_desc': return 'За назвою (Я-А)';
    case 'date_asc': return 'За датою (старі → нові)';
    case 'date_desc': return 'За датою (нові → старі)';
    default: return '';
  }
}

function BoardCard({ board, getContrastText, formatDateTime }: {
  board: Board,
  getContrastText: (color: string) => string,
  formatDateTime: (dateString: string) => string
}) {
  const textColor = getContrastText(board.color || '#ffffff');
  const secondaryTextStyle = {
    color: textColor,
    opacity: 0.7
  };

  const sanitizedDescription = DOMPurify.sanitize(board.description || '', {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });

  return (
    <Link
      href={`/boards/${board.id}`}
      className="flex flex-col rounded-xl shadow-sm hover:shadow-md transition-all duration-200 h-[180px] p-4 overflow-hidden group"
      style={{
        backgroundColor: board.color || '#ffffff',
        transform: 'translateY(0)',
      }}
    >
      <div className="flex justify-between items-start">
        <h3
          className="font-medium text-lg flex-1 pr-2 break-words"
          style={{
            color: textColor,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {board.title}
        </h3>
        <Star
          className="h-5 w-5 flex-shrink-0 transition-colors group-hover:opacity-100"
          style={board.is_favorite ? { color: '#facc15' } : { ...secondaryTextStyle, opacity: 0.5 }}
          fill={board.is_favorite ? 'currentColor' : 'none'}
        />
      </div>

      <div className="mt-2 flex-1 overflow-hidden">
        {board.description && (
          <div
            className="text-sm"
            style={{
              color: textColor,
              opacity: 0.9,
              overflow: 'hidden'
            }}
          >
            <style>{`
    .description-content p {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0 0 0.5rem;
    }
    .description-content ul {
      list-style-type: disc;
      padding-left: 1.25rem;
      margin: 0.5rem 0;
    }
    .description-content ol {
      list-style-type: decimal;
      padding-left: 1.25rem;
      margin: 0.5rem 0;
    }
    .description-content li {
      margin-bottom: 0.25rem;
    }
  `}</style>

            <div
              className="description-content"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          </div>
        )}
      </div>

      <div className="text-xs mt-auto text-right" style={secondaryTextStyle}>
        {formatDateTime(board.created_at)}
      </div>
    </Link>
  );
}