var player, playerDamage = 1, cursors, 
    bullets, bulletTime = 0,
    fireButton, friendAndFoe,
    asteroids, maxAsteroids = 1,
    ufos, maxUfos = 2, ufoBullets, ufoFiringTime = 0, ufoDamage = 2,
    explosions;

var Game = {
    preload: function() {
        game.load.image('background', 'assets/images/black.png');
        game.load.image('player', 'assets/images/player.png');
        game.load.image('asteroid', 'assets/images/asteroid_1.png');
        game.load.image('bullet', 'assets/images/bulletSmall.png');
        game.load.image('ufoBullet', 'assets/images/enemy-bullet.png');
        game.load.image('ufo', 'assets/images/ufoEnemy.png');
        game.load.spritesheet('kaboom', 'assets/images/explode.png', 128, 128);
    },

    create: function() {
        game.add.tileSprite(0, 0, 2400, 1800, 'background');
        game.world.setBounds(0, 0, 2400, 1800);

        createPlayer();

        game.camera.follow(player);

        createAsteroids();
        createUfo();

        createExplosion();

        cursors = game.input.keyboard.createCursorKeys();
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

        ufos.forEachAlive(function(ufo) {
            if(game.physics.arcade.distanceBetween(player, ufo) < ufo.noticeRange && game.time.now > ufoFiringTime) {
                fireUfoBullet(ufo);
            }
        });

        game.physics.arcade.overlap(bullets, asteroids, collisionHandler, null, this);
        game.physics.arcade.overlap(player, asteroids, collisionWithAsteroids, null, this);
        game.physics.arcade.overlap(bullets, ufos, collisionHandler, null, this);
        game.physics.arcade.overlap(ufoBullets, player, collisionWithUfoBullet, null, this);
    }
};

function createPlayer() {
    player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
    player.health = 15;
    player.scale.setTo(0.5,0.5);
    player.anchor.set(0.5,0.5);
    game.physics.arcade.enable(player);
    player.body.drag.set(70);
    player.body.maxVelocity.set(300);
    player.body.collideWorldBounds = true;
    player.body.bounce.set(0.5);

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(60, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
}

function createAsteroids() {
    asteroids = game.add.group();
    asteroids.enableBody = true;
    asteroids.physicsBodyType = Phaser.Physics.ARCADE;
    spawnAsteroids();
}

function spawnAsteroids() {  
    for(let i = 0; i < maxAsteroids; i++) {
        var asteroid = asteroids.create(120 + Math.random() * 2280, 120 + Math.random() * 1600, 'asteroid');
        asteroid.health = 50;
        asteroid.body.angularVelocity = game.rnd.integerInRange(0, 200);
        asteroid.anchor.set(0.5,0.5);
        asteroid.body.collideWorldBounds = true;
        asteroid.body.bounce.set(0.5);
        var randomAngle = game.math.degToRad(game.rnd.angle());
        var randomVelocity = game.rnd.integerInRange(50, 150);
        game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);
    }
}

function createExplosion(func) {
    explosions = game.add.group();
    explosions.createMultiple(60, 'kaboom');
    explosions.forEach(function(explosion) {
        explosion.anchor.x = 0.5;
        explosion.anchor.y = 0.5;
        explosion.animations.add('kaboom');
    }, this);
}

function createUfo() {
    ufos = game.add.group();
    ufos.enableBody = true;
    ufos.physicsBodyType = Phaser.Physics.ARCADE;
    spawnUfos();

    ufoBullets = game.add.group();
    ufoBullets.enableBody = true;
    ufoBullets.physicsBodyType = Phaser.Physics.ARCADE;
    ufoBullets.createMultiple(200, 'ufoBullet');
    ufoBullets.setAll('anchor.x', 0.5);       
    ufoBullets.setAll('anchor.y', 0.5);
    ufoBullets.setAll('outOfBoundsKill', true);
    ufoBullets.setAll('checkWorldBounds', true);
}

