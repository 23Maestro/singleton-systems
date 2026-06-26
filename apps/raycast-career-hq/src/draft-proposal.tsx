import {
  Action,
  ActionPanel,
  AI,
  Clipboard,
  Detail,
  environment,
  LaunchProps,
  List,
  open,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useMemo, useState } from "react";

import {
  appendOpportunityTaskBodyText,
  listOpportunityTasks,
  OpportunityTaskSummary,
  updateOpportunityTask,
} from "./lib/notion";

type LaunchContext = {
  taskId?: string;
};

export default function Command(
  props: LaunchProps<{ launchContext: LaunchContext }>,
) {
  const [tasks, setTasks] = useState<OpportunityTaskSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const freelanceTasks = useMemo(
    () => tasks.filter((task) => task.projectTitle === "Freelance"),
    [tasks],
  );
  const selectedTask = useMemo(
    () =>
      freelanceTasks.find((task) => task.id === props.launchContext?.taskId),
    [freelanceTasks, props.launchContext?.taskId],
  );

  async function loadTasks() {
    setIsLoading(true);
    try {
      setTasks(await listOpportunityTasks());
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Load failed",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  if (selectedTask) {
    return <ProposalDraft task={selectedTask} />;
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Pick a freelance task">
      {freelanceTasks.map((task) => (
        <List.Item
          key={task.id}
          title={task.title}
          accessories={[
            { text: task.status || "Queued" },
            ...(task.time ? [{ text: task.time }] : []),
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                title="Draft Proposal"
                icon="💬"
                target={<ProposalDraft task={task} />}
              />
              {task.link ? (
                <Action.OpenInBrowser
                  title="Open Link"
                  icon="🌐"
                  url={task.link}
                />
              ) : null}
              <Action.OpenInBrowser
                title="Open in Notion"
                icon="🟪"
                url={task.url}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function ProposalDraft({ task }: { task: OpportunityTaskSummary }) {
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    buildDraft(task)
      .then(async (text) => {
        setDraft(text);
        await Clipboard.copy(text);
        await showToast({
          style: Toast.Style.Success,
          title: "Proposal copied",
          message: task.link ? "Open the link and paste." : task.title,
        });
      })
      .catch((error) => {
        setDraft(
          fallbackPrompt(
            task,
            error instanceof Error ? error.message : String(error),
          ),
        );
      })
      .finally(() => setIsLoading(false));
  }, [task]);

  return (
    <Detail
      isLoading={isLoading}
      markdown={draft || "Drafting..."}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Proposal">
            <Action
              title={
                task.link ? "Copy Proposal and Open Link" : "Copy Proposal"
              }
              icon="📋"
              onAction={() => copyDraft(task, draft, true)}
            />
            <Action
              title="Mark Waiting"
              icon="📝"
              onAction={() => markWaiting(task)}
            />
          </ActionPanel.Section>
          <ActionPanel.Section title="Navigation">
            {task.link ? (
              <Action.OpenInBrowser
                title="Open Link"
                icon="🌐"
                url={task.link}
              />
            ) : null}
            <Action.OpenInBrowser
              title="Open in Notion"
              icon="🟪"
              url={task.url}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

async function buildDraft(task: OpportunityTaskSummary) {
  const copiedPost = await readClipboardText();

  if (!environment.canAccess(AI)) {
    return fallbackPrompt(task, undefined, copiedPost);
  }

  try {
    const result = await AI.ask(
      [
        "Write a concise freelance proposal draft for one freelancer.",
        "Do not invent clients, metrics, scale, or proof.",
        "Lead with a direct read of the post, ask one useful question, and keep the tone practical.",
        "Keep video editing and workflow cleanup separate unless the post connects them.",
        "Return only the proposal draft.",
        "",
        `Opportunity task: ${task.title}`,
        task.link ? `Link: ${task.link}` : "",
        copiedPost ? `Copied job post:\n${copiedPost}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      { creativity: "low" },
    );

    return result.trim();
  } catch (error) {
    return fallbackPrompt(
      task,
      error instanceof Error ? error.message : String(error),
      copiedPost,
    );
  }
}

async function copyDraft(
  task: OpportunityTaskSummary,
  draft: string,
  shouldOpenLink: boolean,
) {
  await Clipboard.copy(draft);
  if (shouldOpenLink && task.link) {
    await open(task.link);
  }
  await showToast({
    style: Toast.Style.Success,
    title: "Copied",
    message: task.link ? "Paste into the proposal page." : task.title,
  });
}

async function markWaiting(task: OpportunityTaskSummary) {
  try {
    await appendOpportunityTaskBodyText(
      task,
      "Proposal drafted. Status: Waiting.",
    );
    await updateOpportunityTask({ pageId: task.id, status: "Waiting" });
    await showToast({
      style: Toast.Style.Success,
      title: "Logged",
      message: task.title,
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Log failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function readClipboardText() {
  try {
    const clipboard = await Clipboard.read();
    return clipboard.text?.trim() || "";
  } catch {
    return "";
  }
}

function fallbackPrompt(
  task: OpportunityTaskSummary,
  error?: string,
  copiedPost?: string,
) {
  return [
    "# Proposal Prompt",
    "",
    error
      ? `> Raycast AI unavailable: ${error}`
      : "> Raycast AI unavailable. Copy this into Codex or ChatGPT.",
    "",
    "Write a concise freelance proposal draft for one freelancer.",
    "",
    "- Do not invent proof, clients, metrics, or scale.",
    "- Lead with a direct read of the post.",
    "- Ask one useful question.",
    "- Keep the tone practical.",
    "",
    `Task: ${task.title}`,
    task.link ? `Link: ${task.link}` : "",
    copiedPost ? `Copied job post:\n${copiedPost}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
