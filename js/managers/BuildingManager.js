class BuildingManager {
    constructor(scene, mapManager) {
        this.scene = scene;
        this.mapManager = mapManager;

        // Liste des bâtiments placés
        this.buildings = [];

        // Données des types de bâtiments
        this.buildingTypes = gameData.buildingTypes;

        // Événements
        this.events = new Phaser.Events.EventEmitter();
    }

    init() {
        // Initialiser le gestionnaire de bâtiments
        this.loadExistingBuildings();
    }

    loadExistingBuildings() {
        // Charger les bâtiments existants depuis les données de jeu
        if (gameData.buildings && gameData.buildings.length > 0) {
            gameData.buildings.forEach(buildingData => {
                this.createBuildingFromData(buildingData);
            });
        }
    }

    createBuildingFromData(buildingData) {
        // Créer un bâtiment à partir des données sauvegardées
        const { type, x, y, level } = buildingData;

        // Vérifier si le type de bâtiment existe
        if (!this.buildingTypes[type]) {
            console.error(`Type de bâtiment inconnu: ${type}`);
            return null;
        }

        // Placer le bâtiment sur la carte
        return this.placeBuilding(type, x, y, level);
    }

    placeBuilding(type, gridX, gridY, level = 1) {
        // Vérifier si l'emplacement est valide
        if (!this.mapManager.isValidBuildingLocation(gridX, gridY, this.buildingTypes[type].size)) {
            console.log(`Emplacement invalide (${gridX}, ${gridY}) pour le bâtiment ${type}`);
            return null;
        }

        // Créer le sprite du bâtiment
        let x, y;
        const cellSize = this.mapManager.config.cellSize;
        const buildingSize = this.buildingTypes[type].size;

        if (this.mapManager.config.isIsometric) {
            x = (gridX - gridY) * cellSize / 2;
            y = (gridX + gridY) * cellSize / 4;
        } else {
            x = gridX * cellSize;
            y = gridY * cellSize;
        }

        // Créer l'image du bâtiment
        const buildingContainer = this.scene.add.container(x, y);

        // Image du bâtiment
        const buildingImage = this.scene.add.image(0, 0, type);

        // Ajuster la taille en fonction du type de bâtiment
        buildingImage.setDisplaySize(
            cellSize * buildingSize,
            this.mapManager.config.isIsometric ? (cellSize/2) * buildingSize : cellSize * buildingSize
        );

        // Ajuster l'origine pour la vue isométrique
        if (this.mapManager.config.isIsometric) {
            buildingImage.setOrigin(0.5, 0.5);
        } else {
            buildingImage.setOrigin(0, 0);
        }

        buildingContainer.add(buildingImage);

        // Ajouter un indicateur de niveau si niveau > 1
        if (level > 1) {
            const levelBadge = this.createLevelBadge(level);
            levelBadge.setPosition(
                buildingImage.width / 2 - 15,
                -buildingImage.height / 2 + 15
            );
            buildingContainer.add(levelBadge);
        }

        // Rendre le bâtiment interactif
        buildingContainer.setInteractive(
            new Phaser.Geom.Rectangle(
                -buildingImage.width / 2,
                -buildingImage.height / 2,
                buildingImage.width,
                buildingImage.height
            ),
            Phaser.Geom.Rectangle.Contains
        );

        // Ajouter des événements au clic
        buildingContainer.on('pointerdown', () => {
            this.onBuildingClicked(buildingContainer, type, gridX, gridY, level);
        });

        // Ajouter le container à la couche des bâtiments
        this.mapManager.buildingLayer.add(buildingContainer);

        // Créer l'objet bâtiment avec toutes les données
        const building = {
            id: Date.now() + Math.floor(Math.random() * 1000), // ID unique
            type,
            x: gridX,
            y: gridY,
            size: buildingSize,
            level,
            container: buildingContainer,
            sprite: buildingImage
        };

        // Ajouter à la liste des bâtiments
        this.buildings.push(building);

        // Ajouter aux données du jeu pour sauvegarde
        if (!gameData.buildings) {
            gameData.buildings = [];
        }

        const buildingData = {
            id: building.id,
            type,
            x: gridX,
            y: gridY,
            level
        };

        gameData.buildings.push(buildingData);

        // Émettre un événement de placement de bâtiment
        this.events.emit('buildingPlaced', building);

        return building;
    }

    createLevelBadge(level) {
        // Créer un badge pour indiquer le niveau du bâtiment
        const container = this.scene.add.container(0, 0);

        // Fond du badge
        const badge = this.scene.add.graphics();
        badge.fillStyle(0x4444ff, 1);
        badge.fillCircle(0, 0, 15);
        badge.lineStyle(2, 0xffffff, 1);
        badge.strokeCircle(0, 0, 15);

        // Texte du niveau
        const text = this.scene.add.text(0, 0, level.toString(), {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5, 0.5);

        container.add(badge);
        container.add(text);

        return container;
    }

    onBuildingClicked(container, type, x, y, level) {
        console.log(`Bâtiment ${type} (niveau ${level}) cliqué en (${x}, ${y})`);

        // Créer un menu contextuel pour le bâtiment
        this.showBuildingMenu(container, type, x, y, level);
    }

    showBuildingMenu(container, type, x, y, level) {
        // Supprimer tout menu existant
        this.hideBuildingMenu();

        // Convertir les coordonnées monde en coordonnées écran
        const screenX = container.x - this.scene.cameras.main.scrollX;
        const screenY = container.y - this.scene.cameras.main.scrollY;

        // Créer un menu contextuel
        const menuContainer = this.scene.add.container(screenX, screenY);
        menuContainer.setDepth(100);

        // Fond du menu
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRoundedRect(-100, -80, 200, 160, 10);
        menuContainer.add(bg);

        // Titre du menu
        const title = this.scene.add.text(0, -60, this.buildingTypes[type].name, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        menuContainer.add(title);

        // Niveau actuel
        const levelText = this.scene.add.text(0, -30, `Niveau: ${level}`, {
            fontSize: '14px',
            color: '#ffffff'
        });
        levelText.setOrigin(0.5);
        menuContainer.add(levelText);

        // Boutons d'actions
        const actions = [
            { text: 'Améliorer', callback: () => this.upgradeBuilding(x, y) },
            { text: 'Déplacer', callback: () => this.moveBuilding(x, y) },
            { text: 'Supprimer', callback: () => this.removeBuilding(x, y) }
        ];

        let yOffset = 0;
        actions.forEach((action, index) => {
            const button = this.scene.add.text(0, yOffset, action.text, {
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: '#555555',
                padding: {
                    left: 20,
                    right: 20,
                    top: 5,
                    bottom: 5
                }
            });
            button.setOrigin(0.5);
            button.setInteractive();

            // Ajouter des effets au survol
            button.on('pointerover', () => button.setBackgroundColor('#777777'));
            button.on('pointerout', () => button.setBackgroundColor('#555555'));
            button.on('pointerdown', () => {
                action.callback();
                this.hideBuildingMenu();
            });

            menuContainer.add(button);
            yOffset += 30;
        });

        // Bouton de fermeture
        const closeButton = this.scene.add.text(90, -70, 'X', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        closeButton.setInteractive();
        closeButton.on('pointerdown', () => this.hideBuildingMenu());
        menuContainer.add(closeButton);

        // Ajouter un clic en dehors pour fermer le menu
        const closeArea = this.scene.add.rectangle(0, 0,
            this.scene.cameras.main.width * 2,
            this.scene.cameras.main.height * 2,
            0x000000, 0);
        closeArea.setOrigin(0.5);
        closeArea.setInteractive();
        closeArea.setDepth(99);
        closeArea.on('pointerdown', () => this.hideBuildingMenu());

        // Stocker les références pour pouvoir fermer le menu plus tard
        this.activeMenu = {
            container: menuContainer,
            closeArea: closeArea
        };

        // Fixer le menu à la caméra
        menuContainer.setScrollFactor(0);
    }

    hideBuildingMenu() {
        // Fermer le menu contextuel s'il existe
        if (this.activeMenu) {
            this.activeMenu.container.destroy();
            this.activeMenu.closeArea.destroy();
            this.activeMenu = null;
        }
    }

    upgradeBuilding(x, y) {
        // Trouver le bâtiment aux coordonnées données
        const building = this.getBuildingAt(x, y);
        if (!building) return;

        console.log(`Amélioration du bâtiment ${building.type} en (${x}, ${y})`);

        // Calculer le coût de l'amélioration (à personnaliser selon votre économie)
        const upgradeCost = {
            gold: 100 * building.level,
            wood: 50 * building.level
        };

        // Vérifier si le joueur a assez de ressources
        if (gameData.resources.gold >= upgradeCost.gold &&
            gameData.resources.wood >= upgradeCost.wood) {

            // Déduire les ressources
            gameData.resources.gold -= upgradeCost.gold;
            gameData.resources.wood -= upgradeCost.wood;

            // Mettre à jour le niveau du bâtiment
            building.level++;

            // Mettre à jour l'affichage du bâtiment
            this.updateBuildingAppearance(building);

            // Mettre à jour les données de sauvegarde
            const savedBuilding = gameData.buildings.find(b => b.id === building.id);
            if (savedBuilding) {
                savedBuilding.level = building.level;
            }

            // Émettre les événements
            this.events.emit('buildingUpgraded', building);
            this.scene.gameEventEmitter.emit('resourcesChanged');

            console.log(`Bâtiment amélioré au niveau ${building.level}`);
        } else {
            console.log('Ressources insuffisantes pour améliorer ce bâtiment');
            // On pourrait afficher un message à l'utilisateur
        }
    }

    moveBuilding(x, y) {
        // Trouver le bâtiment aux coordonnées données
        const building = this.getBuildingAt(x, y);
        if (!building) return;

        console.log(`Déplacement du bâtiment ${building.type} depuis (${x}, ${y})`);

        // Marquer le bâtiment comme étant en cours de déplacement
        this.buildingBeingMoved = building;

        // Supprimer visuellement le bâtiment de son emplacement actuel
        building.container.setVisible(false);

        // Activer le mode de placement pour ce bâtiment
        if (this.scene.uiManager) {
            // Créer un fantôme du bâtiment pour le placement
            this.scene.uiManager.createMovePlacementGhost(building.type, building.level);

            // Définir une fonction de callback pour finaliser le déplacement
            this.scene.uiManager.setMoveCompleteCallback((newX, newY) => {
                this.finalizeBuildingMove(building, newX, newY);
            });
        }
    }

    finalizeBuildingMove(building, newX, newY) {
        // Vérifier si l'emplacement est valide
        if (!this.mapManager.isValidBuildingLocation(newX, newY, building.size)) {
            console.log('Emplacement invalide pour le déplacement');

            // Rendre le bâtiment à nouveau visible à son emplacement d'origine
            building.container.setVisible(true);
            this.buildingBeingMoved = null;
            return false;
        }

        console.log(`Déplacement du bâtiment vers (${newX}, ${newY})`);

        // Mettre à jour les coordonnées du bâtiment
        building.x = newX;
        building.y = newY;

        // Mettre à jour la position visuelle
        let x, y;
        const cellSize = this.mapManager.config.cellSize;

        if (this.mapManager.config.isIsometric) {
            x = (newX - newY) * cellSize / 2;
            y = (newX + newY) * cellSize / 4;
        } else {
            x = newX * cellSize;
            y = newY * cellSize;
        }

        building.container.setPosition(x, y);
        building.container.setVisible(true);

        // Mettre à jour les données de sauvegarde
        const savedBuilding = gameData.buildings.find(b => b.id === building.id);
        if (savedBuilding) {
            savedBuilding.x = newX;
            savedBuilding.y = newY;
        }

        // Réinitialiser l'état de déplacement
        this.buildingBeingMoved = null;

        // Émettre un événement de déplacement
        this.events.emit('buildingMoved', building);

        return true;
    }

    removeBuilding(x, y) {
        // Trouver le bâtiment aux coordonnées données
        const building = this.getBuildingAt(x, y);
        if (!building) return;

        console.log(`Suppression du bâtiment ${building.type} en (${x}, ${y})`);

        // Demander confirmation avant de supprimer
        // Note: Dans un jeu réel, on afficherait une boîte de dialogue
        const confirmed = true; // Pour simplifier, on suppose que c'est confirmé

        if (confirmed) {
            // Retirer le bâtiment de la liste
            const index = this.buildings.findIndex(b => b.id === building.id);
            if (index !== -1) {
                this.buildings.splice(index, 1);
            }

            // Supprimer le sprite du jeu
            building.container.destroy();

            // Mettre à jour les données de sauvegarde
            const savedIndex = gameData.buildings.findIndex(b => b.id === building.id);
            if (savedIndex !== -1) {
                gameData.buildings.splice(savedIndex, 1);
            }

            // Émettre un événement de suppression
            this.events.emit('buildingRemoved', building);

            console.log('Bâtiment supprimé avec succès');
        }
    }

    updateBuildingAppearance(building) {
        // Mettre à jour l'apparence du bâtiment en fonction de son niveau
        // Par exemple, ajouter un badge de niveau

        // Supprimer tout badge de niveau existant
        building.container.list.forEach(child => {
            if (child !== building.sprite) {
                child.destroy();
            }
        });

        // Ajouter un nouveau badge de niveau si niveau > 1
        if (building.level > 1) {
            const levelBadge = this.createLevelBadge(building.level);
            levelBadge.setPosition(
                building.sprite.width / 2 - 15,
                -building.sprite.height / 2 + 15
            );
            building.container.add(levelBadge);
        }

        // On pourrait aussi changer l'apparence du bâtiment lui-même
        // Par exemple, modifier son échelle légèrement
        const scaleFactor = 1 + (building.level - 1) * 0.1; // +10% par niveau
        building.sprite.setScale(scaleFactor);
    }

    getBuildingAt(x, y) {
        // Trouver un bâtiment aux coordonnées de grille données
        return this.buildings.find(building => building.x === x && building.y === y);
    }

    getBuildingById(id) {
        // Trouver un bâtiment par son ID
        return this.buildings.find(building => building.id === id);
    }

    getAllBuildings() {
        return this.buildings;
    }

    getBuildingsByType(type) {
        // Récupérer tous les bâtiments d'un certain type
        return this.buildings.filter(building => building.type === type);
    }

    calculateResourceProduction() {
        // Calculer la production de ressources basée sur les bâtiments placés
        let production = {
            gold: 0,
            food: 0,
            wood: 0,
            stone: 0,
            gems: 0
        };

        // Pour chaque bâtiment, ajouter sa production en fonction de son type et niveau
        this.buildings.forEach(building => {
            switch (building.type) {
                case 'townhall':
                    production.gold += 5 * building.level;
                    break;
                case 'house':
                    // Les maisons augmentent la population max, pas la production directe
                    break;
                case 'farm':
                    production.food += 10 * building.level;
                    break;
                // Ajouter d'autres types de bâtiments au besoin
            }
        });

        return production;
    }
}