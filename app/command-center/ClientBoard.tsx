"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarBlank, Kanban, ArrowSquareOut } from "@phosphor-icons/react";
import type { WorkItem } from "@/lib/command-center";
import type { AsanaProject } from "@/lib/command-center-asana";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Props = {
  work: WorkItem[];
  projects: AsanaProject[];
  onOpenTask: (work: WorkItem) => void;
};

function savedView(key: string, choices: string[], fallback: string) {
  try {
    const value = localStorage.getItem(key);
    return value && choices.includes(value) ? value : fallback;
  } catch { return fallback; }
}

/** Client sections identify companies; contact names are never guessed from task text. */
export default function ClientBoard({ work, projects, onOpenTask }: Props) {
  const [view, setView] = useState(() => savedView("singleton-client-work-view", ["content", "outreach"], "content"));
  const [contentTab, setContentTab] = useState(() => savedView("singleton-client-content-tab", ["active", "pending"], "active"));
  const [outreachTab, setOutreachTab] = useState("follow-up");
  useEffect(() => {
    try {
      localStorage.setItem("singleton-client-work-view", view);
      localStorage.setItem("singleton-client-content-tab", contentTab);
    } catch { /* The current view remains usable without browser storage. */ }
  }, [view, contentTab]);
  const columns = useMemo(() => {
    const project = projects.find((item) => item.name === "Content Editor");
    if (!project) return [];
    const active = work.filter((item) => item.owner === "asana" &&
      item.projectId === project?.id && item.dueDate &&
      !["done", "completed", "cancelled", "canceled"].includes(item.status.toLowerCase()));
    const groups = new Map<string, { title: string; tasks: WorkItem[] }>();
    for (const task of active) {
      const section = project?.sections.find((item) => item.id === task.sectionId);
      const key = section?.id ?? "unassigned";
      const group = groups.get(key) ?? { title: section?.name ?? "No client section", tasks: [] };
      group.tasks.push(task);
      groups.set(key, group);
    }
    return [...groups.entries()].map(([id, group]) => ({ id, ...group,
      tasks: group.tasks.sort((a, b) => a.dueDate!.localeCompare(b.dueDate!) || a.title.localeCompare(b.title)),
    }));
  }, [projects, work]);

  return (
    <section className="cc-client-board" aria-label="Client work board">
      <div className="cc-board-heading">
        <div>
          <label className="cc-work-view">
            <span className="sr-only">Client work view</span>
            <select value={view} onChange={(event) => setView(event.target.value)}>
              <option value="content">Content Editor</option>
              <option value="outreach">Video Outreach</option>
            </select>
          </label>
        </div>
        <span className="cc-board-layout"><Kanban size={16} /> Board</span>
      </div>
      {view === "content" ? (
        <Tabs value={contentTab} onValueChange={setContentTab} className="cc-board-tabs">
          <TabsList aria-label="Content Editor views">
            <TabsTrigger value="active">Active <span className="cc-tab-count">{columns.reduce((sum, column) => sum + column.tasks.length, 0)}</span></TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            {columns.length ? <div className="cc-kanban">
              {columns.map((column, index) => <section className="cc-company-column" key={column.id}>
                <div className="cc-company-heading"><span className={`cc-company-dot cc-company-dot-${index % 4}`} /><h2>{column.title}</h2><span>{column.tasks.length}</span></div>
                {column.tasks.map((task) => <Card key={task.id} className="cc-deliverable-card">
                  <CardContent className="p-0">
                    <Button variant="ghost" className="cc-deliverable-open" aria-label={`Open ${task.title}`} onClick={() => onOpenTask(task)}>
                      <span className="cc-card-check" aria-hidden="true" />
                      <span><strong>{task.title}</strong><time dateTime={task.dueDate!}><CalendarBlank size={14} />{new Date(`${task.dueDate!.slice(0, 10)}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time></span>
                    </Button>
                  </CardContent>
                </Card>)}
              </section>)}
            </div> : <div className="cc-board-empty"><Kanban size={28} /><h2>No dated client work</h2><p>Open Asana deliverables will appear in their client sections.</p></div>}
          </TabsContent>
          <TabsContent value="pending"><div className="cc-board-empty"><CalendarBlank size={28} /><h2>Define your Pending view</h2><p>Its rules still need review. Active work stays in Active.</p></div></TabsContent>
        </Tabs>
      ) : (
        <Tabs value={outreachTab} onValueChange={setOutreachTab} className="cc-board-tabs">
          <TabsList aria-label="Video Outreach views"><TabsTrigger value="follow-up">Follow-up</TabsTrigger></TabsList>
          <TabsContent value="follow-up"><div className="cc-board-empty"><ArrowSquareOut size={28} /><h2>Your outreach view is next</h2><p>The Sheet connection and unsent Codex draft return are still being verified.</p></div></TabsContent>
        </Tabs>
      )}
    </section>
  );
}
