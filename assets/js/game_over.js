var starg, textureg, endRecord, titleOver, goToMenu,
    speedg = 15, distanceg = 300,
    maxg = 50,
    xxg = [], yyg = [], zzg = [];

var GameOver = {
    preload: function() {
        game.load.image('tinystar', 'assets/images/tinystar.png');
        game.load.image('goToMenu', 'assets/images/goToMenu.png');
        game.load.image('titleOver', 'assets/images/gameOver.png');
        game.load.bitmapFont('carrier_command', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');
    },

    create: function() {
        starg = game.make.sprite(0,0,'tinystar');
        textureg = game.add.renderTexture(900, 600, 'texture');
        game.add.sprite(0,0,textureg);

        for(let i = 0; i < maxg; i++) {
            xxg[i] = Math.floor(Math.random() * 900) - 400;
            yyg[i] = Math.floor(Math.random() * 600) - 300;
            zzg[i] = Math.floor(Math.random() * 1700) - 100;
        }

        //titleOver = game.add.sprite(game.world.centerX, game.world.centerY-200, 'titleOver');
        //titleOver.anchor.set(0.5,0.5);

        //this.saveRecord();

        //goToMenu = game.add.button(game.world.centerX, game.world.centerY+210, 'goToMenu', this. goToMenu, this);
        //goToMenu.anchor.set(0.5,0.5);
    },

    update: function() {
        textureg.clear();

        for(let i = 0; i < maxg; i++) {
            let perspective = distanceg / (distanceg - zzg[i]);
            let x = game.world.centerX + xxg[i] * perspective;
            let y = game.world.centerY + yyg[i] * perspective;

            zzg[i] += speedg;

            if(zzg[i] > 300) {
                zzg[i] -= 600;
            }

            textureg.renderXY(starg, x, y);
        }
    },

    saveRecord: function() {

    },

    goToMenu: function() {
        this.state.start('Menu');
    }
};