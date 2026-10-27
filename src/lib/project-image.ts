import imageDetails from "@/data/project-images.json";
import type { Project } from "@/data/portfolio";

// Updating a capture must also invalidate the image optimizer/CDN cache.
export function getProjectImage(project: Project, preview = false): string {
  const source = preview
    ? `/projects/previews/${project.id}.webp`
    : project.fullPageImage || project.image;
  const details = imageDetails[project.id as keyof typeof imageDetails];
  const version = details && "version" in details ? details.version : undefined;
  return version ? `${source}?v=${version}` : source;
}
