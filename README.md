# Projet Web Audio Components - Thème **Arcane**

Ce projet a été réalisé par **Arthur PRUDENT** et **S. TABBAA** dans le cadre du module *Technologie Web*. Inspiré par la série **Arcane**, ce projet propose une expérience immersive mêlant audio et animations visuelles. Les différents web components interagissent de manière harmonieuse, orchestrés par le composant parent **AudioComponent** du dossier **audio**.

## 🎨 Thème : **Arcane**
Nous avons utilisé le thème de la série **Arcane** pour créer une expérience audio-visuelle unique. Les composants ont été conçus pour refléter l'ambiance sombre et immersive de la série, en utilisant des couleurs et des éléments visuels inspirés de l'univers de **Piltover** et de **Zaun**.
Pour la police, nous avons téléchargé une police personnalisée inspirée de la série **Arcane**. Nous avons également créé des images pour les contrôles de volume et de mute, en utilisant des éléments graphiques de la série.

## 🎥 Vidéo de Présentation

Nous avons également réalisé une **vidéo de présentation** de notre projet pour illustrer son concept et ses fonctionnalités. 🎬✨  
Cette vidéo est hébergée sur **YouTube**, et nous espérons que vous l'apprécierez autant que nous avons pris plaisir à la créer !  
Vous pouvez la visionner en suivant ce lien : [📺 Voir la vidéo](https://www.youtube.com/watch?v=NpV4UqVhToU)

N'hésitez pas à nous donner votre avis en commentaire sur la vidéo ou sur ce projet ! 😊

## 🚀 Réutilisation des web components sur CodePen ou Jsbin

### Collection CodePen

Nous avons créé une collection sur **CodePen** regroupant tous les web components de notre projet. Elle est accessible ici : [**CodePen Collection**](https://codepen.io/collection/JYGYkm).

- **8 sous-web components :** Chaque composant individuel a son propre exemple dans la collection, vous permettant d'explorer et de tester leur fonctionnement indépendamment.
- **CodePen Home - AudioComponent - All :** Une démonstration globale rassemblant tous les web components dans une seule interface, accessible ici : [**AudioComponent - All**](https://codepen.io/Siham-TABBAA/pen/WbeRZBj).

### Instructions d'utilisation

1. **Attendre le chargement complet de la playlist :**
  Lorsque vous ouvrez **AudioComponent - All**, il est nécessaire d'attendre que toute la playlist soit chargée avant d'interagir avec les web components (comptez environ **15 secondes**).

2. **Problème avec les musiques chargées depuis `assets` :**
   - Les musiques provenant du dossier `assets` ne fonctionneront pas directement sur CodePen ou Jsbin en raison de l'absence de serveur.
   - Pour contourner cela :
     - Cliquez sur **Choisir un fichier** pour sélectionner une musique de votre appareil.
     - Appuyez sur **Ajouter dans la playlist** pour l'inclure dans la liste de lecture.
     - ⚠️ **Important :** Effectuez cette action uniquement après que la playlist de base soit complètement chargée.

3. **Utilisation des web components :**
  Une fois la playlist chargée et une musique ajoutée, vous pouvez explorer et utiliser les fonctionnalités de tous les web components selon vos besoins.

## 🎯 Fonctionnalités principales

L'application repose sur un ensemble de web components modulaires, chacun ayant un rôle spécifique :

### **Fichier Principal : index.html**

Le fichier `index.html` est minimal et se concentre sur l'intégration des éléments essentiels pour faire fonctionner l'application.

#### Contenu et fonctionnalités :

1. **Inclusion du script des web audio controls :**
  ```html
    <script src="./libs/webaudio-controls.js"></script>
  ```

  Ce script est essentiel pour permettre l'utilisation des Web Audio Modules, qui offrent des contrôles interactifs pour :
  - Volume : Ajuster le niveau sonore (trouver sur le net).
  - Muet : Activer ou désactiver le son via des images que nous avons nous mêmes crée.
  - Vitesse : Contrôler la vitesse de lecture audio (trouver sur le net).
  - Gestion des fréquences : Manipuler les fréquences via des sliders que nous avons nous même créé.

2. Ajout du CSS :
  Un fichier CSS est chargé pour styliser l'interface :
  - Application d'une image de fond.
  - Utilisation d'une police personnalisée inspirée de la série Arcane.
  - La police a été trouvée sur le net via le site suivant : [(ajoutez ici l'URL du site)].

3. Utilisation de la balise du web component parent :

  Le fichier contient uniquement la balise suivante pour intégrer le composant parent qui synchronise et contrôle tous les sous-composants du projet :
  ```html
    <audio-generator></audio-generator>
  ```

### **AudioComponent (Composant Parent)**

- Le **AudioComponent** agit comme le chef d'orchestre. Il synchronise tous les sous-composants.
- Fonctionnalités :
  - Gestion des événements audio (lecture, pause, arrêt).
  - Communication avec les composants enfants pour maintenir une synchronisation parfaite.
  - Diffusion des données audio pour les visualisations et interactions.

---

### **Sous-Composants Enfants**

#### **butterchurn**
- Un visualiseur audio interactif que nous utilisons à travers des librairies téléchargées et se trouvant dans le dossier libs
  - butterchurn.js
  - butterchurnPresents.min.js
- Fonctionnalités :
  - Génération de visualisations dynamiques en fonction de la musique
  - Supporte différents styles visuels (pulsations, vagues, spectres, etc.).
  - Permet à l'utilisateur de choisir entre plusieurs presets de visualisation.

#### **controls-right**
Plusieurs sous web components ont été créés pour gérer les contrôles de l'application. Le composant **controls-right** est l'un d'entre eux. Il permet de contrôler le volume, le mute et la vitesse de lecture de l'audio.
- Web Components :
  - 1 web audio module pour le volume
  - 1 web audio module pour le mute
  - 1 web audio module pour la vitesse

#### **equalizer**

Le composant **equalizer** offre une double fonctionnalité en combinant des contrôles interactifs des fréquences audio avec un visualiseur en temps réel.
*Il s'agit du web component le plus complexe du projet.*

##### Fonctionnalités principales :

1. **Contrôle des fréquences avec sliders :**
   - Intégration de sliders verticaux (via des **Web Audio Modules**) pour ajuster le gain de différentes bandes de fréquences.
   - Chaque bande correspond à une fréquence centrale précise, allant des basses extrêmes (32 Hz) aux hautes fréquences (4100 Hz).
   - Ces sliders permettent une manipulation directe des basses, médiums et aigus pour une personnalisation sonore optimale.

2. **Visualiseur de fréquences audio :**
   - Une partie du composant affiche un spectre audio en temps réel, synchronisé avec l’**AudioComponent**.
   - Utilise la bibliothèque **audiomotion-analyzer** pour produire des visualisations dynamiques et fluides.
   - Les visualisations incluent :
     - Spectres d'amplitude.
     - Affichage des pics et des transitions douces pour une expérience visuelle immersive.

#### **launchpad**

Le composant **launchpad** est une interface interactive inspirée des contrôleurs de musique. Il permet aux utilisateurs de jouer des sons de la série **Arcane** de manière simple et intuitive.

##### Fonctionnalités principales :

1. **Interface avec 9 boutons :**
   - Chaque bouton est associé à un son unique tiré de l’univers sonore d’**Arcane**.
   - Les sons peuvent inclure des dialogues, des effets sonores ou des morceaux de la série.

2. **Contrôle via le pavé numérique :**
  Les boutons peuvent être activés soit en cliquant dessus, soit en utilisant les touches du pavé numérique de votre clavier (de 1 à 9).

#### **launchpad-effect**

Le composant **launchpad-effect** complète l’expérience du **launchpad** en ajoutant une dimension visuelle immersive.

##### Fonctionnalités principales :

1. **Affichage en plein écran :**
  Lorsqu’un son est joué via le **launchpad**, quatre image associée s'affiche un peu partout sur l'écran de manière aléatoire.

2. **Synchronisation audio-visuelle :**
  L’image s’affiche au moment exact où le son est joué, offrant une synchronisation entre les deux éléments.

#### **playlist**

Le composant **playlist** est un gestionnaire interactif de pistes audio offrant une expérience utilisateur fluide et complète. Il combine des fonctionnalités intuitives pour manipuler les morceaux et des contrôles avancés pour la lecture.

##### Fonctionnalités principales :

1. **Liste interactive des morceaux :**
   - Les morceaux sont affichés dans une liste où chaque élément est interactif.
   - **Drag and Drop** : Les utilisateurs peuvent réorganiser les morceaux dans la playlist en les glissant-déposant pour changer leur ordre de lecture.

2. **Contrôles individuels pour chaque morceau :**
   - Chaque morceau dispose de plusieurs boutons d'action :
     - **Pause/Play** : Mettre en pause ou reprendre la lecture.
     - **Rejouer** : Relancer le morceau depuis le début.
     - **Supprimer** : Retirer le morceau de la playlist.

3. **Slider de progression :**
   - Un **slider** affiche la progression en temps réel du morceau en cours de lecture.
   - De chaque côté du slider, des boutons permettent de naviguer rapidement dans la piste :
     - **-15 secondes** : Reculer de 15 secondes.
     - **+15 secondes** : Avancer de 15 secondes.

4. **Bouton de chargement de musique :**
   - Un bouton permet de charger des fichiers audio.
   - Cette fonctionnalité est particulièrement utile pour rendre le composant réutilisable dans d'autres projets, où chaque web component peut être intégré indépendamment.
   - Note : En raison de l’absence de page hôte et de serveur, les musiques chargées dans le dossier assets ne focntionne pas sur **CodePen** et **JSBin**.

5. **Modes de lecture :**
   - **Lecture aléatoire ou séquentielle** : Un bouton permet de basculer entre un mode de lecture aléatoire et une lecture dans l’ordre défini dans la playlist.
   - **Lecture en boucle :**
     - **Simple** : Répète le morceau en cours.
     - **Playlist en boucle** : Relance la playlist entière après le dernier morceau.
     - **Lecture unique** : Joue chaque morceau une seule fois sans répétition.

#### **spacilazider**

Le composant **spacilazider** est conçu pour manipuler la spatialisation audio, permettant de diriger le son vers l'oreille gauche, droite ou de le laisser en mode normal (centré). 

1. **Modes de spatialisation :**
   - **Mode gauche :** Le son est dirigé exclusivement vers le canal gauche.
   - **Mode droit :** Le son est dirigé exclusivement vers le canal droit.
   - **Mode normal :** Le son est équilibré entre les deux canaux pour une écoute traditionnelle.

2. **Utilisation des API Web Audio :**
   - Le composant exploite les capacités des **Web Audio Nodes** pour manipuler le panorama stéréo.
   - Utilisation d'un **PannerNode** pour ajuster la position du son dans l'espace.

---

## 📂 Structure du projet

Voici une vue d'ensemble de l'organisation du projet :

- **assets/** : Contient les ressources multimédia (images, vidéos, sons, etc.).
- **components/** : Inclut tous les composants web (détaillés ci-dessus).
- **libs/** : Bibliothèques nécessaires au fonctionnement du projet.
- **grid.css** : Feuille de style pour organiser le layout.
- **index.html** : Point d'entrée principal de l'application.

---

## 🤝 Contributions

Le projet a été réalisé grâce à la collaboration de **A. PRUDENT** et **S. TABBAA**, chacun ayant contribué sur des aspects spécifiques du projet :

### **A. PRUDENT :**
- Intégration des dessins
- Recherche/Ajout des ressources multimédia
- Développement des sous web components :
  - Volume
  - Playlist
  - Speed

### **S. TABBAA :**
- Architecture du projet
- Web Component Parent
- Développement des sous web components
  - Muet
  - Equalizer
  - Spacilazider
  - Butterchurn

### **Léa CUMONT**
Elève de l'école IPI Lyon et passionnée de dessin, elle a réalisé les images que nous avons intégré aux projet
- Dessins pour les sliders
- Dessins pour les boutons de contrôle
- Dessins pour le mute

---

## ❗ Difficultés rencontrées

1. **Comprendre le mécanisme des web components :**
   - La compréhension initiale des web components a été un défi. Cependant, une fois le concept assimilé pour un composant, il a été facile de le répliquer pour les autres.

2. **Manque de connaissances en musique :**
   - Pour **S. TABBAA**, le vocabulaire lié à la musique, comme les fréquences, les basses ou les médiums, était totalement nouveau, ce qui a rendu cette partie complexe.

3. **Création de l'égaliseur de fréquence :**
   - Combiner un visualiseur avec des sliders interactifs a nécessité beaucoup de réflexion et d’efforts.

4. **Dessins pour les sliders :**
   - La création de dessins parfaitement calibrés pour les sliders a été un défi artistique et technique. Ces dessins ont été conçus entièrement par nous-mêmes.

---

## 📈 Perspectives d'amélioration

1. **Rendre le tout responsive :**
   - Actuellement, l'application n’est pas responsive. Une amélioration future sera de s'assurer qu'elle fonctionne correctement sur tous les types d’appareils (ordinateurs, tablettes, mobiles).

2. **Ajouter un serveur :**
   - Mettre en place un serveur pour permettre aux utilisateurs de nos web components (via des plateformes comme CodePen ou Jsbin) d’accéder aux musiques chargées dans le dossier **assets**.

3. **Enrichir les animations :**
   - Ajouter des explosions et des animations supplémentaires pour rendre l'expérience visuelle encore plus immersive.

---

## 📚 Ressources
   - Nous avons utilisé **ChatGPT**, en particulier pour le CSS et pour résoudre des problèmes techniques.
   - [Web Audio Modules Documentation](https://www.webaudiomodules.com/docs/community/)
   - [Knobman Gallery](https://www.g200kg.com/en/webknobman/gallery.php)
   - [Butterchurn Presets (GitHub)](https://github.com/jberg/butterchurn-presets)
   - [Butterchurn Presets (unpkg)](https://unpkg.com/butterchurn-presets)
   - [Butterchurn Library (unpkg)](https://unpkg.com/butterchurn)
   - [AudioMotion Analyzer (skypack)](https://cdn.skypack.dev/audiomotion-analyzer)
   - [Police d'écriture Arcane](https://fontmeme.com/polices/police-arcane-nine/)
   - [Musique Arcane](https://www.youtube.com)
   - [Sound](https://www.voicy.network/fr/search/arcane-sound-effects)
   - [Image Soundboard](https://leagueoflegends.fandom.com/wiki/Emote)