function spawnUfos() {
    for(let i = 0; i < maxUfos; i++) {
        var ufo = ufos.create(120 + Math.random() * 2280, 120 + Math.random() * 1600, 'ufo');
        ufo.health = 30;
        ufo.noticeRange = 300;
        ufo.body.angularVelocity = game.rnd.integerInRange(0, 200);
        ufo.anchor.set(0.5,0.5);
        ufo.body.collideWorldBounds = true;
        ufo.body.bounce.set(0.5);
        ufo.animations.add('kaboom',[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 30, false);
        var randomAngle = game.math.degToRad(game.rnd.angle());
        var randomVelocity = game.rnd.integerInRange(50, 150);
        game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, ufo.body.velocity);
    }
}

function fireBullet () {
    if (game.time.now > bulletTime)
    {
        var bullet = bullets.getFirstExists(false);
 
        if (bullet)
        {
            var length = player.width * 0.5;
            var x = player.x + (Math.cos(player.rotation) * length);
            var y = player.y + (Math.sin(player.rotation) * length);
               
            bullet.reset(x, y);
            bullet.rotation = player.rotation;
               
            game.physics.arcade.velocityFromRotation(player.rotation, 500, bullet.body.velocity); //speed in the middle
            bulletTime = game.time.now + 100;
        }
    }
}

function fireUfoBullet(ufo) {
        var bullet = ufoBullets.getFirstExists(false);
        if(bullet) {

            bullet.scale.setTo(1.8,1.8);

            var length = ufo.width * 0.5;
            var x = ufo.body.x + length;//(Math.cos(Math.atan2(player.body.y - ufo.body.y, player.body.x - ufo.body.x) * (180 / Math.PI)) * length);
            var y = ufo.body.y + length;//(Math.sin(Math.atan2(player.body.y - ufo.body.y, player.body.x - ufo.body.x) * (180 / Math.PI)) * length);
               
            bullet.reset(x, y);
            //bullet.rotation = player.rotation;
            //bullet.angle = Math.atan2(player.body.y - y, player.body.x - x) * (180 / Math.PI);
               
            game.physics.arcade.moveToObject(bullet, player, 120); 
            ufoFiringTime = game.time.now + 400;
        }
}

function colisionWithEnemyBullet(obj, bullet) {
    var explosionBullet, explosionObj;
    explosionBullet = explosions.getFirstExists(false);
    explosionBullet.scale.setTo(0.5,0.5);
    explosionBullet.reset(bullet.body.x, bullet.body.y);
    explosionBullet.play('kaboom', 100, false, true);

    bullet.kill();
    obj.damage(ufoDamage);

    if(obj.health <= 0) {
        explosionObj = explosions.getFirstExists(false);
        explosionObj.reset(bullet.body.x, bullet.body.y);
        explosionObj.play('kaboom', 30, false, true);
    }
}

function collisionHandler (bullet, enemy) {
    var explosionBullet, explosionEnemy;
    explosionBullet = explosions.getFirstExists(false);
    explosionBullet.scale.setTo(0.3,0.3);
    explosionBullet.reset(bullet.body.x, bullet.body.y);
    explosionBullet.play('kaboom', 100, false, true);

    bullet.kill();
    enemy.damage(playerDamage);

    if(enemy.health <= 0) {
        explosionEnemy = explosions.getFirstExists(false);
        explosionEnemy.scale.setTo(1.2,1.2);
        explosionEnemy.reset(enemy.body.x, enemy.body.y);
        explosionEnemy.play('kaboom', 30, false, true);
    }
}

function collisionWithUfoBullet(bullet, obj) {
    var explosionBullet, explosionObj;
    explosionBullet = explosions.getFirstExists(false);
    explosionBullet.scale.setTo(0.6,0.6);
    explosionBullet.reset(bullet.body.x, bullet.body.y);
    explosionBullet.play('kaboom', 50, false, true);

    bullet.kill();
    obj.damage(ufoDamage);

    if(obj.health <= 0) {
        explosionObj = explosions.getFirstExists(false);
        explosionObj.scale.setTo(1,1);
        explosionObj.reset(obj.body.x, obj.body.y);
        explosionObj.play('kaboom', 30, false, true);
    }
}

function collisionWithAsteroids (obj, asteroid) {
    asteroid.damage(obj.health);
    obj.damage(obj.health);
    var explosion = explosions.getFirstExists(false);
    explosion.reset(obj.body.x, obj.body.y);
    explosion.play('kaboom', 30, false, true);
    bullets.callAll('kill', this);
}