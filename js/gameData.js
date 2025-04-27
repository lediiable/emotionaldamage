const gameData = {
    playerName: 'Player',
    playerLevel: 1,
    resources: {
        gold: 100000,
        food: 500,
        wood: 300,
        stone: 200,
        gems: 10
    },
    buildings: [
        {id: 1, type: 'townhall', level: 1, x: 50, y: 50}
    ],
    units: [],
    map: {
        width: 5,  // Changé de 4 à 5 (nombre de régions en largeur)
        height: 5,  // Changé de 4 à 5 (nombre de régions en hauteur)
        cellSize: 20, // Nombre de cellules par région (20×20)
        cellPixelSize: 64, // Taille en pixels de chaque cellule
        unlockedRegions: [12]  // Région centrale dans une grille 5×5 (était 5 dans la grille 4x4)
    },
    // 25 régions au total (grille 5x5)
    regions: [
        // Première ligne
        {id: 0, cost: 0, currency: 'gold', unlocked: false, purchasable: false},
        {id: 1, cost: 0, currency: 'gold', unlocked: false, purchasable: false},
        {id: 2, cost: 0, currency: 'gold', unlocked: false, purchasable: false},
        {id: 3, cost: 0, currency: 'gold', unlocked: false, purchasable: false},
        {id: 4, cost: 0, currency: 'gold', unlocked: false, purchasable: false},
        // Deuxième ligne
        {id: 5, cost: 0, currency: 'gold', unlocked: false, purchasable: false},
        {id: 6, cost: 800, currency: 'gold', unlocked: false, purchasable: true},
        {id: 7, cost: 800, currency: 'gold', unlocked: false, purchasable: true},
        {id: 8, cost: 800, currency: 'gold', unlocked: false, purchasable: true},
        {id: 9, cost: 0, currency: 'gold', unlocked: false, purchasable: false},
        // Troisième ligne (milieu)
        {id: 10, cost: 0, currency: 'gold', unlocked: false, purchasable: false},
        {id: 11, cost: 800, currency: 'gold', unlocked: false, purchasable: true},
        {id: 12, cost: 0, currency: 'gold', unlocked: true, purchasable: false}, // Centre, débloqué
        {id: 13, cost: 800, currency: 'gold', unlocked: false, purchasable: true},
        {id: 14, cost: 0, currency: 'gold', unlocked: false, purchasable: false},
        // Quatrième ligne
        {id: 15, cost: 0, currency: 'gold', unlocked: false, purchasable: false},
        {id: 16, cost: 800, currency: 'gold', unlocked: false, purchasable: true},
        {id: 17, cost: 800, currency: 'gold', unlocked: false, purchasable: true},
        {id: 18, cost: 800, currency: 'gold', unlocked: false, purchasable: true},
        {id: 19, cost: 0, currency: 'gold', unlocked: false, purchasable: false},
        // Cinquième ligne
        {id: 20, cost: 0, currency: 'gold', unlocked: false, purchasable: false},
        {id: 21, cost: 0, currency: 'gold', unlocked: false, purchasable: false},
        {id: 22, cost: 0, currency: 'gold', unlocked: false, purchasable: false},
        {id: 23, cost: 0, currency: 'gold', unlocked: false, purchasable: false},
        {id: 24, cost: 0, currency: 'gold', unlocked: false, purchasable: false}
    ],
    gridPositions: [
        [0, 1, 2, 3, 4],
        [5, 6, 7, 8, 9],
        [10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24]
    ],
    buildingTypes: {
        townhall: {name: 'Town Hall', size: 2, sprite: 'ayuntamiento'},
        house: {name: 'House', size: 1, sprite: '485_barraca'},
        farm: {name: 'Farm', size: 1, sprite: '467_barraca_arquero'}
    }
};