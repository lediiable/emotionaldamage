class Boot extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    preload() {
        // Afficher un texte de chargement pendant que le logo se charge
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.loadingText = this.add.text(width / 2, height / 2, 'Chargement...', {
            font: '20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Charger les ressources initiales
        this.load.image('loading-background', 'assets/images_new/TESORO.jpg');
        this.load.image('logo', 'templates/img/logo.png');
    }

    create() {
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        // Configurer l'arrière-plan
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const loadingBg = this.add.image(width / 2, height / 2, 'loading-background');
        loadingBg.setDisplaySize(width, height);

        // Ajouter le logo
        const logo = this.add.image(width / 2, height * 0.2, 'logo');
        const scale = Math.min(width * 0.6 / logo.width, height * 0.3 / logo.height);
        logo.setScale(scale);

        // Supprimer le texte de chargement
        if (this.loadingText) this.loadingText.destroy();

        // Attendre un court instant pour que l'utilisateur voie le logo
        this.time.delayedCall(700, () => {
            this.scene.start('Preload');
        });
    }
}