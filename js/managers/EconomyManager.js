class EconomyManager {
    constructor(scene, buildingManager) {
        this.scene = scene;
        this.buildingManager = buildingManager;

        // Références aux ressources du jeu
        this.resources = gameData.resources;

        // Taux de génération de base par seconde
        this.baseGenerationRates = {
            gold: 0,
            food: 0,
            wood: 0,
            stone: 0,
            gems: 0
        };

        // Dernière mise à jour des ressources
        this.lastUpdate = 0;

        // Émetteur d'événements
        this.events = new Phaser.Events.EventEmitter();
    }

    init() {

    }


    updateResources() {
        // Calculer le temps écoulé depuis la dernière mise à jour
        const now = Date.now();
        const deltaSeconds = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;

        // Calculer la production basée sur les bâtiments
        const buildingProduction = this.buildingManager ?
            this.buildingManager.calculateResourceProduction() :
            { gold: 0, food: 0, wood: 0, stone: 0, gems: 0 };

        // Calculer la production totale
        const totalProduction = {};
        for (const resource in this.baseGenerationRates) {
            totalProduction[resource] = this.baseGenerationRates[resource] +
                (buildingProduction[resource] || 0) / 60; // Convertir en "par seconde"
        }

        // Appliquer la production aux ressources
        let resourcesChanged = false;
        for (const resource in totalProduction) {
            if (this.resources[resource] !== undefined) {
                const amount = totalProduction[resource] * deltaSeconds;
                if (amount > 0) {
                    this.resources[resource] += amount;
                    this.resources[resource] = Math.floor(this.resources[resource] * 100) / 100; // Arrondir à 2 décimales
                    resourcesChanged = true;
                }
            }
        }

        // Émettre un événement si les ressources ont changé
        if (resourcesChanged) {
            this.events.emit('resourcesUpdated', this.resources);
            this.scene.gameEventEmitter.emit('resourcesChanged');
        }
    }

    addResources(type, amount) {
        // Ajouter des ressources directement
        if (this.resources[type] !== undefined) {
            this.resources[type] += amount;

            // Émettre un événement
            this.events.emit('resourcesUpdated', this.resources);
            this.scene.gameEventEmitter.emit('resourcesChanged');

            return true;
        }
        return false;
    }

    removeResources(type, amount) {
        // Retirer des ressources (pour les achats, constructions, etc.)
        if (this.resources[type] !== undefined && this.resources[type] >= amount) {
            this.resources[type] -= amount;

            // Émettre un événement
            this.events.emit('resourcesUpdated', this.resources);
            this.scene.gameEventEmitter.emit('resourcesChanged');

            return true;
        }
        return false;
    }

    hasEnoughResources(costs) {
        // Vérifier si le joueur a assez de ressources pour un achat
        for (const [resource, amount] of Object.entries(costs)) {
            if (this.resources[resource] === undefined || this.resources[resource] < amount) {
                return false;
            }
        }
        return true;
    }

    purchase(costs) {
        // Effectuer un achat avec plusieurs types de ressources
        if (this.hasEnoughResources(costs)) {
            for (const [resource, amount] of Object.entries(costs)) {
                this.removeResources(resource, amount);
            }
            return true;
        }
        return false;
    }

    getResourceLimit(resourceType) {
        // Calculer la limite de stockage pour un type de ressource
        // Par exemple, la limite d'or pourrait être basée sur le niveau de l'hôtel de ville

        let limit = 1000; // Limite de base

        // Exemples de modificateurs basés sur les bâtiments
        if (this.buildingManager) {
            if (resourceType === 'gold') {
                // L'hôtel de ville augmente la limite d'or
                const townHalls = this.buildingManager.getBuildingsByType('townhall');
                townHalls.forEach(townHall => {
                    limit += 1000 * townHall.level;
                });
            } else if (resourceType === 'food') {
                // Les greniers augmentent la limite de nourriture
                // (à implémenter lorsque des greniers seront ajoutés)
            }
        }

        return limit;
    }

    getResourcesStatus() {
        // Obtenir un rapport d'état des ressources
        const status = {};

        for (const resource in this.resources) {
            const limit = this.getResourceLimit(resource);
            status[resource] = {
                current: this.resources[resource],
                limit: limit,
                percentage: (this.resources[resource] / limit) * 100
            };
        }

        return status;
    }

    getResourceGenerationRates() {
        // Calculer les taux de génération actuels
        const buildingProduction = this.buildingManager ?
            this.buildingManager.calculateResourceProduction() :
            { gold: 0, food: 0, wood: 0, stone: 0, gems: 0 };

        const rates = {};
        for (const resource in this.baseGenerationRates) {
            rates[resource] = this.baseGenerationRates[resource] +
                (buildingProduction[resource] || 0) / 60; // Par seconde
        }

        return rates;
    }
}