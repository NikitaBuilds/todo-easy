import {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
} from "@/services/todos/types";

const STORAGE_KEY = "todos";

// Simple in-memory store with localStorage persistence
class TodoStore {
  private todos: Todo[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.todos = JSON.parse(stored);
        }
      } catch (error) {
        console.error("Failed to load todos from localStorage:", error);
        this.todos = [];
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos));
      } catch (error) {
        console.error("Failed to save todos to localStorage:", error);
      }
    }
  }

  private generateId(): string {
    return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getAllTodos(): Todo[] {
    return [...this.todos];
  }

  getTodoById(id: string): Todo | null {
    return this.todos.find((todo) => todo.id === id) || null;
  }

  createTodo(data: CreateTodoRequest): Todo {
    const now = new Date().toISOString();
    const newTodo: Todo = {
      id: this.generateId(),
      title: data.title,
      completed: false,
      created_at: now,
      updated_at: now,
    };

    this.todos.push(newTodo);
    this.saveToStorage();
    return newTodo;
  }

  updateTodo(id: string, data: UpdateTodoRequest): Todo | null {
    const todoIndex = this.todos.findIndex((todo) => todo.id === id);
    if (todoIndex === -1) {
      return null;
    }

    const updatedTodo: Todo = {
      ...this.todos[todoIndex],
      ...data,
      updated_at: new Date().toISOString(),
    };

    this.todos[todoIndex] = updatedTodo;
    this.saveToStorage();
    return updatedTodo;
  }

  deleteTodo(id: string): boolean {
    const todoIndex = this.todos.findIndex((todo) => todo.id === id);
    if (todoIndex === -1) {
      return false;
    }

    this.todos.splice(todoIndex, 1);
    this.saveToStorage();
    return true;
  }

  clearCompleted(): number {
    const initialCount = this.todos.length;
    this.todos = this.todos.filter((todo) => !todo.completed);
    this.saveToStorage();
    return initialCount - this.todos.length;
  }
}

// Singleton instance
export const todoStore = new TodoStore();
