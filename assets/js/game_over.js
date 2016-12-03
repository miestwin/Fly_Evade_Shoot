var endRecord, titleOver, goToMenu;

var GameOver = {
    preload: function() {
        game.load.image('tinystar', 'assets/images/tinystar.png');
        //game.load.image('goToMenu', 'assets/images/goToMenu.png');
        //game.load.image('titleOver', 'assets/images/gameOver.png');
        //game.load.bitmapFont('carrier_command', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');
    },

    create: function() {
        star = game.make.sprite(0, 0, 'tinystar');
        texture = game.add.renderTexture(900, 600, 'texture');
        game.add.sprite(0, 0, texture);

        for(let i = 0; i < max; i++) {
            xx[i] = Math.floor(Math.random() * 900) - 400;
            yy[i] = Math.floor(Math.random() * 600) - 300;
            zz[i] = Math.floor(Math.random() * 1700) - 100;
        }

        //titleOver = game.add.sprite(game.world.centerX, game.world.centerY-200, 'titleOver');
        //titleOver.anchor.set(0.5,0.5);

        //this.saveRecord();

        //goToMenu = game.add.button(game.world.centerX, game.world.centerY+210, 'goToMenu', this. goToMenu, this);
        //goToMenu.anchor.set(0.5,0.5);
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

    goToMenu: function() {
        this.state.start('Menu');
    }
};