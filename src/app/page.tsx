"use client";

import { useState } from "react";
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
} from "@/services/todos";

export default function Home() {
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // React Query hooks
  const { data: todos = [], isLoading, error } = useTodos();
  const createTodoMutation = useCreateTodo();
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();

  // Filter todos based on current filter
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeTodosCount = todos.filter((todo) => !todo.completed).length;
  const completedTodosCount = todos.filter((todo) => todo.completed).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      await createTodoMutation.mutateAsync({ title: newTodoTitle.trim() });
      setNewTodoTitle("");
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await updateTodoMutation.mutateAsync({
        id,
        data: { completed: !completed },
      });
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodoMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const clearCompleted = async () => {
    const completedTodos = todos.filter((todo) => todo.completed);
    try {
      await Promise.all(
        completedTodos.map((todo) => deleteTodoMutation.mutateAsync(todo.id))
      );
    } catch (error) {
      console.error("Failed to clear completed todos:", error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading todos</h2>
          <p>{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 dark:bg-blue-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Todo App</h1>
            <p className="text-blue-100 text-sm mt-1">
              Built with Next.js 15, TypeScript & TanStack Query
            </p>
          </div>

          {/* Add Todo Form */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={createTodoMutation.isPending}
              />
              <button
                type="submit"
                disabled={!newTodoTitle.trim() || createTodoMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createTodoMutation.isPending ? "Adding..." : "Add"}
              </button>
            </form>
          </div>

          {/* Filter Tabs */}
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-1">
              {(["all", "active", "completed"] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === filterType
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  {filterType === "active" && activeTodosCount > 0 && (
                    <span className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {activeTodosCount}
                    </span>
                  )}
                  {filterType === "completed" && completedTodosCount > 0 && (
                    <span className="ml-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {completedTodosCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Todo List */}
          <div className="min-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  Loading todos...
                </div>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  {filter === "all" ? (
                    <>
                      <div className="text-4xl mb-2">📝</div>
                      <p>No todos yet. Add one above!</p>
                    </>
                  ) : filter === "active" ? (
                    <>
                      <div className="text-4xl mb-2">✅</div>
                      <p>No active todos. Great job!</p>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl mb-2">🎉</div>
                      <p>No completed todos yet.</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <button
                      onClick={() =>
                        handleToggleComplete(todo.id, todo.completed)
                      }
                      disabled={updateTodoMutation.isPending}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        todo.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 dark:border-gray-600 hover:border-green-500"
                      }`}
                    >
                      {todo.completed && <span className="text-xs">✓</span>}
                    </button>
                    <span
                      className={`flex-1 ${
                        todo.completed
                          ? "line-through text-gray-500 dark:text-gray-400"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {todo.title}
                    </span>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      disabled={deleteTodoMutation.isPending}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1"
                      title="Delete todo"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {todos.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {activeTodosCount} {activeTodosCount === 1 ? "item" : "items"}{" "}
                  left
                </span>
                {completedTodosCount > 0 && (
                  <button
                    onClick={clearCompleted}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    Clear completed ({completedTodosCount})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {todos.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {activeTodosCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedTodosCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Completed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
