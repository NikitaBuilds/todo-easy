import { NextRequest, NextResponse } from "next/server";
import { todoStore } from "@/lib/todoStore";
import {
  TodoAPIResponse,
  UpdateTodoRequest,
  Todo,
} from "@/services/todos/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/todos/[id] - Get a specific todo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const todo = todoStore.getTodoById(id);

    if (!todo) {
      return NextResponse.json<TodoAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Todo not found",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json<TodoAPIResponse<Todo>>({
      success: true,
      data: todo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json<TodoAPIResponse<null>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch todo",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// PATCH /api/todos/[id] - Update a specific todo
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: UpdateTodoRequest = await request.json();

    // Input validation
    if (
      body.title !== undefined &&
      (typeof body.title !== "string" || body.title.trim().length === 0)
    ) {
      return NextResponse.json<TodoAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Title must be a non-empty string if provided",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (body.completed !== undefined && typeof body.completed !== "boolean") {
      return NextResponse.json<TodoAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Completed must be a boolean if provided",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const updateData: UpdateTodoRequest = {};
    if (body.title !== undefined) {
      updateData.title = body.title.trim();
    }
    if (body.completed !== undefined) {
      updateData.completed = body.completed;
    }

    const updatedTodo = todoStore.updateTodo(id, updateData);

    if (!updatedTodo) {
      return NextResponse.json<TodoAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Todo not found",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json<TodoAPIResponse<Todo>>({
      success: true,
      data: updatedTodo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json<TodoAPIResponse<null>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update todo",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/[id] - Delete a specific todo
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = todoStore.deleteTodo(id);

    if (!deleted) {
      return NextResponse.json<TodoAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Todo not found",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json<TodoAPIResponse<null>>({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json<TodoAPIResponse<null>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete todo",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
