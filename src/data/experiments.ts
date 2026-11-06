export type Experiment = {
  slug: string;
  title: string;
  category: string;
  description: string;
  instruction: string;
  number: string;
};
export const experiments: Experiment[] = [
  {slug:'typographie-vivante', title:'Typographie vivante', category:'TYPOGRAPHIE · MOUVEMENT', description:'La lettre devient une matière.', instruction:'Déplacez le pointeur sur les lettres, ou touchez la composition.', number:'01'},
  {slug:'grille-en-transformation', title:'Grille en transformation', category:'SYSTÈME · COMPOSITION', description:'Un système. Trois façons de voir.', instruction:'Transformez la grille, puis revenez à son état précédent.', number:'02'},
  {slug:'surface-sensible', title:'Surface sensible', category:'MATIÈRE · INTERACTION', description:'Un geste, et tout se propage.', instruction:'Parcourez la surface pour y faire naître une onde.', number:'03'},
];
