var player, playerDamage = 1, cursors, 
    bullets, bulletTime = 0,
    fireButton, friendAndFoe,
    asteroids, maxAsteroids = 3,
    ufos, maxUfos = 4, ufoBullets;

function Player() {
    this.health = 5;
    this.damage = 1;
}

function Asteroid() {
    this.health = 50;
}

function Ufo() {
    this.health = 30;
    this.damage = 2;
}

function Jet() {
    this.health = 5;
    this.damage = 1;
}

function Kamikaze() {
    this.health = 1;
}

var Game = {
    preload: function() {
        game.load.image('background', 'assets/images/black.png');
        game.load.image('player', 'assets/images/player.png');
        game.load.image('asteroid', 'assets/images/asteroid_1.png');
        game.load.image('bullet', 'assets/images/bulletSmall.png');
        game.load.image('ufo', 'assets/images/ufoEnemy.png');
    },

    create: function() {
        game.add.tileSprite(0, 0, 2400, 1800, 'background');

        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(30, 'bullet');
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 0.5);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('checkWorldBounds', true);

        game.world.setBounds(0, 0, 2400, 1800);

        player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
        player.scale.setTo(0.5,0.5);
        player.anchor.set(0.5,0.5);
        game.physics.arcade.enable(player);
        player.body.drag.set(70);
        player.body.maxVelocity.set(300);
        player.body.collideWorldBounds = true;
        player.body.bounce.set(0.5);

        game.camera.follow(player);
        
        cursors = game.input.keyboard.createCursorKeys();

        asteroids = game.add.group();
        asteroids.enableBody = true;
        asteroids.physicsBodyType = Phaser.Physics.ARCADE;
        spawnAsteroids();

        ufos = game.add.group();
        ufos.enableBody = true;
        ufos.physicsBodyType = Phaser.Physics.ARCADE;
        spawnUfos();

        fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    },

    update: function() {
        if (cursors.up.isDown)
        {
            game.physics.arcade.accelerationFromRotation(player.rotation, 300, player.body.acceleration);
        }
        else
        {
            player.body.acceleration.set(0);
        }

        if (cursors.left.isDown)
        {
            player.body.angularVelocity = -300;
        }
        else if (cursors.right.isDown)
        {
            player.body.angularVelocity = 300;
        }
        else
        {
            player.body.angularVelocity = 0;
        }

        if (fireButton.isDown)
        {      
            fireBullet();
        }

        // if (asteroids.countLiving() < maxAsteroids)
        // {
        //     spawnAsteroids();
        // }

        game.physics.arcade.overlap(bullets, asteroids, collisionHandler, null, this);
        game.physics.arcade.overlap(bullets, ufos, collisionHandler, null, this);
        
    }
};

function spawnAsteroids() {  
    for(let i = 0; i < maxAsteroids; i++) {
        var asteroid = asteroids.create(360 + Math.random() * 400, 120 + Math.random() * 400, 'asteroid');
        asteroid.hp = 50; 
        asteroids.points = 200; 
        asteroid.body.angularVelocity = game.rnd.integerInRange(0, 200);
        asteroid.anchor.set(0.5,0.5);
        asteroid.body.collideWorldBounds = true;
        asteroid.body.bounce.set(0.5);
        var randomAngle = game.math.degToRad(game.rnd.angle());
        var randomVelocity = game.rnd.integerInRange(50, 150);
        game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);
    }
}

function spawnUfos() {
    for(let i = 0; i < maxUfos; i++) {
        var ufo = ufos.create(360 + Math.random() * 400, 120 + Math.random() * 400, 'ufo');
        ufo.body.angularVelocity = game.rnd.integerInRange(0, 200);
        ufo.anchor.set(0.5,0.5);
        ufo.body.collideWorldBounds = true;
        ufo.body.bounce.set(0.5);
        var randomAngle = game.math.degToRad(game.rnd.angle());
        var randomVelocity = game.rnd.integerInRange(50, 150);
        game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, ufo.body.velocity);
    }
}

function collisionHandler (bullet, enemy) {
    bullet.kill();
    enemy.kill();
}