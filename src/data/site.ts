export const profile = {
  name: 'Julien Leonetti',
  location: 'Corse, France',
  education: 'BUT Métiers du Multimédia et de l’Internet',
  school: 'IUT de Corse',
  introduction: 'Moi, c’est Julien. Étudiant en MMI en Corse, je mêle design, développement et création numérique.',
  email: '',
  github: '',
  linkedin: '',
  cv: '', // Ex. './cv.pdf', à placer dans public/
};
export const site = profile;
export const skills = [
  {title:'Concevoir', description:'Donner une forme à l’intuition.', tools:['UI/UX', 'Figma', 'Prototypage'], symbol:'design'},
  {title:'Développer', description:'Faire fonctionner les idées.', tools:['HTML', 'CSS', 'JavaScript', 'React', 'PHP/MySQL'], symbol:'code'},
  {title:'Expérimenter', description:'Chercher ce qui n’existe pas encore.', tools:['Création graphique', 'Unity', 'Three.js'], symbol:'creation'},
];
export function safeUrl(value: string, allowLocal = false): string | undefined {
  if (!value.trim()) return undefined;
  if (allowLocal && /^(\.\/|\/)(?!\/)/.test(value)) return value;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? value : undefined; } catch { return undefined; }
}
export const contactLinks = [
  ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? [{label:'M’écrire', href:'mailto:' + profile.email}] : []),
  ...[{label:'GitHub',href:safeUrl(profile.github)}, {label:'LinkedIn',href:safeUrl(profile.linkedin)}, {label:'Mon CV',href:safeUrl(profile.cv,true)}].filter((l): l is {label:string;href:string} => Boolean(l.href)),
];
