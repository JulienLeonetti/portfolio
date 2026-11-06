# Julien Leonetti — Portrait de projets

Une seule page : un visage en miniatures se forme, le scroll traverse ces images et les projets s’ouvrent dans une fiche à défilement indépendant. Dix concepts fictifs sont marqués **Projet de démonstration**.

## Lancer

Node.js 22.14+ :

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Le livrable statique est `dist/`. Pour installer Chromium si nécessaire : `npx playwright install chromium`. Les tests utilisent le port 5185.

## Remplacer le portrait

Le portrait représente un adulte fictif, **pas Julien**. Il a été généré avec l’outil intégré image_gen ; le prompt est dans `public/portrait/PROMPT.txt`.

1. Remplacer `public/portrait/source.png` par une photo en buste 3:4, sur fond noir ou transparent, avec les traits du visage lisibles.
2. Exécuter `npm run assets` pour recalculer les positions, la luminance, l’atlas et le portrait statique.
3. Passer `provisional` à `false` dans `src/data/portrait.ts`.

La photo source n’est pas affichée derrière le canvas. Les miniatures et leur luminosité forment réellement le visage.

## Remplacer les projets et coordonnées

Modifier `src/data/projects.json` : `slug`, `title`, `category`, `description`, `accent`, `image: {src, alt}`, `gallery`, `context`, `role`, `approach`, `disciplines`, `links`, `demonstration`.

Placer les visuels dans `public/projects/`, avec des chemins locaux comme `./projects/couverture.webp` (4:3 recommandé). Passer `demonstration` à `false` pour un vrai projet. Après ajout, retrait, changement de couverture ou d’ordre, relancer `npm run assets`.

Les 30 visuels SVG de démonstration sont locaux et originaux. Le générateur conserve les fichiers existants ; `npm run assets -- --demo-visuals` recrée volontairement les démonstrations d’origine.

`src/data/site.ts` centralise la présentation et les coordonnées. E-mail, GitHub, LinkedIn et CV restent masqués s’ils sont vides. Pour le CV : `public/cv.pdf`, puis `cv: './cv.pdf'`.

## Navigation et vérification

Explorer entre dans les projets. Précédent/suivant et les flèches gauche/droite les parcourent. Une fiche utilise `#projet/slug` : lien direct, copie du lien et historique fonctionnent dans la même page. Échap ferme la fiche et restitue le focus et le scroll. Retour au portrait revient à la composition initiale.

Un seul canvas Three.js instancié et un atlas servent environ 8 900 rectangles, avec densité réduite sur mobile et positions déterministes. Après l’entrée, le rendu est à la demande. Mouvement réduit : portrait déjà formé. Sans WebGL 2 : portrait statique et liste accessible. Les grandes images des fiches sont chargées à la demande.

La scène est dans `src/components/PortraitScene.tsx`, la progression dans `src/hooks/useJourney.ts`, les fiches dans `src/components/ProjectModal.tsx` et le générateur dans `scripts/build-assets.cjs`.

Tests Chromium : 390/768/1440 px, scroll inverse, entrée interrompue, fiches, presse-papiers, lien direct, historique, clavier, tactile, redimensionnement, clics rapides et modes accessibles. Captures : `.artifacts/mosaic-*.png`. Aucun appareil mobile physique testé. Space Grotesk est local sous SIL OFL ; Georgia est une police système.
