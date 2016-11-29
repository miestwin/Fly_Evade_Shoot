var starr, texturer, back, records_title,
    speedr = 15, distancer = 300,
    maxr = 50,
    xxr = [], yyr = [], zzr = [];

var Records = {
    preload: function() {
        game.load.image('tinystar', 'assets/images/tinystar.png');
        game.load.image('back', 'assets/images/back.png');
        game.load.image('records_title', 'assets/images/records_title.png');
        game.load.bitmapFont('carrier_command', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');
    },

    create: function() {
        starr = game.make.sprite(0,0,'tinystar');
        texturer = game.add.renderTexture(900, 600, 'texture');
        game.add.sprite(0,0,texturer);

        for(let i = 0; i < maxr; i++) {
            xxr[i] = Math.floor(Math.random() * 900) - 400;
            yyr[i] = Math.floor(Math.random() * 600) - 300;
            zzr[i] = Math.floor(Math.random() * 1700) - 100;
        }

        records_title = game.add.sprite(game.world.centerX, game.world.centerY-200, 'records_title');
        records_title.anchor.set(0.5,0.5);

        this.getRecords();

        back = game.add.button(game.world.centerX, game.world.centerY+210, 'back', this.backToMenu, this);
        back.anchor.set(0.5,0.5);       
    },

    update: function() {
        texturer.clear();

        for(let i = 0; i < maxr; i++) {
            let perspective = distancer / (distancer - zzr[i]);
            let x = game.world.centerX + xxr[i] * perspective;
            let y = game.world.centerY + yyr[i] * perspective;

            zzr[i] += speedr;

            if(zzr[i] > 300) {
                zzr[i] -= 600;
            }

            texturer.renderXY(starr, x, y);
        }
    },

    getRecords: function() {
        if(typeof(Storage) !== 'undefined') {
            var tab = JSON.parse(localStorage.getItem('records'));
            for(let i = 0; i < tab.length; i++) {
                let text = game.add.bitmapText(game.world.centerX, (game.world.centerY-136)+(i*30), 'carrier_command', ((i+1) + "." + " " + tab[i]), 18);
                text.anchor.set(0.5,0.5);
            }
        } else {
            let text = game.add.bitmapText(game.world.centerX, game.world.centerY, 'carrier_command', "YOUR BROWSER DON'T SUPPORT LOCALSTORAGE", 18);
            text.anchor.set(0.5,0.5);
        }
    },

    backToMenu: function() {
        this.state.start('Menu');
    }
};