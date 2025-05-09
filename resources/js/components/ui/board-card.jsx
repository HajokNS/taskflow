import { Link } from '@inertiajs/react'
import { StarIcon } from '@heroicons/react/24/solid'

export default function BoardCard({ board }) {
  return (
    <Link
      href={`/boards/${board.id}`}
      className="group relative block h-40 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      style={{ backgroundColor: board.color || '#e5e7eb' }}
    >
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
      
      <div className="relative h-full flex flex-col p-4 text-white">
        <h3 className="text-lg font-semibold mb-1 truncate">{board.title}</h3>
        <p className="text-sm opacity-80 line-clamp-2 flex-grow">
          {board.description || 'No description'}
        </p>
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">
            {board.tasks_count} tasks
          </span>
          
          {board.is_favorite && (
            <StarIcon className="h-4 w-4 text-amber-400" />
          )}
        </div>
      </div>
    </Link>
  )
}