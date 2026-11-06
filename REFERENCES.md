## Révision à partir des deux captures fournies

La galerie noire et verte fournie par Julien devient la scène principale et conserve ses compositions, légendes, courbes et effets. L’organisation de la deuxième capture inspire les quatre repères en haut, la présentation courte en bas à gauche et la signature typographique. La révision réutilise les composants locaux ; les informations s’ouvrent dans la même scène, sans changement d’URL. La lecture simplifiée sert désormais uniquement à l’accessibilité.
# Notes de conception et sources

Consultation le 6 novembre 2026. Les références servent à comprendre les mécanismes ; aucune image ni composition de projet n’a été reprise.

- [Vadim Carazan](https://vadimcarazan.com/) : entrée et défilement observés dans Chromium. Le nom occupe la partie basse et le scroll avance dans une constellation d’images. Principe retenu : déplacement spatial continu avec une interface fixe, une identité immédiatement lisible et des panneaux proches qui sortent du cadre.
- [Sélection Portfolio Awwwards](https://www.awwwards.com/websites/portfolio/) : sélection accessible. Principe retenu : distinguer visuellement les propositions tout en conservant une lecture rapide de leur contenu. Ce n’est pas une interaction unique à reproduire.
- [Interaction Library](https://www.awwwards.com/sites/interaction-library) : fiche et médias Elements accessibles ; site direct en erreur de connexion dans cet environnement. Les aperçus montrent une bibliothèque en profondeur et des surfaces graphiques réordonnées. Principe retenu : le même contenu peut passer d’une disposition spatiale à une vue de consultation.
- [Mind of Akira](https://www.awwwards.com/sites/mind-of-akira) : fiche et planche Elements accessibles ; navigation complète du site direct non vérifiée. La fiche décrit plusieurs interactions manipulables (vinyle, globe, conduite) ; les aperçus associent repères graphiques et zones de lecture. Principe retenu : des expériences autonomes avec une action immédiatement compréhensible, puis un retour simple au parcours.
- [Daiki Fujita](https://www.awwwards.com/sites/daiki-fujita-portfolio) : fiche et médias Elements accessibles ; site direct en erreur de connexion. Le contraste entre présentation typographique claire et monde immersif est visible dans les aperçus. Principe retenu : proposer deux modes de lecture cohérents et réemployer les mêmes signes graphiques.

Les limites réseau ne permettent pas d’affirmer une validation complète des interactions de chaque site lié.

## Choix techniques vérifiés

- [GSAP to](https://gsap.com/docs/v3/GSAP/gsap.to/) et [killTweensOf](https://gsap.com/docs/v3/GSAP/gsap.killTweensOf/) : interpolation et interruption explicite des transformations.
- [CSS transform-style](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style) : contraintes des transformations spatiales ; les panneaux utilisent ici leur propre perspective.
- [WebGL : rendu 2D](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context) : surface procédurale dans un canvas unique, buffers réutilisés.
- [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction) : compatibilité React 19 / Fiber 9 vérifiée. La version finale n’importe pas R3F : la perspective DOM suffit à cette galerie et conserve une première image légère.
- Police Space Grotesk : licence SIL OFL 1.1 vérifiée dans le paquet installé. Les versions du projet sont figées par le lockfile.