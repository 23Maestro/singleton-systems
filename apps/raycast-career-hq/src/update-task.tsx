import {
  Action,
  ActionPanel,
  Color,
  Form,
  LaunchType,
  List,
  getPreferenceValues,
  launchCommand,
  open,
  showToast,
  Toast,
} from "@raycast/api";
import { existsSync } from "fs";
import { useEffect, useMemo, useState } from "react";

import {
  MONEY_PRIORITIES,
  PROJECT_LANES,
  STATUSES,
  TIME_OPTIONS,
  MoneyPriority,
  ProjectLane,
  Status,
  TimeOption,
} from "./lib/config";
import {
  listOpportunityProjects,
  listOpportunityTasks,
  OpportunityProjectSummary,
  OpportunityTaskSummary,
  updateOpportunityTask,
} from "./lib/notion";

type QueueFilter = "active" | "today" | ProjectLane | "Waiting";

type EditValues = {
  status: Status;
  time: TimeOption;
  moneyPriority: MoneyPriority;
  projectId: string;
  link: string;
  assetProofLink: string;
};

type Preferences = {
  notionToken: string;
  cashResumePath?: string;
  careerResumePath?: string;
};

export default function Command() {
  const [tasks, setTasks] = useState<OpportunityTaskSummary[]>([]);
  const [projects, setProjects] = useState<OpportunityProjectSummary[]>([]);
  const [filter, setFilter] = useState<QueueFilter>("active");
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    try {
      const [loadedTasks, loadedProjects] = await Promise.all([
        listOpportunityTasks(),
        listOpportunityProjects(),
      ]);
      setTasks(loadedTasks);
      setProjects(loadedProjects);
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
    loadData();
  }, []);

  const visibleTasks = useMemo(
    () => tasks.filter((task) => matchesFilter(task, filter)),
    [tasks, filter],
  );
  const sections = useMemo(
    () => buildSections(visibleTasks, filter),
    [visibleTasks, filter],
  );

  return (
    <List
      isLoading={isLoading}
      isShowingDetail
      filtering={{ keepSectionOrder: true }}
      searchBarPlaceholder="Search Opportunity HQ"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter Opportunity HQ"
          value={filter}
          onChange={(value) => setFilter(value as QueueFilter)}
        >
          <List.Dropdown.Item
            title={`All Active (${tasks.length})`}
            value="active"
          />
          <List.Dropdown.Item title="Today" value="today" />
          {PROJECT_LANES.map((project) => (
            <List.Dropdown.Item key={project} title={project} value={project} />
          ))}
          <List.Dropdown.Item title="Waiting" value="Waiting" />
        </List.Dropdown>
      }
    >
      {sections.map((section) => (
        <List.Section
          key={section.title}
          title={section.title}
          subtitle={String(section.tasks.length)}
        >
          {section.tasks.map((task) => (
            <List.Item
              key={task.id}
              id={task.id}
              icon={iconForTask(task)}
              title={task.title}
              keywords={taskKeywords(task)}
              accessories={[
                {
                  tag: {
                    value: task.status || "Queued",
                    color: colorForStatus(task.status),
                  },
                },
              ]}
              detail={
                <List.Item.Detail
                  markdown={taskMarkdown(task)}
                  metadata={taskMetadata(task)}
                />
              }
              actions={
                <TaskActions
                  task={task}
                  projects={projects}
                  onUpdated={loadData}
                />
              }
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
}

function TaskActions({
  task,
  projects,
  onUpdated,
}: {
  task: OpportunityTaskSummary;
  projects: OpportunityProjectSummary[];
  onUpdated: () => Promise<void>;
}) {
  return (
    <ActionPanel>
      <ActionPanel.Section title="Workflow">
        <Action
          title={task.link ? "Start Work" : "Set in Motion"}
          icon="▶️"
          shortcut={{ modifiers: ["cmd"], key: "return" }}
          onAction={() => startWork(task, onUpdated)}
        />
        <Action
          title="Done"
          icon="✅"
          shortcut={{ modifiers: ["cmd"], key: "j" }}
          onAction={() => quickStatus(task, "Done", onUpdated)}
        />
        <Action
          title="Waiting"
          icon="⏳"
          shortcut={{ modifiers: ["cmd"], key: "w" }}
          onAction={() => quickStatus(task, "Waiting", onUpdated)}
        />
        <Action
          title="Park"
          icon="🅿️"
          onAction={() => quickStatus(task, "Parked", onUpdated)}
        />
      </ActionPanel.Section>
      <ActionPanel.Section title="Open">
        {task.link ? (
          <Action.OpenInBrowser
            title="Open Link"
            icon="🌐"
            shortcut={{ modifiers: ["cmd"], key: "o" }}
            url={task.link}
          />
        ) : null}
        {task.assetProofLink ? (
          <Action.OpenInBrowser
            title="Open Proof"
            icon="🧾"
            url={task.assetProofLink}
          />
        ) : null}
        <Action.OpenInBrowser title="Open in Notion" icon="🟪" url={task.url} />
        <Action
          title="Add Text to Notion"
          icon="✍️"
          onAction={() =>
            open("raycast-x://extensions/notion/notion/add-text-to-page")
          }
        />
      </ActionPanel.Section>
      <ActionPanel.Section title="Related">
        {task.projectTitle === "Freelance" ? (
          <Action
            title="Draft Proposal"
            icon="💬"
            onAction={() => launchCareerCommand("draft-proposal", task)}
          />
        ) : null}
        {task.projectTitle === "Proof" ? (
          <Action
            title="Capture Proof"
            icon="📥"
            onAction={() => launchCareerCommand("capture-proof", task)}
          />
        ) : null}
      </ActionPanel.Section>
      <ActionPanel.Section title="Edit">
        <Action.Push
          title="Edit Task"
          icon="✏️"
          shortcut={{ modifiers: ["cmd"], key: "e" }}
          target={
            <EditTaskForm
              task={task}
              projects={projects}
              onUpdated={onUpdated}
            />
          }
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}

function EditTaskForm({
  task,
  projects,
  onUpdated,
}: {
  task: OpportunityTaskSummary;
  projects: OpportunityProjectSummary[];
  onUpdated: () => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: EditValues) {
    setIsSubmitting(true);
    try {
      if (!values.projectId) {
        throw new Error("Pick one Opportunity HQ project lane");
      }
      await updateOpportunityTask({
        pageId: task.id,
        status: values.status,
        time: values.time,
        moneyPriority: values.moneyPriority,
        projectId: values.projectId,
        link: values.link,
        assetProofLink: values.assetProofLink,
      });
      await showToast({
        style: Toast.Style.Success,
        title: "Saved",
        message: task.title,
      });
      await onUpdated();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Save failed",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form
      isLoading={isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Task"
            icon="✅"
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.Description
        title={task.title}
        text={task.projectTitle || "Opportunity HQ"}
      />
      <Form.Dropdown
        id="status"
        title="Status"
        defaultValue={(task.status || "Queued") as Status}
      >
        {STATUSES.map((status) => (
          <Form.Dropdown.Item key={status} value={status} title={status} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown
        id="time"
        title="Time"
        defaultValue={(task.time || "30m") as TimeOption}
      >
        {TIME_OPTIONS.map((time) => (
          <Form.Dropdown.Item key={time} value={time} title={time} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown
        id="moneyPriority"
        title="Money Priority"
        defaultValue={(task.moneyPriority || "Strategic") as MoneyPriority}
      >
        {MONEY_PRIORITIES.map((priority) => (
          <Form.Dropdown.Item
            key={priority}
            value={priority}
            title={priority}
          />
        ))}
      </Form.Dropdown>
      <Form.Dropdown
        id="projectId"
        title="Project"
        defaultValue={task.projectIds[0] || ""}
      >
        {projects.map((project) => (
          <Form.Dropdown.Item
            key={project.id}
            value={project.id}
            title={project.title}
          />
        ))}
      </Form.Dropdown>
      <Form.TextField id="link" title="Link" defaultValue={task.link} />
      <Form.TextField
        id="assetProofLink"
        title="Proof Link"
        defaultValue={task.assetProofLink}
      />
    </Form>
  );
}

async function startWork(
  task: OpportunityTaskSummary,
  onUpdated: () => Promise<void>,
) {
  try {
    await updateOpportunityTask({ pageId: task.id, status: "In Motion" });
    if (task.link) {
      await open(task.link);
    }
    const resumePath = resumePathFor(task);
    if (resumePath) {
      await open(resumePath);
    }
    await showToast({
      style: Toast.Style.Success,
      title: task.link ? "Started" : "In Motion",
      message: task.title,
    });
    await onUpdated();
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Start failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function quickStatus(
  task: OpportunityTaskSummary,
  status: Status,
  onUpdated: () => Promise<void>,
) {
  try {
    await updateOpportunityTask({ pageId: task.id, status });
    await showToast({
      style: Toast.Style.Success,
      title: status || "Queued",
      message: task.title,
    });
    await onUpdated();
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Update failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function launchCareerCommand(
  name: string,
  task?: OpportunityTaskSummary,
) {
  await launchCommand({
    name,
    type: LaunchType.UserInitiated,
    context: task ? { taskId: task.id } : undefined,
  });
}

function matchesFilter(task: OpportunityTaskSummary, filter: QueueFilter) {
  if (filter === "active") {
    return !["Done", "Parked"].includes(task.status);
  }
  if (filter === "today") {
    return task.status === "Today" || Boolean(task.workDate || task.block);
  }
  if (filter === "Waiting") {
    return task.status === "Waiting";
  }
  return task.projectTitle === filter;
}

function buildSections(tasks: OpportunityTaskSummary[], filter: QueueFilter) {
  const keyFor =
    filter === "active"
      ? (task: OpportunityTaskSummary) => task.projectTitle || "No project"
      : filter === "today"
        ? (task: OpportunityTaskSummary) => task.block || "Unblocked"
        : () => sectionTitle(filter);

  const bySection = new Map<string, OpportunityTaskSummary[]>();
  for (const task of tasks) {
    const key = keyFor(task);
    const sectionTasks = bySection.get(key) || [];
    sectionTasks.push(task);
    bySection.set(key, sectionTasks);
  }

  return Array.from(bySection, ([title, sectionTasks]) => ({
    title,
    tasks: sectionTasks,
  }));
}

function sectionTitle(filter: QueueFilter) {
  return filter === "active"
    ? "All Active"
    : filter === "today"
      ? "Today"
      : filter;
}

function iconForTask(task: OpportunityTaskSummary) {
  if (task.projectTitle === "Cash Jobs") return "🚚";
  if (task.projectTitle === "Career Jobs") return "🎬";
  if (task.projectTitle === "Freelance") return "💼";
  if (task.projectTitle === "Offer") return "🧭";
  if (task.projectTitle === "Proof") return "🧾";
  return "⭐";
}

function resumePathFor(task: OpportunityTaskSummary) {
  const preferences = getPreferenceValues<Preferences>();
  const configuredPath =
    task.projectTitle === "Cash Jobs"
      ? preferences.cashResumePath
      : ["Career Jobs", "Freelance"].includes(task.projectTitle)
        ? preferences.careerResumePath
        : "";
  return configuredPath && existsSync(configuredPath) ? configuredPath : "";
}

function taskMarkdown(task: OpportunityTaskSummary) {
  const lines = [
    `# ${task.title}`,
    "",
    task.link ? `## Link\n${task.link}` : "",
    task.assetProofLink ? `## Proof\n${task.assetProofLink}` : "",
  ];
  return lines.filter(Boolean).join("\n\n");
}

function taskMetadata(task: OpportunityTaskSummary) {
  return (
    <List.Item.Detail.Metadata>
      <List.Item.Detail.Metadata.TagList title="Status">
        <List.Item.Detail.Metadata.TagList.Item
          text={task.status || "Queued"}
          color={colorForStatus(task.status)}
        />
      </List.Item.Detail.Metadata.TagList>
      {task.projectTitle ? (
        <List.Item.Detail.Metadata.TagList title="Project">
          <List.Item.Detail.Metadata.TagList.Item
            text={task.projectTitle}
            color={colorForProject(task.projectTitle)}
          />
        </List.Item.Detail.Metadata.TagList>
      ) : null}
      <List.Item.Detail.Metadata.Label
        title="Time"
        text={task.time || "No time"}
      />
      <List.Item.Detail.Metadata.TagList title="Priority">
        <List.Item.Detail.Metadata.TagList.Item
          text={task.moneyPriority || "No priority"}
          color={colorForPriority(task.moneyPriority)}
        />
      </List.Item.Detail.Metadata.TagList>
      {task.workDate ? (
        <List.Item.Detail.Metadata.Label
          title="Work Date"
          text={task.workDate}
        />
      ) : null}
      {task.block ? (
        <List.Item.Detail.Metadata.Label title="Block" text={task.block} />
      ) : null}
    </List.Item.Detail.Metadata>
  );
}

function colorForStatus(status: string) {
  if (status === "Done") return Color.Green;
  if (status === "In Motion") return Color.Blue;
  if (status === "Today") return Color.Purple;
  if (status === "Waiting") return Color.Yellow;
  if (status === "Parked") return Color.SecondaryText;
  return Color.Orange;
}

function colorForProject(project: string) {
  if (project === "Cash Jobs") return Color.Green;
  if (project === "Career Jobs") return Color.Blue;
  if (project === "Freelance") return Color.Purple;
  if (project === "Offer") return Color.Magenta;
  if (project === "Proof") return Color.Yellow;
  return Color.SecondaryText;
}

function colorForPriority(priority: string) {
  if (priority === "Critical") return Color.Red;
  if (priority === "Strategic") return Color.Blue;
  return Color.SecondaryText;
}

function taskKeywords(task: OpportunityTaskSummary) {
  return [
    task.status,
    task.time,
    task.moneyPriority,
    task.projectTitle,
    task.block,
    task.workDate,
    task.link,
    hostFromUrl(task.link),
  ].filter(Boolean);
}

function hostFromUrl(value: string) {
  try {
    return value ? new URL(value).hostname : "";
  } catch {
    return "";
  }
}
