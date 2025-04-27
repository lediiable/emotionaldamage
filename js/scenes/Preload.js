class Preload extends Phaser.Scene {
    constructor() {
        super({key: 'Preload'});
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const loadingBg = this.add.image(width / 2, height / 2, 'loading-background');
        loadingBg.setDisplaySize(width, height);

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px Arial',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px Arial',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        const assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '18px Arial',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
            percentText.setText(parseInt(value * 100) + '%');
        });

        this.load.on('fileprogress', function (file) {
            assetText.setText('Loading asset: ' + file.key);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });

        this.loadAssets();
    }

    loadAssets() {
        // Charger les textures de base
        this.load.image('grass', 'templates/img/grass.png');
        this.load.image('forsale', 'assets/images_new/forsale.png');
        this.load.image('locked-region', 'assets/externalized/DailyBonus/bg.png');

        // Charger les icônes de ressources
        this.load.image('gold-icon', 'assets/images_new/en/troll_civ.png');
        this.load.image('food-icon', 'assets/images_new/en/troll_civ.png');
        this.load.image('wood-icon', 'assets/images_new/en/troll_civ.png');
        this.load.image('stone-icon', 'assets/images_new/en/troll_civ.png');
        this.load.image('gem-icon', 'assets/images_new/en/troll_civ.png');

        // Charger les bâtiments
        this.load.image('townhall', 'assets/buildingthumbs/ayuntamiento.jpg');
        this.load.image('house', 'assets/buildingthumbs/casa1.jpg');
        this.load.image('farm', 'assets/buildingthumbs/granja3.jpg');

        // Charger des sprites pour les boutons
        this.load.image('button-bg', 'assets/externalized/DailyBonus/bg.png');
    }

    create() {
        this.game.events.emit('loadingComplete'); // Ajouter cette ligne

        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MainGame');
        });
    }
}