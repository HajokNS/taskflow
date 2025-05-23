import { Link } from '@inertiajs/react'
import { Badge } from '@/components/ui/badge'

export function TaskCard({ task }) {
  const hasDateRange = task.start_date && task.end_date
  const isOverdue = task.end_date && new Date(task.end_date) < new Date()

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
          <Badge variant={task.priority}>
            {task.priority}
          </Badge>
        </div>
        
        {task.description && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {task.tags?.map((tag) => (
              <span 
                key={tag.id}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
          
          {(task.start_date || task.end_date) && (
            <span className={`text-xs ${
              isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {hasDateRange ? (
                `${new Date(task.start_date).toLocaleDateString()} - ${new Date(task.end_date).toLocaleDateString()}`
              ) : (
                task.end_date 
                  ? new Date(task.end_date).toLocaleDateString()
                  : new Date(task.start_date).toLocaleDateString()
              )}
              {isOverdue && ' (overdue)'}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}