import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const colors = [
  { name: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-500' },
  { name: 'blue', bg: 'bg-blue-500', text: 'text-blue-500' },
  { name: 'green', bg: 'bg-green-500', text: 'text-green-500' },
  { name: 'yellow', bg: 'bg-yellow-500', text: 'text-yellow-500' },
  { name: 'red', bg: 'bg-red-500', text: 'text-red-500' },
  { name: 'purple', bg: 'bg-purple-500', text: 'text-purple-500' },
  { name: 'pink', bg: 'bg-pink-500', text: 'text-pink-500' },
  { name: 'gray', bg: 'bg-gray-500', text: 'text-gray-500' },
];

interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

export default function ColorPicker({ currentColor, onColorChange }: ColorPickerProps) {
  const selectedColor = colors.find(color => 
    currentColor.includes(color.name)
    || colors[0]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <div className={`w-5 h-5 ${selectedColor.bg} rounded-full`} />
          <span>Колір</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => onColorChange(`bg-${color.name}-50`)}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center",
                color.bg,
                selectedColor.name === color.name ? 'ring-2 ring-offset-2 ring-primary' : ''
              )}
              aria-label={`Select ${color.name} color`}
            >
              {selectedColor.name === color.name && (
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}