import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { formatINR } from '../utils/formatters';
import type { TaskItem, Team, TaskStatus } from '../types/game';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Flame,
  AlertCircle,
  Coins,
  Shield,
  Layers,
} from 'lucide-react';

export const TaskTracker: React.FC = () => {
  const {
    state,
    addTask,
    updateTaskName,
    updateTaskStatus,
    removeTask,
    reorderTasks,
    recordTaskPayment,
  } = useGame();

  const [activeTab, setActiveTab] = useState<Team>('workers');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // New task form state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskTeam, setNewTaskTeam] = useState<Team>('workers');

  // Edit task name state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskName, setEditingTaskName] = useState('');

  // Task payment control state
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [taskStatusChoice, setTaskStatusChoice] = useState<TaskStatus>('COMPLETED');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [allowDuplicatePayment, setAllowDuplicatePayment] = useState(false);

  // Filter tasks by team and sort by order
  const workersTasks = state.tasks
    .filter((t) => t.team === 'workers')
    .sort((a, b) => a.order - b.order);

  const rulersTasks = state.tasks
    .filter((t) => t.team === 'rulers')
    .sort((a, b) => a.order - b.order);

  const currentTasks = activeTab === 'workers' ? workersTasks : rulersTasks;

  const handleOpenTaskControl = (task: TaskItem) => {
    setSelectedTask(task);
    setPaymentAmount('');
    setPaymentNotes('');
    setTaskStatusChoice(task.status === 'UPCOMING' ? 'ACTIVE' : task.status);
    setDuplicateWarning(null);
    setAllowDuplicatePayment(false);
  };

  const handleSavePayment = () => {
    if (!selectedTask) return;

    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid reward amount greater than 0.');
      return;
    }

    const res = recordTaskPayment(
      selectedTask.id,
      amountNum,
      paymentNotes.trim() || undefined,
      allowDuplicatePayment
    );

    if (!res.success) {
      if (res.error?.startsWith('DUPLICATE_GUARD:')) {
        setDuplicateWarning(res.error.replace('DUPLICATE_GUARD: ', ''));
        return;
      }
      alert(res.error || 'Failed to record payment');
      return;
    }

    // Update task status if different
    if (taskStatusChoice !== selectedTask.status) {
      updateTaskStatus(selectedTask.id, taskStatusChoice);
    }

    setSelectedTask(null);
    setPaymentAmount('');
    setDuplicateWarning(null);
  };

  const handleMoveTask = (team: Team, index: number, direction: 'UP' | 'DOWN') => {
    const list = team === 'workers' ? [...workersTasks] : [...rulersTasks];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    reorderTasks(
      team,
      list.map((t) => t.id)
    );
  };

  const handleCreateNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    addTask(newTaskTeam, newTaskName.trim());
    setNewTaskName('');
    setShowAddTaskModal(false);
  };

  const handleSaveEditName = (taskId: string) => {
    if (!editingTaskName.trim()) return;
    updateTaskName(taskId, editingTaskName.trim());
    setEditingTaskId(null);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0d0811] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="text-xs uppercase tracking-widest text-zinc-400 font-cinzel">
            Event Tasks Tracker
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-cinzel tracking-wider text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-gold-400" />
            TASK TRACKER
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manual entry only • No predefined points or descriptions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs for Workers & Rulers */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner">
            <button
              onClick={() => setActiveTab('workers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-cinzel transition-all ${
                activeTab === 'workers'
                  ? 'bg-blood-900/80 text-rose-300 border border-blood-600/60 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              WORKERS' TASKS ({workersTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('rulers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-cinzel transition-all ${
                activeTab === 'rulers'
                  ? 'bg-gold-950/80 text-gold-300 border border-gold-600/60 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-gold-400" />
              RULERS' TASKS ({rulersTasks.length})
            </button>
          </div>

          {/* Add Task Button */}
          <button
            onClick={() => {
              setNewTaskTeam(activeTab);
              setShowAddTaskModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 transition-colors"
            title="Add Custom Task Name"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* Task List (Clean, names only) */}
      <div className="mt-5 space-y-3">
        {currentTasks.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 font-cinzel text-sm">
            No tasks found for {activeTab === 'workers' ? 'The Workers' : 'The Rulers'}.
          </div>
        ) : (
          currentTasks.map((task, idx) => (
            <div
              key={task.id}
              className={`group flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                task.status === 'COMPLETED'
                  ? 'bg-zinc-950/40 border-zinc-800/80 opacity-90'
                  : task.status === 'ACTIVE'
                  ? 'bg-[#1a1018] border-amber-600/40 shadow-md'
                  : 'bg-zinc-950/70 border-zinc-800/60 hover:border-zinc-700'
              }`}
            >
              {/* Left: Order, Name (Clickable) */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="font-mono text-xs font-bold text-zinc-500 w-5">
                  #{idx + 1}
                </span>

                {editingTaskId === task.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editingTaskName}
                      onChange={(e) => setEditingTaskName(e.target.value)}
                      className="px-2.5 py-1 text-sm bg-black border border-zinc-600 rounded text-white focus:outline-none focus:border-gold-500 flex-1"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEditName(task.id)}
                      className="px-2 py-1 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTaskId(null)}
                      className="px-2 py-1 text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => handleOpenTaskControl(task)}
                      className="text-left font-cinzel font-bold text-sm sm:text-base text-zinc-100 hover:text-gold-300 transition-colors truncate"
                      title="Click to open task controls and enter amount earned"
                    >
                      {task.name}
                    </button>
                    <button
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setEditingTaskName(task.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-zinc-300 transition-opacity"
                      title="Rename Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Middle: Status Badge */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border bg-zinc-950 cursor-pointer focus:outline-none ${
                      task.status === 'COMPLETED'
                        ? 'text-emerald-400 border-emerald-600/50'
                        : task.status === 'ACTIVE'
                        ? 'text-amber-400 border-amber-600/50 animate-pulse'
                        : 'text-zinc-400 border-zinc-700'
                    }`}
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                {/* Amount Earned Display */}
                <div className="min-w-[100px] text-right">
                  {task.amountEarned !== null && task.amountEarned > 0 ? (
                    <div className="text-sm font-black font-mono text-emerald-400">
                      +{formatINR(task.amountEarned)}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 font-mono italic">
                      No amount
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Record Amount Button & Reorder/Delete */}
              <div className="flex items-center justify-end gap-1.5">
                <button
                  onClick={() => handleOpenTaskControl(task)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-950/70 hover:bg-amber-900/80 text-amber-200 border border-amber-600/40 hover:border-amber-400 transition-colors shadow-sm"
                  title="Record manual amount earned for this task"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Record Amount</span>
                </button>

                {/* Reorder controls */}
                <button
                  onClick={() => handleMoveTask(activeTab, idx, 'UP')}
                  disabled={idx === 0}
                  className="p-1 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-20 transition-colors"
                  title="Move Task Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveTask(activeTab, idx, 'DOWN')}
                  disabled={idx === currentTasks.length - 1}
                  className="p-1 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-20 transition-colors"
                  title="Move Task Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Delete control */}
                <button
                  onClick={() => {
                    if (confirm(`Remove task "${task.name}"?`)) {
                      removeTask(task.id);
                    }
                  }}
                  className="p-1 rounded text-zinc-600 hover:text-rose-400 transition-colors ml-1"
                  title="Remove Task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TASK CONTROL MODAL (Manual Entry, Duplicate Payment Guard) */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#130b15] border-2 border-gold-600/60 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div>
                <span className="text-[10px] font-cinzel font-semibold uppercase tracking-wider text-amber-400">
                  {selectedTask.team.toUpperCase()} • TASK CONTROL
                </span>
                <h3 className="text-lg font-cinzel font-bold text-white">
                  {selectedTask.name}
                </h3>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded font-semibold ${
                  selectedTask.team === 'rulers'
                    ? 'bg-gold-950/80 text-gold-300 border border-gold-600/50'
                    : 'bg-blood-950/80 text-rose-300 border border-blood-600/50'
                }`}
              >
                {selectedTask.team.toUpperCase()}
              </span>
            </div>

            {/* Current status info */}
            <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 mb-4 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Current Status:</span>
                <span className="font-semibold text-zinc-200">{selectedTask.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Previously Recorded:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedTask.amountEarned !== null && selectedTask.amountEarned > 0
                    ? formatINR(selectedTask.amountEarned)
                    : 'None'}
                </span>
              </div>
            </div>

            {/* Duplicate payment warning guard */}
            {duplicateWarning && (
              <div className="p-3.5 mb-4 rounded-xl bg-amber-950/80 border border-amber-600/80 text-amber-200 text-xs">
                <div className="flex items-center gap-2 font-bold mb-1 text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  DUPLICATE PAYMENT GUARD
                </div>
                <p className="mb-2 text-zinc-200">{duplicateWarning}</p>
                <label className="flex items-center gap-2 font-semibold cursor-pointer text-amber-200">
                  <input
                    type="checkbox"
                    checked={allowDuplicatePayment}
                    onChange={(e) => setAllowDuplicatePayment(e.target.checked)}
                    className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
                  />
                  I explicitly authorize an additional payment for this completed task
                </label>
              </div>
            )}

            {/* Manual Amount Input */}
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Amount Earned (INR ₹) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-zinc-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter manual amount earned..."
                    className="w-full pl-8 pr-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-base font-mono text-white focus:outline-none focus:border-gold-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                {[500, 1000, 1500, 2000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPaymentAmount(amt.toString())}
                    className="px-2.5 py-1 text-xs font-mono rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                  >
                    +{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              {/* Task Status After Recording */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Update Task Status:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPCOMING', 'ACTIVE', 'COMPLETED'] as TaskStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setTaskStatusChoice(status)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                        taskStatusChoice === status
                          ? 'bg-gold-950/80 border-gold-500 text-gold-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Optional Notes:
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Round 1 bonus round result"
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-700"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSavePayment}
                className="px-5 py-2 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-amber-300 via-gold-400 to-amber-500 hover:from-amber-200 hover:to-gold-300 shadow-md font-cinzel"
              >
                RECORD AMOUNT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <form
            onSubmit={handleCreateNewTask}
            className="bg-[#120b15] border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100"
          >
            <h3 className="text-lg font-cinzel font-bold text-white mb-4">
              ADD TASK NAME
            </h3>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Team Assignment:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTaskTeam('workers')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                      newTaskTeam === 'workers'
                        ? 'bg-blood-900/80 border-blood-500 text-rose-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    THE WORKERS
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTaskTeam('rulers')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                      newTaskTeam === 'rulers'
                        ? 'bg-gold-950/80 border-gold-500 text-gold-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    THE RULERS
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Task Name (Name Only) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="e.g. The Cryptic Escape"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-700"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={!newTaskName.trim()}
                className="px-5 py-2 rounded-lg text-xs font-bold text-black bg-gold-400 hover:bg-gold-300 disabled:opacity-40 font-cinzel"
              >
                CREATE TASK
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
