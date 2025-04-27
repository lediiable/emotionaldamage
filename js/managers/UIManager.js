class UIManager {
    constructor(scene, mapManager) {
        this.scene = scene;
        this.mapManager = mapManager;

        // État de l'interface
        this.buildMode = {
            active: false,
            selectedBuilding: null,
            placementGhost: null
        };

        // Références à l'interface
        this.resourcesUI = null;
        this.buildingsUI = null;
        this.tooltipUI = null;
    }

    init() {
        // Initialiser l'interface utilisateur
        this.createResourcesUI();
    }

    // Remplacer complètement la méthode createResourcesUI() dans UIManager.js

    createResourcesUI() {
        // Supprimer l'UI existante si présente
        if (this.resourcesUI) {
            this.resourcesUI.destroy();
        }

        // Créer une ressource en HTML pur fixée à l'écran
        // Cela évite complètement les problèmes de positionnement de Phaser

        // D'abord supprimer l'ancien élément s'il existe
        const existingUI = document.getElementById('fixed-resources-ui');
        if (existingUI) {
            document.body.removeChild(existingUI);
        }

        // Créer un nouvel élément div pour contenir l'interface des ressources
        const uiContainer = document.createElement('div');
        uiContainer.id = 'fixed-resources-ui';

        // Définir le style CSS pour le fixer en haut à droite
        uiContainer.style.position = 'fixed';
        uiContainer.style.top = '20px';
        uiContainer.style.right = '20px';
        uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        uiContainer.style.padding = '10px';
        uiContainer.style.borderRadius = '8px';
        uiContainer.style.color = 'white';
        uiContainer.style.fontFamily = 'Arial, sans-serif';
        uiContainer.style.zIndex = '9999'; // S'assurer qu'il est toujours au-dessus
        uiContainer.style.minWidth = '120px';

        // Créer les éléments pour chaque ressource
        const resources = gameData.resources;
        this.resourceElements = {}; // Stocker les références aux éléments HTML

        const resourceTypes = [
            { key: 'gold', icon: '🟡', color: '#FFD700' },
            { key: 'food', icon: '🍎', color: '#32CD32' },
            { key: 'wood', icon: '🪵', color: '#8B4513' },
            { key: 'stone', icon: '🪨', color: '#A9A9A9' },
            { key: 'gems', icon: '💎', color: '#9370DB' }
        ];

        // Générer le contenu HTML pour chaque ressource
        resourceTypes.forEach(resource => {
            const resourceDiv = document.createElement('div');
            resourceDiv.style.margin = '5px 0';
            resourceDiv.style.display = 'flex';
            resourceDiv.style.justifyContent = 'space-between';

            // Texte de la valeur
            const valueSpan = document.createElement('span');
            valueSpan.textContent = Math.floor(resources[resource.key]);
            valueSpan.style.color = resource.color;
            valueSpan.style.textShadow = '1px 1px 2px black';
            valueSpan.style.fontWeight = 'bold';

            // Icône
            const iconSpan = document.createElement('span');
            iconSpan.textContent = resource.icon;
            iconSpan.style.marginLeft = '10px';

            // Assembler
            resourceDiv.appendChild(valueSpan);
            resourceDiv.appendChild(iconSpan);
            uiContainer.appendChild(resourceDiv);

            // Stocker la référence pour les mises à jour
            this.resourceElements[resource.key] = valueSpan;
        });

        // Ajouter l'élément au DOM
        document.body.appendChild(uiContainer);

        // Créer un conteneur vide dans Phaser juste pour la compatibilité
        this.resourcesUI = this.scene.add.container(0, 0);
        this.resourcesUI.name = 'resourcesUI';

        // Remplacer la méthode updateResourceDisplay pour mettre à jour l'UI HTML
        this.updateResourceDisplay = function() {
            const resources = gameData.resources;

            for (const [resource, element] of Object.entries(this.resourceElements)) {
                element.textContent = Math.floor(resources[resource]);
            }
        };

        return this.resourcesUI;
    }

    createBuildingsUI() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Container pour les boutons de bâtiments
        this.buildingsUI = this.scene.add.container(width - 110, height / 2);

        // Fond semi-transparent
        const bg = this.scene.add.rectangle(0, 0, 100, 300, 0x000000, 0.7);
        bg.setOrigin(0.5, 0.5);
        this.buildingsUI.add(bg);

        // Titre
        const title = this.scene.add.text(0, -125, 'Bâtiments', {
            fontSize: '16px',
            color: '#ffffff'
        });
        title.setOrigin(0.5, 0.5);
        this.buildingsUI.add(title);

        // Boutons pour chaque type de bâtiment
        const buildingTypes = [
            { key: 'townhall', name: 'Hôtel de ville', cost: { gold: 500 } },
            { key: 'house', name: 'Maison', cost: { gold: 100, wood: 50 } },
            { key: 'farm', name: 'Ferme', cost: { gold: 150, wood: 80 } }
        ];

        let yOffset = -80;

        buildingTypes.forEach(building => {
            // Icône du bâtiment
            const icon = this.scene.add.image(0, yOffset, building.key);
            icon.setDisplaySize(60, 60);
            icon.setInteractive();

            // Ajouter un événement lors de la sélection
            icon.on('pointerdown', () => this.onBuildingSelected(building.key));

            // Ajouter un événement pour l'infobulle
            icon.on('pointerover', () => this.showBuildingTooltip(building, icon));
            icon.on('pointerout', () => this.hideTooltip());

            this.buildingsUI.add(icon);

            // Nom du bâtiment
            const text = this.scene.add.text(0, yOffset + 40, building.name, {
                fontSize: '12px',
                color: '#ffffff'
            });
            text.setOrigin(0.5, 0.5);
            this.buildingsUI.add(text);

            // Mise à jour de la position pour le prochain élément
            yOffset += 90;
        });

        // Fixer l'UI à la caméra pour qu'elle reste en position
        this.buildingsUI.setScrollFactor(0);
    }

    onBuildingSelected(buildingType) {
        // Annuler le mode précédent s'il était actif
        if (this.buildMode.active) {
            this.cancelBuildMode();
        }

        // Activer le mode construction
        this.buildMode.active = true;
        this.buildMode.selectedBuilding = buildingType;

        // Créer un fantôme pour le placement
        this.createPlacementGhost(buildingType);

        console.log(`Mode construction activé: ${buildingType}`);
    }

    createPlacementGhost(buildingType) {
        // Récupérer les caractéristiques du bâtiment
        const building = gameData.buildingTypes[buildingType];
        if (!building) return;

        // Créer un sprite fantôme semi-transparent
        const ghost = this.scene.add.image(0, 0, buildingType);
        ghost.setAlpha(0.6);

        // Ajuster l'échelle selon la taille du bâtiment
        const size = building.size;
        const cellSize = this.mapManager.config.cellSize;

        if (this.mapManager.config.isIsometric) {
            ghost.setDisplaySize(cellSize * size, (cellSize/2) * size);
            ghost.setOrigin(0.5, 0.5);
        } else {
            ghost.setDisplaySize(cellSize * size, cellSize * size);
            ghost.setOrigin(0, 0);
        }

        // Utiliser un rectangle graphique au lieu de l'image highlight
        const highlight = this.scene.add.graphics();
        if (this.mapManager.config.isIsometric) {
            highlight.fillStyle(0x00ff00, 0.3);
            highlight.fillRect(-cellSize * size / 2, -cellSize * size / 4, cellSize * size, cellSize * size / 2);
        } else {
            highlight.fillStyle(0x00ff00, 0.3);
            highlight.fillRect(0, 0, cellSize * size, cellSize * size);
        }

        // Créer un container pour le fantôme et la mise en évidence
        const container = this.scene.add.container(0, 0, [highlight, ghost]);

        // Stocker les références
        this.buildMode.placementGhost = {
            container: container,
            sprite: ghost,
            highlight: highlight,
            size: size
        };
    }

    updatePlacementGhost(gridX, gridY) {
        if (!this.buildMode.placementGhost) return;

        const ghost = this.buildMode.placementGhost;
        const cellSize = this.mapManager.config.cellSize;
        const isIsometric = this.mapManager.config.isIsometric;

        let x, y;
        if (isIsometric) {
            x = (gridX - gridY) * cellSize / 2;
            y = (gridX + gridY) * cellSize / 4;
        } else {
            x = gridX * cellSize;
            y = gridY * cellSize;
        }

        // Positionner le fantôme aux coordonnées de la grille
        ghost.container.setPosition(x, y);

        // Vérifier si l'emplacement est valide
        const isValid = this.mapManager.isValidBuildingLocation(gridX, gridY, ghost.size);

        // Mettre à jour le graphique du highlight
        ghost.highlight.clear();
        if (isValid) {
            ghost.highlight.fillStyle(0x00ff00, 0.3);
        } else {
            ghost.highlight.fillStyle(0xff0000, 0.3);
        }

        if (isIsometric) {
            ghost.highlight.fillRect(-cellSize * ghost.size / 2, -cellSize * ghost.size / 4,
                cellSize * ghost.size, cellSize * ghost.size / 2);
        } else {
            ghost.highlight.fillRect(0, 0, cellSize * ghost.size, cellSize * ghost.size);
        }
    }

    createMovePlacementGhost(buildingType, level) {
        // Annuler le mode précédent s'il était actif
        if (this.buildMode.active) {
            this.cancelBuildMode();
        }

        // Activer le mode déplacement
        this.buildMode.active = true;
        this.buildMode.selectedBuilding = buildingType;
        this.buildMode.isMoving = true;

        // Créer un fantôme pour le placement
        this.createPlacementGhost(buildingType);

        // Si le bâtiment a un niveau supérieur à 1, mettre à jour l'apparence du fantôme
        if (level > 1 && this.buildMode.placementGhost) {
            const ghost = this.buildMode.placementGhost.sprite;
            const scaleFactor = 1 + (level - 1) * 0.1; // +10% par niveau
            ghost.setScale(scaleFactor);
        }

        console.log(`Mode déplacement activé pour: ${buildingType}`);
    }

    setMoveCompleteCallback(callback) {
        // Définir la fonction de rappel à appeler lorsque le déplacement est terminé
        this.buildMode.moveCompleteCallback = callback;
    }

    tryPlaceBuilding(gridX, gridY) {
        if (!this.buildMode.active || !this.buildMode.selectedBuilding) return;

        const buildingType = this.buildMode.selectedBuilding;

        // Vérifier si nous sommes en mode déplacement
        if (this.buildMode.isMoving && this.buildMode.moveCompleteCallback) {
            // Appeler la fonction de rappel avec les nouvelles coordonnées
            const success = this.buildMode.moveCompleteCallback(gridX, gridY);

            if (success) {
                // Terminer le mode déplacement
                this.cancelBuildMode();
            }
            return;
        }

        // Vérifier si l'emplacement est valide pour un nouveau bâtiment
        if (!this.mapManager.isValidBuildingLocation(gridX, gridY,
            gameData.buildingTypes[buildingType].size)) {
            console.log('Emplacement invalide pour le bâtiment');
            // On pourrait ajouter un effet visuel ou sonore pour indiquer l'échec
            return;
        }

        // Vérifier si le joueur a assez de ressources
        const costs = config.game.buildings.costs[buildingType];
        let hasResources = true;

        if (costs) {
            for (const [resource, amount] of Object.entries(costs)) {
                if (gameData.resources[resource] < amount) {
                    hasResources = false;
                    break;
                }
            }

            if (!hasResources) {
                console.log('Ressources insuffisantes pour construire ce bâtiment');
                // Afficher un message à l'utilisateur
                this.showMessage('Ressources insuffisantes!', 2000);
                return;
            }

            // Déduire les ressources
            for (const [resource, amount] of Object.entries(costs)) {
                gameData.resources[resource] -= amount;
            }

            // Mettre à jour l'affichage des ressources
            this.updateResourceDisplay();
        }

        // Placer le bâtiment
        const building = this.scene.buildingManager.placeBuilding(buildingType, gridX, gridY);

        if (building) {
            console.log(`Bâtiment ${buildingType} placé aux coordonnées: ${gridX}, ${gridY}`);

            // Terminer le mode construction
            this.cancelBuildMode();
        }
    }

    cancelBuildMode() {
        if (!this.buildMode.active) return;

        // Désactiver le mode construction
        this.buildMode.active = false;
        this.buildMode.selectedBuilding = null;
        this.buildMode.isMoving = false;
        this.buildMode.moveCompleteCallback = null;

        // Supprimer le fantôme
        if (this.buildMode.placementGhost) {
            this.buildMode.placementGhost.container.destroy();
            this.buildMode.placementGhost = null;
        }

        console.log('Mode construction/déplacement annulé');
    }

    showMessage(text, duration = 3000) {
        // Afficher un message temporaire à l'utilisateur

        // Supprimer tout message existant
        if (this.messageContainer) {
            this.messageContainer.destroy();
        }

        // Créer un nouveau conteneur pour le message
        this.messageContainer = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            100
        );

        // Fond du message
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.7);
        bg.fillRoundedRect(-150, -30, 300, 60, 10);

        // Texte du message
        const messageText = this.scene.add.text(0, 0, text, {
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        });
        messageText.setOrigin(0.5);

        this.messageContainer.add(bg);
        this.messageContainer.add(messageText);

        // Fixer le message à la caméra
        this.messageContainer.setScrollFactor(0);
        this.messageContainer.setDepth(1000);

        // Animation d'apparition
        this.messageContainer.setAlpha(0);
        this.scene.tweens.add({
            targets: this.messageContainer,
            alpha: 1,
            duration: 200,
            ease: 'Linear',
            onComplete: () => {
                // Configurer la disparition du message après un délai
                this.scene.time.delayedCall(duration, () => {
                    this.scene.tweens.add({
                        targets: this.messageContainer,
                        alpha: 0,
                        duration: 200,
                        ease: 'Linear',
                        onComplete: () => {
                            this.messageContainer.destroy();
                            this.messageContainer = null;
                        }
                    });
                });
            }
        });
    }

    showBuildingTooltip(building, targetObject) {
        // Si l'infobulle n'existe pas encore, la créer
        if (!this.tooltipUI) {
            this.tooltipUI = this.scene.add.container(0, 0);
            this.tooltipUI.setDepth(1000);
            this.tooltipUI.setScrollFactor(0);

            // Créer un fond pour l'infobulle
            this.tooltipBg = this.scene.add.rectangle(0, 0, 200, 100, 0x000000, 0.8);
            this.tooltipBg.setOrigin(0, 0);

            // Créer un texte pour l'infobulle
            this.tooltipText = this.scene.add.text(10, 10, '', {
                fontSize: '14px',
                color: '#ffffff',
                align: 'left',
                wordWrap: { width: 180 }
            });

            this.tooltipUI.add(this.tooltipBg);
            this.tooltipUI.add(this.tooltipText);
            this.tooltipUI.setVisible(false);
        }

        // Récupérer la position de l'objet cible en coordonnées écran
        const worldPos = targetObject.getWorldTransformMatrix();
        const x = worldPos.tx + targetObject.width / 2;
        const y = worldPos.ty;

        // Préparer le contenu de l'infobulle
        let content = `${building.name}\n\nCoût: `;
        if (building.cost) {
            for (const [resource, amount] of Object.entries(building.cost)) {
                content += `\n${resource}: ${amount}`;
            }
        }

        // Mettre à jour le texte
        this.tooltipText.setText(content);

        // Ajuster la taille du fond
        const bounds = this.tooltipText.getBounds();
        this.tooltipBg.width = bounds.width + 20;
        this.tooltipBg.height = bounds.height + 20;

        // Positionner l'infobulle près de l'objet cible
        this.tooltipUI.setPosition(x - this.tooltipBg.width - 10, y);

        // Afficher l'infobulle
        this.tooltipUI.setVisible(true);
    }

    hideTooltip() {
        if (this.tooltipUI) {
            this.tooltipUI.setVisible(false);
        }
    }

    updateBuildingButtons() {
        // Mettre à jour l'état des boutons de construction en fonction des ressources disponibles
        if (!this.buildingsUI) return;

        // Définir les coûts des bâtiments (idéalement, cela serait dans une configuration)
        const buildingCosts = {
            townhall: { gold: 500, wood: 250, stone: 100 },
            house: { gold: 100, wood: 50 },
            farm: { gold: 150, wood: 80 }
        };

        // Parcourir tous les boutons de bâtiments dans l'UI
        this.buildingsUI.list.forEach(child => {
            // Vérifier si c'est un bouton de bâtiment interactif
            if (child.type === 'Image' && child.input && child.getData('buildingType')) {
                const buildingType = child.getData('buildingType');
                const costs = buildingCosts[buildingType];

                if (costs) {
                    // Vérifier si le joueur a assez de ressources
                    let canAfford = true;
                    for (const [resource, amount] of Object.entries(costs)) {
                        if (gameData.resources[resource] < amount) {
                            canAfford = false;
                            break;
                        }
                    }

                    // Ajuster l'apparence du bouton
                    if (canAfford) {
                        child.clearTint();
                        child.setAlpha(1.0);
                    } else {
                        child.setTint(0x888888);
                        child.setAlpha(0.7);
                    }
                }
            }
        });
    }
}