# SPOC-LMSC — Scripts RGPD

Ce dossier contient les scripts shell permettant de gérer les droits des utilisateurs conformément au **Règlement Général sur la Protection des Données (RGPD)** pour la plateforme SPOC-LMSC.

## Sommaire

- [Présentation](#présentation)
- [Scripts disponibles](#scripts-disponibles)
- [Fonctionnalités](#fonctionnalités)
- [Utilisation](#utilisation)
- [Bonnes pratiques](#bonnes-pratiques)
- [Contact](#contact)

---

## Présentation

Les scripts de ce dossier permettent :
- **D'exporter** toutes les données personnelles d'un utilisateur au format PDF (droit d'accès et portabilité)
- **De supprimer** de façon sécurisée toutes les données personnelles d'un utilisateur (droit à l'effacement)

Ces outils sont essentiels pour garantir la conformité de SPOC-LMSC avec le RGPD et répondre rapidement aux demandes des utilisateurs.

---

## Scripts disponibles

- **`rgpd_export_user.sh`**  
    Exporte l'ensemble des données personnelles d'un utilisateur (informations de compte, messages, contributions, etc.) dans un fichier PDF, généré à partir d'un export HTML.

- **`rgpd_delete_user.sh`**  
    Supprime de façon sécurisée toutes les données personnelles d'un utilisateur de la base de données.

---

## Fonctionnalités

### Export des données (`rgpd_export_user.sh`)
- Génère un rapport complet des données personnelles stockées (profil, messages, activités…)
- Produit un fichier PDF lisible par l'utilisateur
- Journalise l'opération dans une table de conformité RGPD

### Suppression des données (`rgpd_delete_user.sh`)
- Efface toutes les informations personnelles liées à un utilisateur
- Peut anonymiser ou supprimer les contenus selon la politique de la plateforme
- Journalise l'opération pour traçabilité

---

## Utilisation

> **Attention :** Ces scripts nécessitent un accès administrateur au serveur et à la base de données.

### Exporter les données d'un utilisateur

```bash
./rgpd_export_user.sh <email_utilisateur>
```

Le PDF généré sera disponible dans le dossier de sortie indiqué par le script.

### Supprimer les données d'un utilisateur

```bash
./rgpd_delete_user.sh <email_utilisateur>
```

Toutes les données personnelles de l'utilisateur seront supprimées ou anonymisées.

---

## Bonnes pratiques

- **Conformité :** Utilisez ces scripts uniquement sur demande explicite de l'utilisateur ou dans le cadre d'une procédure RGPD.
- **Sécurité :** Vérifiez l'identité de l'utilisateur avant toute suppression ou export.
- **Traçabilité :** Les actions sont journalisées pour garantir la conformité légale.

---

## Contact

Pour toute question ou demande RGPD, contactez l'équipe SPOC-LMSC :

- 📧 support@spoc-lmsc.com
- 📝 Formulaire de contact intégré à la plateforme

---

© SPOC-LMSC — 2025
