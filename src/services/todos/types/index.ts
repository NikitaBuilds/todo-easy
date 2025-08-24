// Core Todo interface following TypeScript patterns
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// Todo status type
export type TodoStatus = "pending" | "completed";

// API request types
export interface CreateTodoRequest {
  title: string;
}

export interface UpdateTodoRequest {
  title?: string;
  completed?: boolean;
}

// API response wrapper following API route patterns
export interface TodoAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Paginated response (for future use)
export interface PaginatedTodosResponse {
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Query key factories with const assertions following React Query patterns
export const todoQueryKeys = {
  all: ["todos"] as const,
  lists: () => [...todoQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...todoQueryKeys.lists(), { filters }] as const,
  details: () => [...todoQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...todoQueryKeys.details(), id] as const,
};

// Utility types
export type TodoSummary = Pick<Todo, "id" | "title" | "completed">;
export type PartialTodo = Partial<Todo>;
export type CreateTodoData = Omit<Todo, "id" | "created_at" | "updated_at">;
