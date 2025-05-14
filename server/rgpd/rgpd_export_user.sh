#!/bin/bash
# filepath: /home/816ctbe/Documents/SPOC-LMSC/server/rgpd/rgpd_export_user.sh
# Script d'export des données personnelles - SPOC-LMSC
# Ce script exporte toutes les données d'un utilisateur dans un PDF stylisé conformément au RGPD

# Configuration de la base de données et des chemins
DB_HOST="localhost"
DB_NAME="spoc_lmsc" 
DB_USER="root"
DB_PASS="votre_mot_de_passe"
LOG_FILE="/var/log/spoc-lmsc/rgpd_export.log"
TEMP_DIR="/tmp/rgpd_export"
OUTPUT_DIR="/home/816ctbe/Documents/SPOC-LMSC/server/rgpd/exports"
TEMPLATE_DIR="/home/816ctbe/Documents/SPOC-LMSC/server/rgpd/templates"

# Création des répertoires si nécessaire
mkdir -p "$(dirname "$LOG_FILE")" "$TEMP_DIR" "$OUTPUT_DIR"

# Fonctions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
    echo "$1"
}

error_exit() {
    log "ERREUR: $1"
    exit 1
}

check_dependencies() {
    # Vérifier si wkhtmltopdf est installé
    if ! command -v wkhtmltopdf &> /dev/null; then
        error_exit "wkhtmltopdf n'est pas installé. Veuillez l'installer avec: sudo apt-get install wkhtmltopdf"
    fi
}

# Vérification des dépendances
check_dependencies

# Vérification des paramètres
if [ -z "$1" ]; then
    echo "Usage: $0 <id_utilisateur | email_utilisateur>"
    exit 1
fi

USER_IDENTIFIER="$1"
USER_ID=""
USER_EMAIL=""
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

log "Début du processus d'export RGPD pour l'utilisateur: $USER_IDENTIFIER"

# Déterminer si l'identifiant est un email ou un ID
if [[ "$USER_IDENTIFIER" == *@* ]]; then
    log "Recherche de l'utilisateur par email: $USER_IDENTIFIER"
    USER_ID=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -N -s -e "SELECT id FROM users WHERE email='$USER_IDENTIFIER'")
    USER_EMAIL="$USER_IDENTIFIER"
else
    log "Recherche de l'utilisateur par ID: $USER_IDENTIFIER"
    USER_ID="$USER_IDENTIFIER"
    USER_EMAIL=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -N -s -e "SELECT email FROM users WHERE id='$USER_ID'")
fi

# Vérifier si l'utilisateur existe
if [ -z "$USER_ID" ]; then
    error_exit "Utilisateur non trouvé: $USER_IDENTIFIER"
fi

# Fichiers temporaires
TEMP_HTML="$TEMP_DIR/user_data_${USER_ID}_${TIMESTAMP}.html"
OUTPUT_PDF="$OUTPUT_DIR/export_donnees_utilisateur_${USER_ID}_${TIMESTAMP}.pdf"

log "Collecte des données personnelles pour l'utilisateur ID: $USER_ID"

# 1. Récupérer les informations de base de l'utilisateur
USER_INFO=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -N -s -e "
    SELECT 
        id, 
        name, 
        surname, 
        email, 
        username, 
        role, 
        DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') as created_at, 
        DATE_FORMAT(updated_at, '%d/%m/%Y %H:%i') as updated_at,
        is_active
    FROM users WHERE id='$USER_ID'")

# 2. Récupérer l'avatar de l'utilisateur (lien uniquement)
USER_AVATAR=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -N -s -e "
    SELECT avatar_path FROM user_avatars WHERE user_id='$USER_ID' LIMIT 1")

# 3. Récupérer les messages de chat/forum
CHAT_MESSAGES=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -N -s -e "
    SELECT 
        id, 
        content, 
        DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') as created_at,
        chat_room_id
    FROM chat_messages WHERE user_id='$USER_ID' ORDER BY created_at DESC")

# 4. Récupérer les classes auxquelles l'utilisateur est inscrit
USER_CLASSES=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -N -s -e "
    SELECT 
        c.id,
        c.name,
        c.description,
        DATE_FORMAT(cu.joined_at, '%d/%m/%Y %H:%i') as joined_at
    FROM classes c 
    INNER JOIN class_user cu ON c.id = cu.class_id 
    WHERE cu.user_id='$USER_ID'")

# 5. Autres données pertinentes selon votre schéma de BDD
# [Ajouter d'autres requêtes selon votre schéma]

