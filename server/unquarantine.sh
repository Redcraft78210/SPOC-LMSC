#!/bin/bash

################################################################################
# Script de récupération des fichiers mis en quarantaine
#
# Description :
# Ce script récupère les fichiers chiffrés du conteneur Docker de quarantaine,
# les déchiffre avec AES-256-CBC en utilisant la même clé que quarantine.sh,
# et les restaure à l'emplacement spécifié.
#
# Usage :
#   ./unquarantine.sh <nom_fichier_quarantaine>
#
# Arguments :
#   <nom_fichier_quarantaine> : Nom du fichier chiffré dans le conteneur
#
# Prérequis :
#   - openssl doit être installé.
#   - Docker doit être installé et le conteneur "quarantine_container" doit être accessible.
#   - La clé de chiffrement doit être stockée dans /root/quarantine.key.
#
# Logs :
#   Les actions sont enregistrées dans logs/quarantine.log.
#
# Auteur :
#   SPOC-LMSC
#
# Date :
#   31/05/2025
################################################################################

# Extract just the filename without path
FILENAME=$(basename "$1")
FICHIER_QUARANTAINE="${FILENAME}.enc"
DESTINATION="uploads/${FILENAME}"
CLE="/root/quarantine.key"
TMP_ENC="/tmp/${FICHIER_QUARANTAINE}"

##################################################################################
#
# BLINDAGE
#
#################################################################################
# Vérifie si les arguments sont spécifiés
[ -z "$FICHIER_QUARANTAINE" ] && {
    echo "Usage: $0 <nom_fichier_quarantaine>"
    exit 1
}

# Vérifie si le conteneur Docker de quarantaine existe
docker ps -q --filter "name=quarantine_container" | grep -q . || {
    echo "Erreur : Le conteneur Docker 'quarantine_container' n'existe pas."
    exit 1
}

# Vérifie si le fichier de clé existe
[ ! -f "$CLE" ] && {
    echo "Erreur : Le fichier de clé '$CLE' n'existe pas."
    exit 1
}

# Vérifie si le dossier de logs existe
[ ! -d "logs" ] && mkdir -p logs

# Vérifie les dépendances
command -v openssl &>/dev/null || {
    echo "Erreur : openssl n'est pas installé. Veuillez l'installer."
    exit 1
}
command -v docker &>/dev/null || {
    echo "Erreur : Docker n'est pas installé. Veuillez l'installer"
    exit 1
}

# Vérifie si le fichier existe dans le conteneur
docker exec quarantine_container test -f "/quarantine/${FICHIER_QUARANTAINE}"
if [ $? -ne 0 ]; then
    echo "Erreur : Le fichier '${FICHIER_QUARANTAINE}' n'existe pas dans la quarantaine."
    exit 1
fi

# Vérifie si le chemin de destination est valide
DEST_DIR=$(dirname "$DESTINATION")
[ ! -d "$DEST_DIR" ] && {
    echo "Erreur : Le répertoire de destination '$DEST_DIR' n'existe pas."
    exit 1
}

# Vérifie si un fichier existe déjà à la destination
[ -f "$DESTINATION" ] && {
    echo "Avertissement : Un fichier existe déjà à '$DESTINATION'. Voulez-vous l'écraser ? (o/n)"
    read -r REPONSE
    [ "$REPONSE" != "o" ] && {
        echo "Opération annulée."
        exit 1
    }
}

echo "[+] Récupération du fichier quarantaine : $FICHIER_QUARANTAINE"

# Copie le fichier chiffré depuis le conteneur
docker cp "quarantine_container:/quarantine/${FICHIER_QUARANTAINE}" "$TMP_ENC"

# Déchiffrement avec AES-256-CBC
if openssl enc -d -aes-256-cbc -pbkdf2 -iter 10000 -in "$TMP_ENC" -out "$DESTINATION" -pass file:"$CLE"; then
    echo "[+] Fichier restauré avec succès à : $DESTINATION"
    
    # Supprime le fichier temporaire
    rm "$TMP_ENC"
    
    # Journalisation
    echo "$(date): Fichier $FICHIER_QUARANTAINE restauré vers $DESTINATION" >> logs/quarantine.log
    
    # Avertissement de sécurité
    echo "AVERTISSEMENT: Ce fichier a été mis en quarantaine car il était potentiellement infecté."
    echo "Assurez-vous de l'analyser avec un antivirus à jour avant de l'utiliser."
else
    echo "[-] Échec du déchiffrement. Vérifiez que la clé est correcte."
    rm "$TMP_ENC"
    exit 1
fi

exit 0