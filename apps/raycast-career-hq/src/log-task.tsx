import {
  Action,
  ActionPanel,
  Clipboard,
  Form,
  showToast,
  Toast,
} from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import { useEffect, useState } from "react";

import { TIME_OPTIONS, TimeOption } from "./lib/config";
import {
  createOpportunityTask,
  listOpportunityProjects,
  OpportunityProjectSummary,
} from "./lib/notion";

type Values = {
  task: string;
  time: TimeOption;
  projectId: string;
  link: string;
};

export default function Command() {
  const [projects, setProjects] = useState<OpportunityProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleSubmit, itemProps, setValue } = useForm<Values>({
    initialValues: {
      time: "30m",
      projectId: "",
      link: "",
    },
    validation: {
      task: FormValidation.Required,
      projectId: FormValidation.Required,
      time: FormValidation.Required,
    },
    async onSubmit(values) {
      setIsSubmitting(true);
      try {
        const project = projects.find((item) => item.id === values.projectId);
        if (!project) {
          throw new Error("Pick one Opportunity HQ project lane");
        }
        await createOpportunityTask({
          task: values.task,
          time: values.time,
          projectId: values.projectId,
          projectTitle: project.title,
          link: values.link,
        });
        await showToast({
          style: Toast.Style.Success,
          title: "Created",
          message: values.task,
        });
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Create failed",
          message: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    Promise.all([listOpportunityProjects(), readClipboardUrl()])
      .then(([loadedProjects, clipboardUrl]) => {
        setProjects(loadedProjects);
        if (clipboardUrl) {
          setValue("link", clipboardUrl);
        }
      })
      .catch(async (error) => {
        await showToast({
          style: Toast.Style.Failure,
          title: "Load failed",
          message: error instanceof Error ? error.message : String(error),
        });
      })
      .finally(() => setIsLoading(false));
  }, [setValue]);

  return (
    <Form
      isLoading={isLoading || isSubmitting}
      enableDrafts
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Log Opportunity Task"
            icon="➕"
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        title="Task"
        placeholder="Apply: company role"
        {...itemProps.task}
      />
      <Form.Dropdown title="Time" {...itemProps.time}>
        {TIME_OPTIONS.map((time) => (
          <Form.Dropdown.Item key={time} value={time} title={time} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown title="Project" {...itemProps.projectId}>
        {projects.map((project) => (
          <Form.Dropdown.Item
            key={project.id}
            value={project.id}
            title={project.title}
          />
        ))}
      </Form.Dropdown>
      <Form.TextField
        title="Link"
        placeholder="Job, freelance post, page, or proof URL"
        {...itemProps.link}
      />
    </Form>
  );
}

async function readClipboardUrl() {
  try {
    const clipboard = await Clipboard.read();
    const text = clipboard.text?.trim();
    return text && /^https?:\/\/\S+$/i.test(text) ? text : "";
  } catch {
    return "";
  }
}
