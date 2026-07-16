import { NextResponse } from "next/server";
import { addHomeTask, deleteHomeTask, homeTaskContract, listHomeTaskOptions, listHomeTasks, updateHomeTask } from "@/lib/home-tasks-google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const tasks = await listHomeTasks();
    const options = await listHomeTaskOptions();
    return NextResponse.json({ tasks, options, contract: homeTaskContract });
  } catch (error) {
    return NextResponse.json({ error: messageFrom(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.task || !body.room || !body.duration || !body.plan) {
      return NextResponse.json({ error: "Missing task, room, duration, or plan." }, { status: 400 });
    }
    const task = await addHomeTask(body);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: messageFrom(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.taskId) {
      return NextResponse.json({ error: "Missing taskId." }, { status: 400 });
    }
    const task = await updateHomeTask(body.taskId, body);
    return NextResponse.json({ task });
  } catch (error) {
    const message = messageFrom(error);
    return NextResponse.json({ error: message }, { status: message.includes("not found") ? 404 : 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    if (!body.taskId) {
      return NextResponse.json({ error: "Missing taskId." }, { status: 400 });
    }
    const result = await deleteHomeTask(body.taskId);
    return NextResponse.json(result);
  } catch (error) {
    const message = messageFrom(error);
    return NextResponse.json({ error: message }, { status: message.includes("not found") ? 404 : 500 });
  }
}

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
