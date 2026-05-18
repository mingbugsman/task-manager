import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import type { ProjectSummary } from "@/src/types/api.types";

const barColors = ["bg-blue-500", "bg-teal-500", "bg-violet-500", "bg-emerald-600"];

interface ProjectProgressListProps {
  projects: ProjectSummary[];
}

export function ProjectProgressList({ projects }: ProjectProgressListProps) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <section className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">Tiến Độ Dự Án</h2>
        <Link href="/projects" className="text-sm font-medium text-blue-600 hover:underline">
          Xem tất cả
        </Link>
      </section>

      <section className="space-y-5">
        {projects.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">Chưa có dự án nào</p>
        ) : (
          projects.slice(0, 4).map((project, i) => (
            <section key={project.projectId}>
              <section className="mb-2 flex items-center justify-between text-sm">
                <Link
                  href={`/projects/${project.projectId}`}
                  className="font-medium text-slate-800 hover:text-blue-600"
                >
                  {project.projectName}
                </Link>
                <span className="font-semibold text-slate-600">
                  {Math.round(project.progressRate)}%
                </span>
              </section>
              <Progress
                value={project.progressRate}
                barClassName={barColors[i % barColors.length]}
              />
            </section>
          ))
        )}
      </section>
    </article>
  );
}
