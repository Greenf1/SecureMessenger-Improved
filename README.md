# SecureMessenger - Application de Messagerie Sécurisée

## 🚀 Vue d'ensemble

SecureMessenger est une application de messagerie moderne et sécurisée, conçue pour offrir une communication privée et fiable. Ce projet a été récemment mis à jour avec des améliorations significatives de sa base de données pour garantir une meilleure performance, une sécurité accrue et l'intégration de nouvelles fonctionnalités.

## ✨ Fonctionnalités

- **Messagerie Instantanée** : Échangez des messages texte, images, voix et vidéo.
- **Appels Vocaux et Vidéo** : Passez des appels individuels ou de groupe.
- **Discussions de Groupe** : Créez et gérez des groupes de discussion avec différents rôles pour les membres.
- **Sécurité Renforcée** : Chiffrement de bout en bout des messages et des pièces jointes.
- **Gestion des Pièces Jointes** : Envoyez et recevez des fichiers de manière sécurisée.
- **Statut des Messages** : Suivez le statut de vos messages (envoyé, livré, lu).
- **Notifications** : Recevez des notifications en temps réel pour les nouveaux messages et appels.
- **Journal d'Audit** : Suivi détaillé des activités pour une meilleure conformité et sécurité.
- **Profils Utilisateur** : Gérez votre profil, votre statut et votre avatar.

## 🛠️ Technologies Utilisées

### Frontend
- **React** : Bibliothèque JavaScript pour la construction d'interfaces utilisateur.
- **TypeScript** : Sur-ensemble de JavaScript qui ajoute le typage statique.
- **Tailwind CSS** : Framework CSS utilitaire pour un stylisme rapide et personnalisable.
- **Shadcn/ui** : Composants UI réutilisables et accessibles.

### Backend
- **Node.js** : Environnement d'exécution JavaScript côté serveur.
- **TypeScript** : Pour un code backend robuste et maintenable.
- **Drizzle ORM** : ORM TypeScript pour PostgreSQL, offrant une excellente performance et typage.
- **PostgreSQL** : Système de gestion de base de données relationnelle open-source.
- **Neon (Serverless PostgreSQL)** : Base de données PostgreSQL serverless pour la scalabilité.

## 🗄️ Améliorations de la Base de Données

La base de données a été entièrement refactorisée et étendue pour supporter des fonctionnalités avancées et améliorer la robustesse. Les principales améliorations incluent :

- **Nouvelles Tables** :
    - `groups`: Gestion des groupes de discussion.
    - `group_members`: Membres des groupes avec rôles (admin, modérateur, membre).
    - `discussion_participants`: Participants aux discussions avec des métadonnées (messages non lus, épinglés, etc.).
    - `attachments`: Gestion des pièces jointes avec chiffrement et métadonnées.
    - `message_status`: Suivi détaillé du statut de livraison et de lecture des messages.
    - `call_participants`: Participants aux appels de groupe.
    - `encryption_keys`: Gestion des clés de chiffrement pour le chiffrement de bout en bout.
    - `audit_logs`: Journalisation complète des actions utilisateur pour la sécurité et la conformité.
    - `notifications`: Système de notifications push et in-app.

- **Relations et Index Optimisés** : Des relations complexes ont été établies entre les tables (via Drizzle ORM) et des index ont été ajoutés sur les colonnes fréquemment interrogées pour des performances optimales.

- **Sécurité Accrue** : Intégration de champs pour le chiffrement des données sensibles et des mécanismes d'audit pour la traçabilité.

- **Scalabilité** : Utilisation de UUID pour les identifiants uniques et préparation à la gestion de grands volumes de données.

Pour plus de détails sur les améliorations de la base de données, veuillez consulter le fichier `DATABASE_IMPROVEMENTS.md`.

## ⚙️ Installation et Configuration

### Prérequis

- Node.js (v18 ou plus)
- npm ou Yarn
- PostgreSQL (ou un service compatible comme Neon)
- Git

### Étapes d'installation

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/Greenf1/SecureMessenger-Improved.git
   cd SecureMessenger-Improved
   ```

2. **Installation des dépendances** :
   ```bash
   npm install # ou yarn install
   ```

3. **Configuration de la base de données** :
   - Créez une base de données PostgreSQL.
   - Copiez le fichier `.env.example` en `.env` et configurez votre `DATABASE_URL`.
     ```bash
     cp .env.example .env
     ```
   - Exécutez les migrations pour créer le schéma de la base de données. Le script de migration se trouve dans `migrations/001_improved_schema.sql`.
     ```sql
     -- Exemple d'exécution de migration (adaptez à votre outil de migration)
     -- psql -h your_db_host -U your_db_user -d your_db_name -f migrations/001_improved_schema.sql
     ```
     *Note: Vous devrez peut-être installer `drizzle-kit` globalement ou localement pour gérer les migrations via Drizzle ORM.*

4. **Lancement de l'application** :
   ```bash
   npm run dev # ou yarn dev
   ```
   L'application sera accessible à `http://localhost:5173` (ou un autre port si configuré).

## 🤝 Contribution

Les contributions sont les bienvenues ! Si vous souhaitez améliorer ce projet, veuillez suivre les étapes suivantes :

1. Forker le dépôt.
2. Créer une nouvelle branche (`git checkout -b feature/AmazingFeature`).
3. Effectuer vos modifications.
4. Commiter vos changements (`git commit -m 'feat: Ajouter une nouvelle fonctionnalité'`).
5. Pousser vers la branche (`git push origin feature/AmazingFeature`).
6. Ouvrir une Pull Request.

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

## 📞 Contact

Votre Nom - votre.email@example.com

Lien du projet: [https://github.com/Greenf1/SecureMessenger-Improved](https://github.com/Greenf1/SecureMessenger-Improved)


