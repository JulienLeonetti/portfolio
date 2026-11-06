import { safeUrl } from './site';

export type ProjectImage = { src: string; alt: string };
export type Project = {
  slug: string;
  title: string;
  category: string;
  description: string;
  disciplines: string[];
  image: ProjectImage;
  context: string;
  role: string;
  approach: string[];
  gallery: ProjectImage[];
  links: { label: string; url: string }[];
};

// Ajouter uniquement des projets réels. Une liste vide ne produit aucune section.
export const projects: Project[] = [];

export function validProjects(items: Project[]) {
  const slugs = new Set<string>();
  return items.filter(p => {
    const valid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) && !slugs.has(p.slug) && !['typographie-vivante','grille-en-transformation','surface-sensible'].includes(p.slug)
      && [p.title,p.category,p.description,p.context,p.role,p.image?.src,p.image?.alt].every(v => typeof v === 'string' && v.trim())
      && p.disciplines.length > 0 && p.approach.length > 0
      && p.gallery.every(i => i.src && i.alt)
      && p.links.every(l => l.label && safeUrl(l.url));
    if(valid) slugs.add(p.slug);
    return valid;
  });
}
export const publishedProjects = validProjects(projects);