# Générer le contenu HTML
cat > "$TEMP_HTML" << EOF
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Données personnelles - RGPD</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        header {
            background-color: #4B6BCC;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        h1, h2, h3 {
            color: #2C3E50;
        }
        h2 {
            border-bottom: 2px solid #4B6BCC;
            padding-bottom: 10px;
            margin-top: 30px;
        }
        .info-block {
            background-color: #f5f7fa;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .info-item {
            margin: 10px 0;
            padding-bottom: 5px;
        }
        .label {
            font-weight: bold;
            color: #4B6BCC;
        }
        .message {
            border-left: 4px solid #4B6BCC;
            padding-left: 10px;
            margin: 10px 0;
        }
        footer {
            margin-top: 50px;
            text-align: center;
            font-size: 0.8em;
            color: #7f8c8d;
        }
        .emoji {
            font-size: 1.2em;
            margin-right: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #4B6BCC;
            color: white;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
    </style>
</head>
<body>
    <header>
        <h1>📊 Données personnelles - RGPD</h1>
        <p>Export des données conformément au Règlement Général sur la Protection des Données</p>
        <p>Date d'export: $(date '+%d/%m/%Y à %H:%M')</p>
    </header>
    
    <section>
        <h2><span class="emoji">👤</span> Informations personnelles</h2>
        <div class="info-block">
EOF

# Convertir USER_INFO en variables individuelles
IFS=$'\t' read -r ID NAME SURNAME EMAIL USERNAME ROLE CREATED_AT UPDATED_AT IS_ACTIVE <<< "$USER_INFO"

cat >> "$TEMP_HTML" << EOF
            <div class="info-item"><span class="label">ID:</span> $ID</div>
            <div class="info-item"><span class="label">Nom:</span> $NAME</div>
            <div class="info-item"><span class="label">Prénom:</span> $SURNAME</div>
            <div class="info-item"><span class="label">Email:</span> $EMAIL</div>
            <div class="info-item"><span class="label">Nom d'utilisateur:</span> $USERNAME</div>
            <div class="info-item"><span class="label">Rôle:</span> $ROLE</div>
            <div class="info-item"><span class="label">Date de création du compte:</span> $CREATED_AT</div>
            <div class="info-item"><span class="label">Dernière mise à jour:</span> $UPDATED_AT</div>
            <div class="info-item"><span class="label">Statut du compte:</span> $([ "$IS_ACTIVE" = "1" ] && echo "Actif ✅" || echo "Inactif ❌")</div>
            
            <div class="info-item">
                <span class="label">Avatar:</span> 
                $([ -n "$USER_AVATAR" ] && echo "Disponible (chemin: $USER_AVATAR)" || echo "Aucun avatar défini")
            </div>
        </div>
    </section>
EOF

if [ -n "$USER_CLASSES" ]; then
    cat >> "$TEMP_HTML" << EOF
    <section>
        <h2><span class="emoji">🏫</span> Classes inscrites</h2>
        <div class="info-block">
            <table>
                <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Description</th>
                    <th>Date d'inscription</th>
                </tr>
EOF

    while IFS=$'\t' read -r CLASS_ID CLASS_NAME CLASS_DESC JOINED_AT; do
        cat >> "$TEMP_HTML" << EOF
                <tr>
                    <td>$CLASS_ID</td>
                    <td>$CLASS_NAME</td>
                    <td>$CLASS_DESC</td>
                    <td>$JOINED_AT</td>
                </tr>
EOF
    done <<< "$USER_CLASSES"

    cat >> "$TEMP_HTML" << EOF
            </table>
        </div>
    </section>
EOF
fi

if [ -n "$CHAT_MESSAGES" ]; then
    cat >> "$TEMP_HTML" << EOF
    <section>
        <h2><span class="emoji">💬</span> Messages</h2>
        <div class="info-block">
EOF

    while IFS=$'\t' read -r MSG_ID MSG_CONTENT MSG_DATE ROOM_ID; do
        cat >> "$TEMP_HTML" << EOF
            <div class="message">
                <div><span class="label">Date:</span> $MSG_DATE | <span class="label">Salon:</span> $ROOM_ID</div>
                <div>$MSG_CONTENT</div>
            </div>
EOF
    done <<< "$CHAT_MESSAGES"

    cat >> "$TEMP_HTML" << EOF
        </div>
    </section>
EOF
fi

# Finaliser le document HTML
cat >> "$TEMP_HTML" << EOF
    <section>
        <h2><span class="emoji">📝</span> Autres informations</h2>
        <div class="info-block">
            <p>Cette exportation contient toutes les données personnelles stockées dans notre système vous concernant.</p>
            <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données.</p>
        </div>
    </section>
    
    <footer>
        <p>SPOC-LMSC - Export de données RGPD</p>
        <p>Document généré automatiquement le $(date '+%d/%m/%Y à %H:%M:%S')</p>
    </footer>
</body>
</html>
EOF

# Convertir le HTML en PDF
log "Conversion du fichier HTML en PDF..."
if wkhtmltopdf --enable-local-file-access "$TEMP_HTML" "$OUTPUT_PDF"; then
    log "PDF généré avec succès: $OUTPUT_PDF"
else
    error_exit "Échec de la génération du PDF"
fi

# Journaliser l'export pour conformité RGPD
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -e "
    INSERT INTO registry_rgpd (user_email, action, details) 
    VALUES ('$USER_EMAIL', 'Export des données personnelles', 'Données envoyées" || log "Impossible de journaliser l'export RGPD"

# Nettoyage des fichiers temporaires
rm "$TEMP_HTML"

log "Export RGPD terminé avec succès pour l'utilisateur: $USER_EMAIL (ID: $USER_ID)"
echo -e "\n✅ L'export des données personnelles a été généré avec succès."
echo "📄 Fichier PDF disponible ici: $OUTPUT_PDF"
echo "📊 Un enregistrement de cette action a été conservé dans les journaux de conformité RGPD."