
import React, { useState } from "react";
import { Plus, Calendar, Clock, Star, Trash2, Pin, ListChecks } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { motion } from "motion/react";

// Local interface reflecting the data structure for a new task
interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

interface NewTaskData {
  title: string;
  listId: number;
  dueDate: Date;
  startTime: string;
  duration: number;
  isFixed: boolean;
  completed: boolean;
  important: boolean;
  notes: string;
  subtasks: Subtask[];
}

interface TaskList {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface AddTaskDrawerProps {
  taskLists: TaskList[];
  initialDueDate?: Date;
  onClose: () => void;
  onAddTask: (task: Omit<NewTaskData, 'completed'>) => void;
}

export default function AddTaskDrawer({
  taskLists,
  initialDueDate,
  onClose,
  onAddTask,
}: AddTaskDrawerProps) {
  const [newTask, setNewTask] = useState<NewTaskData>({
    title: "",
    listId: taskLists[0]?.id || 1,
    dueDate: initialDueDate || new Date(),
    startTime: "",
    duration: 60,
    isFixed: false,
    completed: false,
    important: false,
    notes: "",
    subtasks: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    const finalSubtasks = newTask.subtasks
      .map((sub, index) => ({ ...sub, id: index }))
      .filter(sub => sub.title.trim() !== '');

    const { completed, ...taskData } = newTask;

    onAddTask({
      ...taskData,
      title: newTask.title.trim(),
      notes: newTask.notes.trim(),
      subtasks: finalSubtasks,
    });
    
    onClose();
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const updatedSubtasks = [...newTask.subtasks];
    updatedSubtasks[index].title = value;
    setNewTask(prev => ({ ...prev, subtasks: updatedSubtasks }));
  };

  const addSubtask = () => {
    setNewTask(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { id: Date.now(), title: '', completed: false }],
    }));
  };

  const removeSubtask = (index: number) => {
    const updatedSubtasks = newTask.subtasks.filter((_, i) => i !== index);
    setNewTask(prev => ({ ...prev, subtasks: updatedSubtasks }));
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (dateString: string) => {
    const date = new Date(dateString);
    const timeZoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + timeZoneOffset);
    setNewTask(prev => ({ ...prev, dueDate: adjustedDate }));
  };

  const selectedList = taskLists.find(list => list.id === newTask.listId);

  return (
    <motion.div
      className="absolute inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Plus className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-medium">Add New Task</h1>
              <p className="text-sm text-gray-500">Create a new task</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What needs to be done?"
                className="text-xl font-medium border-none p-0 h-auto focus-visible:ring-0 shadow-none py-2"
                required
              />
            </div>
            <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="list">List</Label>
                  <Select
                    value={newTask.listId.toString()}
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, listId: parseInt(value) }))}
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue>
                        {selectedList && (
                          <div className="flex items-center gap-2">
                            <span>{selectedList.icon}</span>
                            <span>{selectedList.name}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {taskLists.map((list) => (
                        <SelectItem key={list.id} value={list.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{list.icon}</span>
                            <span>{list.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formatDateForInput(newTask.dueDate)}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="mt-1 bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newTask.startTime}
                    onChange={(e) => setNewTask(prev => ({ ...prev, startTime: e.target.value }))}
                    className="mt-1 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newTask.duration}
                    onChange={(e) => setNewTask(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    className="mt-1 bg-white"
                    min="1"
                    step="15"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="important"
                    checked={newTask.important}
                    onCheckedChange={(checked) => setNewTask(prev => ({ ...prev, important: checked }))}
                  />
                  <Label htmlFor="important" className="flex items-center gap-1 text-sm cursor-pointer">
                    <Star className={`h-4 w-4 transition-colors ${newTask.important ? 'text-yellow-500 fill-yellow-400' : 'text-gray-400'}`} />
                    Important
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFixed"
                    checked={newTask.isFixed}
                    onCheckedChange={(checked) => setNewTask(prev => ({ ...prev, isFixed: checked }))}
                  />
                  <Label htmlFor="isFixed" className="flex items-center gap-1 text-sm cursor-pointer">
                    <Pin className="h-4 w-4 text-gray-500" />
                    Fixed Time
                  </Label>
                </div>
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-600">
                <ListChecks className="h-4 w-4 text-gray-500" />
                Subtasks
              </Label>
              <div className="space-y-2">
                {newTask.subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={subtask.title}
                      onChange={(e) => handleSubtaskChange(index, e.target.value)}
                      placeholder={`Subtask ${index + 1}`}
                      className="flex-1 bg-gray-50"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSubtask(index)}>
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-dashed" 
                  onClick={addSubtask}
                  disabled={newTask.subtasks.length > 0 && newTask.subtasks[newTask.subtasks.length - 1].title.trim() === ''}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subtask
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newTask.notes}
                onChange={(e) => setNewTask(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes..."
                className="mt-1 bg-gray-50"
                rows={4}
              />
            </div>
            <div className="flex gap-3 pt-6 border-t">
              <Button 
                type="submit" 
                className="flex-1"
                style={{ backgroundColor: selectedList?.color }}
                disabled={!newTask.title.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
