var star, texture, start_game, records, title,
    speed = 15, distance = 300,
    max = 50,
    xx = [], yy = [], zz = [],
    platformer2;

var Menu = {
    preload: function() {
        game.load.image('tinystar', 'assets/images/tinystar.png');
        game.load.image('start', 'assets/images/start_game.png');
        game.load.image('records', 'assets/images/records.png');
        game.load.image('title', 'assets/images/title.png');
        game.load.bitmapFont('carrier_command', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');
        game.load.audio('platformer2', 'assets/audio/Platformer2.mp3');
    },

    create: function() {

        if(!platformer2) {
            platformer2 = game.add.audio('platformer2', 1, true);
            platformer2.play();
        }

        star = game.make.sprite(0, 0, 'tinystar');
        texture = game.add.renderTexture(900, 600, 'texture');
        game.add.sprite(0, 0, texture);

        for(let i = 0; i < max; i++) {
            xx[i] = Math.floor(Math.random() * 900) - 400;
            yy[i] = Math.floor(Math.random() * 600) - 300;
            zz[i] = Math.floor(Math.random() * 1700) - 100;
        }

        title = game.add.sprite(game.world.centerX, game.world.centerY-170, 'title');
        title.anchor.set(0.5,0.5);

        start_game = game.add.button(game.world.centerX, game.world.centerY+30, 'start', this.startGame, this);
        start_game.anchor.set(0.5,0.5);

        records = game.add.button(game.world.centerX, game.world.centerY+110, 'records', this.showRecords, this);
        records.anchor.set(0.5,0.5);

        var controlText1 = game.add.bitmapText(game.world.centerX, game.world.height - 52, 'carrier_command', "RIGHT/LEFT ARROW - rotation, UP ARROW - fly, DOWN ARROW - stop", 10);
        controlText1.anchor.set(0.5,0.5);
        var controlText2 = game.add.bitmapText(game.world.centerX, game.world.height - 20, 'carrier_command', "SPACE - shoot, ESC - back to menu", 10);
        controlText2.anchor.set(0.5,0.5);
    },

    update: function() {
        texture.clear();

        for(let i = 0; i < max; i++) {
            let perspective = distance / (distance - zz[i]);
            let x = game.world.centerX + xx[i] * perspective;
            let y = game.world.centerY + yy[i] * perspective;
            
            zz[i] += speed;

            if(zz[i] > 300) {
                zz[i] -= 600;
            }

            texture.renderXY(star, x, y);
        }
    },

    startGame: function() {
        this.state.start('Game');
    },

    showRecords: function() {
        this.state.start('Records', true, false);
    }
};