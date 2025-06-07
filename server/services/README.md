# Services

Ce dossier contient les services utilisés par le serveur de l'application SPOC-LMSC.

## Fichiers présents

- **virusScanService.js**  
  Service de scan antivirus pour les pièces jointes.  
  Ce module permet de :
  - Scanner les fichiers téléchargés à la recherche de virus.
  - Mettre en quarantaine les fichiers infectés à l'aide d'un script externe (`quarantine.sh`).
  - Gérer le répertoire des fichiers téléchargés.

## Utilisation

Le service `virusScanService` peut être importé dans d'autres parties du serveur pour analyser les fichiers uploadés avant leur traitement ou stockage.

## Dépendances

- Node.js (modules : `child_process`, `fs`, `path`)
- Script externe de quarantaine (`quarantine.sh`)
- Modèle `Attachment` (présent dans le dossier `../models`)

## Structure recommandée

```
services/
├── README.md
├── virusScanService.js
```


## Auteur

- SPOC-LMSC Team
