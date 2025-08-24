import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Todo,
  TodoAPIResponse,
  CreateTodoRequest,
  UpdateTodoRequest,
  todoQueryKeys,
} from "../types";

// API client functions
async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch("/api/todos");
  const data: TodoAPIResponse<Todo[]> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to fetch todos");
  }

  return data.data || [];
}

async function fetchTodo(id: string): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}`);
  const data: TodoAPIResponse<Todo> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to fetch todo");
  }

  if (!data.data) {
    throw new Error("Todo not found");
  }

  return data.data;
}

async function createTodo(todoData: CreateTodoRequest): Promise<Todo> {
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todoData),
  });

  const data: TodoAPIResponse<Todo> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to create todo");
  }

  if (!data.data) {
    throw new Error("No todo data returned");
  }

  return data.data;
}

async function updateTodo(
  id: string,
  todoData: UpdateTodoRequest
): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todoData),
  });

  const data: TodoAPIResponse<Todo> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to update todo");
  }

  if (!data.data) {
    throw new Error("No todo data returned");
  }

  return data.data;
}

async function deleteTodo(id: string): Promise<void> {
  const response = await fetch(`/api/todos/${id}`, {
    method: "DELETE",
  });

  const data: TodoAPIResponse<null> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to delete todo");
  }
}

// React Query hooks following react-query-patterns.mdc

// Query hook for fetching all todos
export const useTodos = () => {
  return useQuery({
    queryKey: todoQueryKeys.lists(),
    queryFn: fetchTodos,
    staleTime: 5 * 60 * 1000, // 5 minutes (moderate update frequency)
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
};

// Query hook for fetching a single todo
export const useTodo = (id: string) => {
  return useQuery({
    queryKey: todoQueryKeys.detail(id),
    queryFn: () => fetchTodo(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Mutation hook for creating todos with optimistic updates
export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onMutate: async (newTodoData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: todoQueryKeys.lists() });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(
        todoQueryKeys.lists()
      );

      // Optimistically update to the new value
      if (previousTodos) {
        const optimisticTodo: Todo = {
          id: `temp-${Date.now()}`,
          title: newTodoData.title,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData<Todo[]>(todoQueryKeys.lists(), [
          ...previousTodos,
          optimisticTodo,
        ]);
      }

      return { previousTodos };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(todoQueryKeys.lists(), context.previousTodos);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.lists() });
    },
  });
};

// Mutation hook for updating todos with optimistic updates
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      updateTodo(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: todoQueryKeys.lists() });
      await queryClient.cancelQueries({ queryKey: todoQueryKeys.detail(id) });

      const previousTodos = queryClient.getQueryData<Todo[]>(
        todoQueryKeys.lists()
      );
      const previousTodo = queryClient.getQueryData<Todo>(
        todoQueryKeys.detail(id)
      );

      // Optimistically update the todo list
      if (previousTodos) {
        const updatedTodos = previousTodos.map((todo) =>
          todo.id === id
            ? { ...todo, ...data, updated_at: new Date().toISOString() }
            : todo
        );
        queryClient.setQueryData<Todo[]>(todoQueryKeys.lists(), updatedTodos);
      }

      // Optimistically update the individual todo
      if (previousTodo) {
        const updatedTodo = {
          ...previousTodo,
          ...data,
          updated_at: new Date().toISOString(),
        };
        queryClient.setQueryData<Todo>(todoQueryKeys.detail(id), updatedTodo);
      }

      return { previousTodos, previousTodo };
    },
    onError: (err, { id }, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(todoQueryKeys.lists(), context.previousTodos);
      }
      if (context?.previousTodo) {
        queryClient.setQueryData(
          todoQueryKeys.detail(id),
          context.previousTodo
        );
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.detail(id) });
    },
  });
};

// Mutation hook for deleting todos with optimistic updates
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTodo,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: todoQueryKeys.lists() });

      const previousTodos = queryClient.getQueryData<Todo[]>(
        todoQueryKeys.lists()
      );

      // Optimistically remove the todo
      if (previousTodos) {
        const filteredTodos = previousTodos.filter((todo) => todo.id !== id);
        queryClient.setQueryData<Todo[]>(todoQueryKeys.lists(), filteredTodos);
      }

      return { previousTodos };
    },
    onError: (err, id, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(todoQueryKeys.lists(), context.previousTodos);
      }
    },
    onSettled: (data, error, id) => {
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.lists() });
      queryClient.removeQueries({ queryKey: todoQueryKeys.detail(id) });
    },
  });
};

// Cache utilities following react-query-patterns.mdc
export const useTodoCacheUtils = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.all }),

    invalidateLists: () =>
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.lists() }),

    setTodo: (id: string, todo: Todo) =>
      queryClient.setQueryData(todoQueryKeys.detail(id), todo),

    prefetchTodo: (id: string) =>
      queryClient.prefetchQuery({
        queryKey: todoQueryKeys.detail(id),
        queryFn: () => fetchTodo(id),
      }),

    getTodo: (id: string) =>
      queryClient.getQueryData<Todo>(todoQueryKeys.detail(id)),

    getTodos: () => queryClient.getQueryData<Todo[]>(todoQueryKeys.lists()),
  };
};

// Export query keys for external use
export { todoQueryKeys };
