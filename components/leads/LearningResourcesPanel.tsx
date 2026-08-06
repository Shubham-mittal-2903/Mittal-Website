"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ExternalLink } from "lucide-react";
import { addResource, toggleResource, addLearningProject } from "@/lib/actions/learning";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

type Resource = { id: string; title: string; url: string | null; completed: boolean };
type ProjectItem = { id: string; name: string; url: string | null };

export function ResourcesPanel({ topicId, resources }: { topicId: string; resources: Resource[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  async function add() {
    if (!title.trim()) return;
    await addResource(topicId, { title, url });
    setTitle("");
    setUrl("");
    router.refresh();
  }

  async function toggle(id: string, completed: boolean) {
    await toggleResource(id, topicId, completed);
    router.refresh();
  }

  return (
    <div className="card-glow relative z-10">
      <h3 className="mb-4 text-sm font-semibold">Resources</h3>
      <div className="relative z-10 mb-4 flex flex-wrap gap-2">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="max-w-[10rem]" />
        <Input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} className="max-w-[10rem]" />
        <Button type="button" size="sm" onClick={add}>
          <Plus size={14} />
        </Button>
      </div>
      {resources.length === 0 ? (
        <p className="relative z-10 text-sm text-muted-foreground">No resources yet.</p>
      ) : (
        <div className="relative z-10 space-y-2">
          {resources.map((r) => (
            <label key={r.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5 text-sm">
              <Checkbox checked={r.completed} onCheckedChange={(v) => toggle(r.id, v === true)} />
              <span className={r.completed ? "flex-1 text-muted-foreground line-through" : "flex-1"}>{r.title}</span>
              {r.url && (
                <a href={r.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                  <ExternalLink size={14} />
                </a>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectsPanel({ topicId, projects }: { topicId: string; projects: ProjectItem[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  async function add() {
    if (!name.trim()) return;
    await addLearningProject(topicId, { name, url });
    setName("");
    setUrl("");
    router.refresh();
  }

  return (
    <div className="card-glow relative z-10">
      <h3 className="mb-4 text-sm font-semibold">Projects</h3>
      <div className="relative z-10 mb-4 flex flex-wrap gap-2">
        <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} className="max-w-[10rem]" />
        <Input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} className="max-w-[10rem]" />
        <Button type="button" size="sm" onClick={add}>
          <Plus size={14} />
        </Button>
      </div>
      {projects.length === 0 ? (
        <p className="relative z-10 text-sm text-muted-foreground">No projects logged yet.</p>
      ) : (
        <div className="relative z-10 space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm">
              <span>{p.name}</span>
              {p.url && (
                <a href={p.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
