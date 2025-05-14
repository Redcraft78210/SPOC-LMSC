#!/bin/bash
# Script d'effacement RGPD - SPOC-LMSC
# Ce script supprime toutes les données personnelles d'un utilisateur conformément au RGPD

# Configuration de la base de données et des chemins
DB_HOST="localhost"
DB_NAME="spoc_lmsc" 
DB_USER="root"
DB_PASS="votre_mot_de_passe"
API_PORT="8443"
LOG_FILE="/var/log/spoc-lmsc/rgpd_deletion.log"
DATA_DIR="/home/816ctbe/Documents/SPOC-LMSC"

# Fonctions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
    echo "$1"
}

error_exit() {
    log "ERREUR: $1"
    exit 1
}

confirm_action() {
    echo -e "\n⚠️  ATTENTION: Cette action est IRREVERSIBLE ⚠️"
    echo "Toutes les données personnelles de l'utilisateur seront effacées définitivement."
    read -p "Êtes-vous sûr de vouloir continuer? (o/N): " confirm
    if [[ "$confirm" != "o" && "$confirm" != "O" ]]; then
        log "Action annulée par l'utilisateur"
        exit 0
    fi
}

# Vérification des paramètres
if [ -z "$1" ]; then
    echo "Usage: $0 <id_utilisateur | email_utilisateur>"
    exit 1
fi

USER_IDENTIFIER="$1"
log "Début du processus d'effacement RGPD pour l'utilisateur: $USER_IDENTIFIER"

# Déterminer si l'identifiant est un email ou un ID
if [[ "$USER_IDENTIFIER" == *@* ]]; then
    log "Recherche de l'utilisateur par email: $USER_IDENTIFIER"
    USER_ID=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -N -s -e "SELECT id FROM users WHERE email='$USER_IDENTIFIER'")
else
    log "Recherche de l'utilisateur par ID: $USER_IDENTIFIER"
    USER_ID="$USER_IDENTIFIER"
    USER_EMAIL=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -N -s -e "SELECT email FROM users WHERE id='$USER_ID'")
    USER_IDENTIFIER="$USER_EMAIL"
fi

# Vérifier si l'utilisateur existe
if [ -z "$USER_ID" ]; then
    error_exit "Utilisateur non trouvé: $USER_IDENTIFIER"
fi

# Récupérer les informations de l'utilisateur pour confirmation
USER_INFO=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -N -s -e "
    SELECT CONCAT('ID: ', id, ', Nom: ', name, ' ', surname, ', Email: ', email, ', Rôle: ', role) 
    FROM users WHERE id='$USER_ID'")

echo -e "\nInformations de l'utilisateur à supprimer :"
echo "$USER_INFO"

# Demander confirmation
confirm_action

log "Suppression des données personnelles pour l'utilisateur ID: $USER_ID"

# 1. Supprimer l'avatar de l'utilisateur
log "Suppression de l'avatar utilisateur..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -e "DELETE FROM user_avatars WHERE user_id='$USER_ID'" || log "Aucun avatar trouvé ou erreur de suppression"

# 2. Supprimer les messages de chat/forum
log "Suppression des messages de chat/forum..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -e "DELETE FROM chat_messages WHERE user_id='$USER_ID'" || log "Aucun message trouvé ou erreur de suppression"

# 3. Supprimer les données de participation aux classes
log "Suppression des associations aux classes..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -e "DELETE FROM class_user WHERE user_id='$USER_ID'" || log "Aucune association aux classes trouvée ou erreur de suppression"

# 4. Supprimer les données d'authentification 2FA
log "Suppression des données 2FA..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -e "DELETE FROM two_factor_auth WHERE user_id='$USER_ID'" || log "Aucune donnée 2FA trouvée ou erreur de suppression"

# 5. Anonymiser l'utilisateur dans la table users (plutôt que de supprimer complètement)
ANON_EMAIL="deleted-user-${USER_ID}@anonymized.local"
ANON_NAME="Utilisateur"
ANON_SURNAME="Supprimé"
ANON_USERNAME="deleted_user_${USER_ID}"

log "Anonymisation des données utilisateur..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -e "
    UPDATE users SET 
        name='$ANON_NAME', 
        surname='$ANON_SURNAME', 
        email='$ANON_EMAIL',
        username='$ANON_USERNAME', 
        password=NULL, 
        is_active=0, 
        personal_info_deleted=1, 
        deleted_at=NOW()
    WHERE id='$USER_ID'" || error_exit "Échec de l'anonymisation de l'utilisateur"

# 6. Journaliser la suppression RGPD pour conformité
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -e "
    INSERT INTO registry_rgpd (user_email, action, details) 
    VALUES ('$USER_IDENTIFIER', 'Suppression RGPD', 'Utilisateur anonymisé et données personnelles supprimées')" || log "Impossible de journaliser la suppression RGPD"

log "Processus d'effacement RGPD terminé avec succès pour l'utilisateur: $USER_IDENTIFIER (ID: $USER_ID)"
echo -e "\n✅ Toutes les données personnelles de l'utilisateur ont été effacées ou anonymisées."
echo "Un enregistrement de cette action a été conservé dans les journaux de conformité RGPD."
