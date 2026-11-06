import { safeUrl } from './site';
import projectData from './projects.json';
export type ProjectImage={src:string;alt:string};
export type Project={
  slug:string;title:string;category:string;description:string;disciplines:string[];
  image:ProjectImage;context:string;role:string;approach:string[];gallery:ProjectImage[];
  links:{label:string;url:string}[];demonstration:boolean;accent:string;
};
export const projects:Project[]=projectData;
export function validProjects(items:Project[]){
  const slugs=new Set<string>();
  return items.filter(project=>{
    const valid=/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)&&!slugs.has(project.slug)&&[project.title,project.category,project.description,project.image?.src,project.image?.alt,project.context,project.role].every(value=>typeof value==='string'&&value.trim())&&project.gallery.every(image=>image.src&&image.alt)&&project.links.every(link=>link.label&&safeUrl(link.url));
    if(valid)slugs.add(project.slug);return valid;
  });
}
export const publishedProjects=validProjects(projects);
