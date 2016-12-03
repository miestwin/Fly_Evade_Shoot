var back, records_title;

var Records = {
    preload: function() {
        //game.load.image('tinystar', 'assets/images/tinystar.png');
        game.load.image('back', 'assets/images/back.png');
        game.load.image('records_title', 'assets/images/records_title.png');
        game.load.bitmapFont('carrier_command', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');
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

        records_title = game.add.sprite(game.world.centerX, game.world.centerY-200, 'records_title');
        records_title.anchor.set(0.5,0.5);

        this.getRecords();

        back = game.add.button(game.world.centerX, game.world.centerY+210, 'back', this.backToMenu, this);
        back.anchor.set(0.5,0.5);       
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
        this.state.start('Menu', true, false);
    }
};