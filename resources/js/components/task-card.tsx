import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  start_date?: string;
  end_date?: string;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export function TaskCard({ task }: { task: Task }) {
  const isOverdue = task.end_date && new Date(task.end_date) < new Date() && task.status !== 'done';
  const hasDateRange = task.start_date && task.end_date;
  
  return (
    <Link href={route('tasks.show', task.id)}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{task.title}</h4>
            <Badge 
              variant={task.priority === 'high' ? 'destructive' : 
                      task.priority === 'medium' ? 'warning' : 'secondary'}
              className="text-xs"
            >
              {task.priority === 'high' ? 'Високий' : 
               task.priority === 'medium' ? 'Середній' : 'Низький'}
            </Badge>
          </div>
          
          {(task.start_date || task.end_date) && (
            <div className={`mt-2 text-xs ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
              {hasDateRange ? (
                <>
                  {format(new Date(task.start_date), 'd MMM yyyy', { locale: uk })} - {' '}
                  {format(new Date(task.end_date), 'd MMM yyyy', { locale: uk })}
                </>
              ) : (
                task.end_date 
                  ? format(new Date(task.end_date), 'd MMM yyyy', { locale: uk })
                  : format(new Date(task.start_date), 'd MMM yyyy', { locale: uk })
              )}
              {isOverdue && ' (протерміновано)'}
            </div>
          )}
          
          {task.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.tags.map(tag => (
                <Badge 
                  key={tag.id} 
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}