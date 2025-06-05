#!/bin/bash

################################################################################
# Script de mise en quarantaine des fichiers infectés
#
# Description :
# Ce script détecte les fichiers infectés à l'aide de `clamdscan`, les chiffre
# avec AES-256-CBC, supprime les fichiers originaux de manière sécurisée, et
# déplace les fichiers chiffrés dans un conteneur Docker de quarantaine.
#
# Usage :
#   ./quarantine.sh <chemin_du_fichier>
#
# Arguments :
#   <chemin_du_fichier> : Chemin absolu ou relatif vers le fichier à analyser.
#
# Prérequis :
#   - clamdscan doit être installé et configuré.
#   - openssl doit être installé.
#   - Docker doit être installé et le conteneur "quarantine_container" doit exister.
#   - La clé de chiffrement doit être stockée dans /root/quarantine.key.
#
# Logs :
#   Les actions sont enregistrées dans logs/quarantine.log.
#
# Auteur :
#   SPOC-LMSC
#
# Date :
#   15/05/2025
################################################################################

FICHIER="$1"
CLE="/root/quarantine.key"
TMP_ENC="/tmp/$(basename "$FICHIER").enc"

##################################################################################
# 
# BLINDAGE
#
#################################################################################
# Vérifie si le fichier est spécifié
[ -z "$FICHIER" ] && { echo "Usage: $0 <chemin_du_fichier>"; exit 1; }

# Vérifie si le fichier existe
[ ! -f "$FICHIER" ] && { echo "Erreur : Le fichier spécifié n'existe pas."; exit 1; }

# Vérifie si le conteneur Docker de quarantaine existe
docker ps -q --filter "name=quarantine_container" | grep -q . || { echo "Erreur : Le conteneur Docker 'quarantine_container' n'existe pas."; exit 1; }

# Vérifie si le fichier de clé existe
[ ! -f "$CLE" ] && { 
    echo "Erreur : Le fichier de clé '$CLE' n'existe pas. Génération d'une nouvelle clé."; 
    openssl rand -base64 32 >/root/quarantine.key; 
    chmod 600 /root/quarantine.key; 
}

# Vérifie si le dossier de logs existe
[ ! -d "logs" ] && mkdir -p logs

# Vérifie les dépendances
command -v clamdscan &>/dev/null || { echo "Erreur : clamdscan n'est pas installé. Veuillez l'installer."; exit 1; }
command -v openssl &>/dev/null || { echo "Erreur : openssl n'est pas installé. Veuillez l'installer."; exit 1; }
command -v docker &>/dev/null || { echo "Erreur : Docker n'est pas installé. Veuillez l'installer"; exit 1; }

# Vérifie si le conteneur Docker est en cours d'exécution
docker ps -q --filter "name=quarantine_container" | grep -q . || { echo "Erreur : Le conteneur Docker 'quarantine_container' n'est pas en cours d'exécution."; exit 1; }

# Vérifie que le fichier est infecté
if clamdscan --fdpass --quiet --infected "$FICHIER"; then
    echo "[+] Fichier infecté détecté : $FICHIER"

    # Chiffrement avec AES-256-CBC
    openssl enc -aes-256-cbc -salt -in "$FICHIER" -out "$TMP_ENC" -pass file:"$CLE"

    # Supprime le fichier original
    shred -u "$FICHIER"

    # Déplace dans le conteneur Docker
    docker cp "$TMP_ENC" quarantine_container:/quarantine/
    rm "$TMP_ENC"

    echo "$(date): $FICHIER déplacé vers /var/quarantine" >>logs/quarantine.log
    exit 1
else
    echo "[-] Pas d'infection détectée."
fi

exit 0