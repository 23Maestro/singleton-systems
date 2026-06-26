import {
  Action,
  ActionPanel,
  AI,
  environment,
  Form,
  LaunchProps,
  showToast,
  Toast,
} from "@raycast/api";
import { basename, extname } from "path";
import { useEffect, useRef, useState } from "react";

import { SOURCE_FOLDERS, UNIVERSAL_TAGS } from "./lib/config";
import { getCaptureSourcePath, importProofAsset } from "./lib/eagle";
import {
  appendOpportunityTaskBodyText,
  listProofTasks,
  OpportunityTaskSummary,
  updateOpportunityTask,
} from "./lib/notion";

type Values = {
  filePath: string;
  fileOverride: string[];
  assetName: string;
  folderId: string;
  tags: string[];
  taskId: string;
};

type LaunchContext = {
  taskId?: string;
};

export default function Command(
  props: LaunchProps<{ launchContext: LaunchContext }>,
) {
  const fileOverrideRef = useRef<Form.FilePicker>(null);
  const [filePath, setFilePath] = useState("");
  const [assetName, setAssetName] = useState("");
  const [fileOverride, setFileOverride] = useState<string[]>([]);
  const [tasks, setTasks] = useState<OpportunityTaskSummary[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShortening, setIsShortening] = useState(false);

  useEffect(() => {
    getCaptureSourcePath()
      .then((path) => {
        setFilePath(path);
        setAssetName(nameFromPath(path));
      })
      .catch(() => {
        setFilePath("");
        setAssetName("");
      });

    listProofTasks()
      .then((loadedTasks) => {
        setTasks(loadedTasks);
        const firstTask =
          loadedTasks.find((task) => task.id === props.launchContext?.taskId) ||
          loadedTasks[0];
        if (firstTask) {
          setSelectedTaskId(firstTask.id);
          setAssetName(shortAssetName(firstTask.title));
        }
      })
      .catch(() => setTasks([]));
  }, []);

  async function handleSubmit(values: Values) {
    setIsSubmitting(true);
    try {
      const sourcePath = values.fileOverride[0] || values.filePath;
      if (!sourcePath) {
        throw new Error("No clipboard image or selected file found");
      }

      const folder = SOURCE_FOLDERS.find((item) => item.id === values.folderId);
      const task = tasks.find((item) => item.id === values.taskId);
      const finalName = values.assetName || nameFromPath(sourcePath);
      const addedItem = await importProofAsset(
        sourcePath,
        values.folderId,
        values.tags,
        finalName,
      );

      if (task) {
        const eagleLink = addedItem.id ? `eagle://item/${addedItem.id}` : "";
        const note = [
          `Proof captured: ${addedItem.name || finalName}`,
          folder?.label,
          values.tags.length ? values.tags.join(", ") : "",
        ]
          .filter(Boolean)
          .join(" · ");

        await updateProofTask(task, note, eagleLink);
      }

      await showToast({
        style: Toast.Style.Success,
        title: "Imported",
        message: task ? "Eagle + task done" : folder?.label,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Import failed",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function shortenNameWithAI() {
    const task = tasks.find((item) => item.id === selectedTaskId);
    const sourceText = task?.title || assetName;

    if (!sourceText) {
      return;
    }

    if (!environment.canAccess(AI)) {
      setAssetName(shortAssetName(sourceText));
      return;
    }

    setIsShortening(true);
    try {
      const result = await AI.ask(
        [
          "Create a 2-3 word Eagle asset name.",
          "Use the text after a colon if present.",
          "Remove project names, verbs, and generic words like capture, add, show, pick, screenshot, asset, proof, reference.",
          "Use lowercase words only.",
          "Return only the asset name.",
          "",
          `Task: ${sourceText}`,
        ].join("\n"),
        { creativity: "none" },
      );
      setAssetName(sanitizeName(result).toLowerCase());
    } catch {
      setAssetName(shortAssetName(sourceText));
    } finally {
      setIsShortening(false);
    }
  }

  return (
    <Form
      isLoading={isSubmitting || isShortening}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Capture Proof"
            icon="📥"
            onSubmit={handleSubmit}
          />
          <Action
            title="AI Eagle-Renamer"
            icon="🪄"
            shortcut={{ modifiers: ["cmd"], key: "e" }}
            onAction={shortenNameWithAI}
          />
          <Action
            title="Choose File"
            icon="📁"
            shortcut={{ modifiers: ["cmd"], key: "o" }}
            onAction={() => fileOverrideRef.current?.focus()}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="filePath"
        title="Source"
        value={filePath}
        onChange={setFilePath}
      />
      <Form.FilePicker
        id="fileOverride"
        title="File Override"
        value={fileOverride}
        ref={fileOverrideRef}
        onChange={(files) => {
          const selected = files.slice(0, 1);
          setFileOverride(selected);
          if (selected[0] && !selectedTaskId) {
            setAssetName(nameFromPath(selected[0]));
          }
        }}
        allowMultipleSelection={false}
        canChooseDirectories={false}
        canChooseFiles
      />
      <Form.Dropdown
        id="folderId"
        title="Proof Folder"
        defaultValue={SOURCE_FOLDERS[0].id}
      >
        {SOURCE_FOLDERS.map((folder) => (
          <Form.Dropdown.Item
            key={folder.id}
            value={folder.id}
            title={folder.label}
          />
        ))}
      </Form.Dropdown>
      <Form.Dropdown
        id="taskId"
        title="Proof Task"
        value={selectedTaskId}
        onChange={(value) => {
          setSelectedTaskId(value);
          const task = tasks.find((item) => item.id === value);
          if (task) {
            setAssetName(shortAssetName(task.title));
          }
        }}
      >
        <Form.Dropdown.Item value="" title="None" />
        {tasks.map((task) => (
          <Form.Dropdown.Item
            key={task.id}
            value={task.id}
            title={task.title}
          />
        ))}
      </Form.Dropdown>
      <Form.TextField
        id="assetName"
        title="Name"
        value={assetName}
        onChange={setAssetName}
      />
      <Form.TagPicker id="tags" title="Tags">
        {UNIVERSAL_TAGS.map((tag) => (
          <Form.TagPicker.Item key={tag} value={tag} title={tag} />
        ))}
      </Form.TagPicker>
    </Form>
  );
}

async function updateProofTask(
  task: OpportunityTaskSummary,
  note: string,
  eagleLink: string,
) {
  try {
    await updateOpportunityTask({
      pageId: task.id,
      status: "Done",
      assetProofLink: eagleLink,
    });
    if (note) {
      await appendOpportunityTaskBodyText(task, note);
    }
  } catch (error) {
    if (!eagleLink) {
      throw error;
    }
    await updateOpportunityTask({ pageId: task.id, status: "Done" });
    if (note) {
      await appendOpportunityTaskBodyText(task, note);
    }
  }
}

function nameFromPath(filePath: string) {
  if (!filePath) {
    return "";
  }

  return sanitizeName(basename(filePath, extname(filePath)));
}

function sanitizeName(value: string) {
  return value.replace(/[/:]/g, " - ").replace(/\s+/g, " ").trim();
}

function shortAssetName(value: string) {
  const withoutPrefix = value
    .split(":")
    .pop()
    ?.replace(/^[^-]+-\s*/, "")
    .replace(
      /^(capture|add|create|pick|finalize|show|record|upload|store|select|choose)\s+/i,
      "",
    )
    .replace(/\b(assets?|screenshots?|proof|reference)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return sanitizeName(withoutPrefix || value).toLowerCase();
}
