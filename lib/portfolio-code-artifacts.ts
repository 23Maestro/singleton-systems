import { codeToHtml } from "shiki";
import type { CodeArtifactLanguage, HighlightedCodeArtifactMap } from "./portfolio-code-artifact-types";

type CodeArtifactSource = {
  key: string;
  title: string;
  language: CodeArtifactLanguage;
  source: string;
};

const codeArtifactSources: CodeArtifactSource[] = [
  {
    key: "supabase",
    title: "supabase-contract",
    language: "json",
    source: `[
  {
    "workflow": "Scout Prep post-call action",
    "source_action": "Raycast Scout Prep",
    "laravel_fastapi_write": "Task/stage update route succeeds first",
    "supabase_write": "lifecycleSalesStage"
  },
  {
    "workflow": "Scout Prep meeting set",
    "source_action": "Raycast Scout Prep",
    "laravel_fastapi_write": "Meeting creation and sales stage save succeed first",
    "supabase_write": "recordMeetingSet / lifecycle mutation plus set_meeting_confirmation_cache"
  },
  {
    "workflow": "Confirmation texts",
    "source_action": "Raycast View Set Meetings / Head Scout Schedules",
    "laravel_fastapi_write": "Calendar title prefix update or verified live booked meeting read",
    "supabase_write": "Confirmation cache, event title state, and verified active appointments row"
  }
]`,
  },
  {
    key: "adapter",
    title: "legacy-api.json",
    language: "json",
    source: `{
  "_token": "<CSRF_TOKEN>",
  "contact_task": "<LEGACY_CONTACT_TASK_ID>",
  "athlete_main_id": "<LEGACY_PROFILE_ID>",
  "messageid": "<NUMERIC_MESSAGE_ID>",
  "videoscoutassignedto": "<LEGACY_OWNER_ID>",
  "contactfor": "<athlete|parent>",
  "contact": "recipient@example.com",
  "video_progress_stage": "<STAGE_LABEL>",
  "video_progress_status": "<STATUS_LABEL>"
}`,
  },
  {
    key: "audit",
    title: "live-parity.test",
    language: "typescript",
    source: `test('call activity owner-context rows project into call_log shape', () => {
  const row = projectEventRowToCallLog({
    id: 'activity-row-1',
    raw_event_type: 'call_activity',
    source: 'call_activity',
    tracker_outcome: 'spoke_follow_up',
    occurred_at: '2026-06-01T14:00:00Z',
    reporting_at: '2026-06-01T14:00:00Z',
    athlete_key: 'athlete:1',
    athlete_name: 'Ryan Example',
    raw_task_status: 'spoke_to_follow_up',
    dedupe_key: 'activity:task-1',
    compatibility_source_owner: 'Primary Operator',
    compatibility_owner_proof: 'task_assigned_owner',
    active_operator_key: 'operator_primary',
    counts_as_dial: true,
    counts_as_contact: true,
    counts_as_meeting_set: false,
    counts_as_post_meeting_outcome: false,
  });

  expect(row.owner_proof).toBe('task_assigned_owner');
  expect(row.counts_as_contact).toBe(true);
});`,
  },
];

export async function getPortfolioCodeArtifacts(): Promise<HighlightedCodeArtifactMap> {
  const artifacts = await Promise.all(
    codeArtifactSources.map(async (artifact) => {
      const html = await codeToHtml(artifact.source, {
        lang: artifact.language === "typescript" ? "ts" : artifact.language,
        theme: "github-light",
      });

      return [
        artifact.key,
        {
          key: artifact.key,
          title: artifact.title,
          language: artifact.language,
          html,
        },
      ] as const;
    }),
  );

  return Object.fromEntries(artifacts);
}
