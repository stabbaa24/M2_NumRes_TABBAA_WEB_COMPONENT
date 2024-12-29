# Générateur de Logo

## En quoi consiste le projet ?
Le **Générateur de Logo** est un projet qui permet de créer des logos personnalisés à partir de différents paramétrages, notamment en jouant sur les couleurs, les formes, les textes et leur disposition. L'objectif de ce projet est de proposer un outil simple pour générer un logo adapté aux besoins d'un utilisateur, sans nécessiter des compétences avancées en graphisme.

Ce projet est implémenté sous forme de **WebComponent**, permettant ainsi une intégration facile et réutilisable. Le composant est utilisé dans le fichier `index.html` via la balise personnalisée `<logo-generator>`.

## Structure des fichiers
Voici un résumé des différents fichiers de ce projet et de leur rôle :

- **index.html** : Fichier principal pour l'interface utilisateur. Il contient le code HTML permettant l'affichage de l'interface du générateur de logo.
- **styles.css** : Ce fichier contient toutes les définitions de style pour rendre l'interface plus attractive et confortable à utiliser.
- **script.js** : Le script JavaScript qui contient la logique pour la création et la personnalisation du logo. Il permet notamment d'appliquer les différents paramètres sélectionnés par l'utilisateur.
- **assets/** : Dossier qui contient toutes les ressources nécessaires (images, icônes, etc.) pour la création des logos.
- **grid.css** : Fichier CSS pour la grille de l'interface qui aide à organiser les éléments de manière propre et structurée.
- **logoComponent.css** : Styles spécifiques au composant du logo, incluant la gestion de l'apparence des différents éléments du logo généré.
- **logoComponent.html** : Contient le code HTML du composant personnalisé `<logo-generator>`, permettant de le définir et de l'intégrer facilement.
- **logoComponent.js** : Logique JavaScript pour le WebComponent, gère la création dynamique et l'interaction avec les éléments du logo.
- **settings.css** : Styles liés aux paramètres et contrôles d’interface utilisateur permettant de personnaliser le logo.
- **text.css** : Fichier de style pour les éléments de texte, permettant une personnalisation avancée des options typographiques (police, taille, style).

## Paramétrages possibles
Le générateur de logo permet de personnaliser différents aspects du logo. Voici les options de paramétrage disponibles :

- **Texte** : 
  - Saisie du texte qui apparaîtra sur le logo.
  - Choix de la police de caractères (taille, type, style).

- **Couleurs** :
  - Ombrage et dégradé de couleurs pour chaque texte.
  - Couleur du texte et des éléments graphiques.

- **Images et icônes** :
  - Import d'images ou d'icônes personnelles.
  - Ajustement de la taille, de la position et de la transparence.

- **Disposition** :
  - Possibilité de modifier l'alignement et la mise en page des éléments du logo.

- **Animation** :
  - Effets d'animation pour rendre le logo plus dynamique et attractif sur le texte et icones.

## Comment démarrer
Pour commencer à utiliser le générateur de logo, clonez la branche `LogoGenerator` du projet et ouvrez le fichier `index.html` dans votre navigateur. Aucune configuration supplémentaire n'est requise, vous pouvez commencer à créer vos logos immédiatement.

## Difficultés rencontrées
Générer le code du logo avec les animations fonctionnelles. Pour l'instant ceci ne fonctionne pas.

## Fonctionnalités futures
Actuellement, le générateur de logo est en version initiale, et nous prévoyons d'ajouter plus de fonctionnalités telles que :

- Ajout de couleur de fond standart
- Avoir un panel de choix pour les images de fond
- Pouvoir ajouter des formes géométriques
- Mettre les effets d'ombre et de lumière sur les icones
- Ajout de couche pour pouvoir superposer les éléments
- Ajout de plus d'options pour les animations
- Ajout d'autre options (to be continued...)
