import React from "react";
import "gantt-task-react/dist/index.css";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';

interface TaskData {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies: string;
  status: string;
  priority: string;
}

interface Props extends PageProps {
  tasks: TaskData[];
}

const ukrainianLocale = {
  name: "Українська",
  weekdays: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  months: [
    "Січень", "Лютий", "Березень", "Квітень", 
    "Травень", "Червень", "Липень", "Серпень",
    "Вересень", "Жовтень", "Листопад", "Грудень"
  ],
  today: "Сьогодні",
  noData: "Немає даних",
  scale: {
    day: "День",
    week: "Тиждень",
    month: "Місяць",
    quarter: "Квартал",
    year: "Рік"
  }
};

const GanttChart: React.FC<Props> = ({ tasks }) => {
  const filteredTasks = tasks.filter(task => task.start && task.end);

  const getTaskColor = (status: string, priority: string) => {
    if (status === 'completed') return '#10B981';
    if (status === 'overdue') return '#EF4444';
    
    switch(priority) {
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const ganttTasks: GanttTask[] = filteredTasks.map(task => {
    const color = getTaskColor(task.status, task.priority);
    
    return {
      id: task.id,
      name: task.name,
      start: new Date(task.start),
      end: new Date(task.end),
      type: "task",
      progress: task.progress,
      dependencies: task.dependencies ? task.dependencies.split(',') : [],
      isDisabled: false,
      styles: {
        progressColor: color,
        progressSelectedColor: color,
        backgroundColor: color,
        backgroundSelectedColor: color,
        progressInsideColor: '#FFFFFF',
      }
    };
  });

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-white">Діаграма Ганта</h1>
        {ganttTasks.length ? (
          <div className="rounded-xl shadow-lg bg-gray-900 p-4">
            
            
            <Gantt 
              tasks={ganttTasks} 
              viewMode={ViewMode.Day}
              locale={ukrainianLocale}
              barCornerRadius={4}
              barProgressColor="#FFFFFF80"
              barProgressSelectedColor="#FFFFFF"
              tooltipContent={(task) => (
                <div className="p-2 bg-gray-800 text-white rounded shadow-lg">
                  <div className="font-bold">{task.name}</div>
                  <div>Початок: {task.start.toLocaleDateString('uk-UA')}</div>
                  <div>Кінець: {task.end.toLocaleDateString('uk-UA')}</div>
                  <div>Прогрес: {task.progress}%</div>
                  <div>Статус: {task.status}</div>
                </div>
              )}
            />
          </div>
        ) : (
          <p className="text-gray-400">Завдань для відображення немає.</p>
        )}
      </div>
    </AppLayout>
  );
};

export default GanttChart;