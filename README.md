# Julien Leonetti — Scène continue

Portfolio local en français : React, TypeScript, Vite et GSAP. Une seule scène plein écran contient la galerie, les trois expériences et les petits panneaux À propos et Contact. Le défilement vertical natif traverse la galerie avec une progression finie.

## Lancer

Node.js 22.14+ et npm :

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
npm run preview
```

Le build statique est dans `dist/`. Pour installer le navigateur des tests : `npx playwright install chromium`.

## Modifier le contenu

- `src/data/site.ts` : présentation et coordonnées (`email`, `github`, `linkedin`, `cv`). Seuls les liens valides renseignés apparaissent dans le panneau Contact. Pour un CV : `public/cv.pdf`, puis `cv: './cv.pdf'`.
- `src/data/experiments.ts` : les trois expériences réellement créées pour ce portfolio.
- `src/data/projects.ts` : le tableau `projects` reste vide en attendant les projets réels.
- `src/hooks/useGallery.ts` : positions, profondeur, cadrage mobile et progression du scroll.
- `src/styles.css` : palette, interface et typographie. Space Grotesk est servi localement sous licence SIL OFL ; Georgia italique est une police système.

## Ajouter un projet

Respecter le type `Project` : `title`, `slug` unique, `category`, `description`, `disciplines`, `image: {src, alt}`, `context`, `role`, `approach: string[]`, `gallery: {src, alt}[]`, `links: {label, url}[]`.

Placer les images dans `public/projects/`, puis utiliser `./projects/fichier.webp`. Un projet valide rejoint la scène et la lecture simplifiée avec la mention PROJET. Son détail s’ouvre dans le même espace. Les données incomplètes, les slugs dupliqués et les noms réservés au laboratoire sont exclus. Aucun projet de démonstration n’est livré.

## Navigation et accessibilité

Explorer ramène au cadrage initial. Les repères discrets en bas centrent directement chaque expérience. À propos et Contact ouvrent un panneau sans changer l’URL. Les expériences utilisent les mêmes surfaces qu’en galerie. La fermeture au bouton ou à Échap restitue le focus et la position exacte avant ouverture.

Lecture simplifiée reste disponible en bas de l’interface. Elle est activée automatiquement avec mouvement réduit ou sans WebGL. Les interactions sont accessibles par boutons et au toucher. La commande pause supprime l’interpolation des déplacements et du shader.

La galerie utilise CSS 3D et SVG ; un seul canvas WebGL est monté lors de l’ouverture de Surface sensible. Le rendu est à la demande, le DPR est plafonné à 1,5 et les ressources sont libérées à la fermeture. Aucun son automatique ni ressource visuelle distante.

## Vérification

Les tests Chromium couvrent les cadrages 390/768/1440 px, la scène unique, le défilement dans les deux sens, le retour aux positions précédentes, les panneaux sans changement d’URL, le focus, les trois interactions, le tactile, le redimensionnement, la lecture simplifiée, le mouvement réduit et l’absence de WebGL. Une donnée technique injectée uniquement dans le navigateur vérifie l’ajout des futurs projets.

Captures de la version courante : `.artifacts/continuous-*.png`. Les anciennes captures restent archivées. Tests sur navigateur, sans appareil mobile physique.
