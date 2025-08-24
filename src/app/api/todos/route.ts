import { NextRequest, NextResponse } from "next/server";
import { todoStore } from "@/lib/todoStore";
import {
  TodoAPIResponse,
  CreateTodoRequest,
  Todo,
} from "@/services/todos/types";

// GET /api/todos - List all todos
export async function GET(request: NextRequest) {
  try {
    const todos = todoStore.getAllTodos();

    return NextResponse.json<TodoAPIResponse<Todo[]>>({
      success: true,
      data: todos,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json<TodoAPIResponse<null>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch todos",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const body: CreateTodoRequest = await request.json();

    // Input validation
    if (
      !body.title ||
      typeof body.title !== "string" ||
      body.title.trim().length === 0
    ) {
      return NextResponse.json<TodoAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Title is required and must be a non-empty string",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const newTodo = todoStore.createTodo({
      title: body.title.trim(),
    });

    return NextResponse.json<TodoAPIResponse<Todo>>(
      {
        success: true,
        data: newTodo,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json<TodoAPIResponse<null>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create todo",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
