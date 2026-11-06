# Sources et ressources de cette version

Les trois captures fournies par Julien servent de référence au mécanisme : portrait composé d’images, traversée dans la profondeur, fiche visuelle superposée. Aucune marque, photographie de projet ou couverture des captures n’est reprise.

Le portrait humain provisoire a été généré avec l’outil intégré image_gen. Source locale : `public/portrait/source.png`. Prompt complet : `public/portrait/PROMPT.txt`. Les couvertures et les deux visuels complémentaires de chacun des dix concepts sont des créations vectorielles procédurales du projet. Tous les concepts sont fictifs et identifiés comme démonstrations.

## API vérifiées

Le rendu utilise les attributs d’une [InstancedBufferGeometry](https://threejs.org/docs/pages/InstancedBufferGeometry.html), une [ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html) et un [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html). Les API ont aussi été vérifiées dans le code du paquet Three.js 0.180 installé. La version actuelle du renderer requiert WebGL 2 ; la page propose une alternative statique et une liste accessible lorsqu’il manque.

Les données de positions et les identifiants des miniatures sont produits par le générateur local. La luminance et les volumes viennent de la source provisoire. La photo source n’est pas affichée sous le canvas.

Les fichiers de police Space Grotesk sont locaux ; leur licence SIL OFL est incluse dans le livrable. Georgia est utilisée comme police système.
