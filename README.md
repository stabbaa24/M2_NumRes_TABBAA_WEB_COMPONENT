# Lecteur Audio

## En quoi consiste le projet ?
Le **Lecteur Audio** est un projet basé sur les Web Components permettant de proposer un lecteur audio personnalisé, capable de charger et lire des fichiers audio, tout en offrant des contrôles d’interface pour ajuster différents paramètres audio.

Pour l'instant, je n'ai pas pu intégrer la notion de sous WebComponents pour des affichages WebAudio (comme le potentiomètre ou la visualisation de fréquences) car j'ai préféré me concentrer sur la partie du générateur de logo. Toutefois, ces améliorations seront implémentées d'ici le prochain rendu.

## Travail réalisé et à faire

### Travail à faire
- Créer un lecteur audio personnalisé avec Web Components en utilisant l'API `<audio>` de HTML5 pour gérer les actions basiques (play/pause/stop, avancer, changer le volume, afficher une barre de progression).
- Ajouter un réglage de la stéréo.
- Ajouter une visualisation des fréquences audio.
- Utiliser un ou plusieurs **WebAudio Controls** pour les réglages de volume, stéréo, etc.
- Réfléchir à une décomposition en plusieurs **Web Components** :
  - Un composant pour la visualisation
  - Un composant égaliseur de fréquences
  - Un composant playlist, etc.

## Structure des fichiers
Voici un résumé des différents fichiers du projet audio et de leur rôle :

- **index.html** : Le fichier principal qui intègre le composant `<audio-generator>` dans le DOM pour afficher le lecteur audio sur la page.
- **audioComponent.html** : Contient le code HTML du composant personnalisé `<audio-generator>`, y compris la structure pour les contrôles audio et l'affichage.
- **audioComponent.css** : Ce fichier CSS définit le style des différents éléments de l'interface du lecteur audio, des contrôles de lecture aux réglages du volume.
- **audioComponent.js** : Le script JavaScript principal qui contient la logique du composant Web. Il permet de charger des vidéos YouTube, de gérer les contrôles (play, pause, stop, vitesse de lecture, mute), et de manipuler le lecteur audio de manière interactive.
- **grid.css** : Définit la mise en page générale du lecteur audio, avec un système de grille pour organiser les éléments (header, contrôles à gauche, visualisation à droite, et footer).

## Fonctionnalités actuelles
Le lecteur audio dispose des fonctionnalités suivantes :

- **Lecture et Contrôles basiques** : Play, Pause, Stop, modification de la vitesse de lecture (accélérer ou ralentir), mute.
- **Volume** : Ajustement du volume à l'aide d'une barre de contrôle de volume.
- **Chargement via YouTube** : Permet de charger et lire des vidéos YouTube en saisissant une URL.
- **Interface Responsive** : Les contrôles audio et les éléments de visualisation s'adaptent à la taille de l'écran (grâce aux styles CSS responsives).

## Fonctionnalités futures
Les fonctionnalités qui seront ajoutées dans les versions futures incluent :

- **Visualisation des Fréquences** : Ajouter une visualisation en temps réel des fréquences audio jouées.
- **Réglage de la Stéréo** : Permettre le réglage de la stéréo pour une expérience sonore plus riche.
- **Décomposition en Sous-Composants** : Création de sous WebComponents pour décomposer le lecteur audio en plusieurs éléments spécifiques, tels qu'un composant de visualisation, un égaliseur de fréquences et une playlist.
- **Utilisation des WebAudio Controls** : Intégration de contrôles WebAudio plus avancés (potentiomètres pour le volume, la stéréo, etc.).
