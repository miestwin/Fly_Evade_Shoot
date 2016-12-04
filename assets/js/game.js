var player, playerDamage = 1, bullets, bulletTime = 0;

var cursors, fireButton, escButton;

var friendAndFoe, asteroids, maxAsteroids = 1,
    ufos, maxUfos = 2, ufoBullets, ufoFiringTime = 0, ufoDamage = 2,
    kamikaze, maxKamikaze = 20;

var explosions;

var scoreText, health, score = 0, time;

var titleOver, goToMenu, endScore;

var waves;

var Game = {
    preload: function() {
        game.load.image('background', 'assets/images/black.png');
        game.load.image('player', 'assets/images/player.png');
        game.load.image('asteroid', 'assets/images/asteroid_1.png');
        game.load.image('bullet', 'assets/images/bulletSmall.png');
        game.load.image('ufoBullet', 'assets/images/enemy-bullet.png');
        game.load.image('ufo', 'assets/images/ufoEnemy.png');
        game.load.image('kamikaze', 'assets/images/enemy1.png');
        game.load.spritesheet('kaboom', 'assets/images/explode.png', 128, 128);
        game.load.bitmapFont('carrier_command', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');
        game.load.image('titleOver', 'assets/images/gameOver.png');
        game.load.image('goToMenu', 'assets/images/goToMenu.png');
    },

    create: function() {
        score = 0;
        
        game.add.tileSprite(0, 0, 2400, 1800, 'background');
        game.world.setBounds(0, 0, 2400, 1800);

        this.createPlayer();

        game.camera.follow(player);

        this.createExplosion();
        this.createAsteroids();
        this.createUfo();
        this.createKamikaze();

        scoreText = game.add.bitmapText(10, 10, 'carrier_command', "Score: " + score, 15);
        scoreText.anchor.set(0,0);
        scoreText.fixedToCamera = true;

        health = game.add.bitmapText(10, 35, 'carrier_command', "Health: " + player.health, 15);
        health.anchor.set(0,0);
        health.fixedToCamera = true;

        time = game.add.bitmapText(10, 55, 'carrier_command', "Time: ", 15);
        time.anchor.set(0,0);
        time.fixedToCamera = true;

        cursors = game.input.keyboard.createCursorKeys();
        fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
        escButton = this.input.keyboard.addKey(Phaser.KeyCode.ESC);

        waves = game.time.events.loop(game.rnd.integerInRange(3000,5000), this.spawnEnemies, this);
    },

    update: function() {
        if (cursors.up.isDown) {
            game.physics.arcade.accelerationFromRotation(player.rotation, 300, player.body.acceleration);
        } else {
            player.body.acceleration.set(0);
        }

        if (cursors.left.isDown) {
            player.body.angularVelocity = -300;
        } else if (cursors.right.isDown) {
            player.body.angularVelocity = 300;
        } else {
            player.body.angularVelocity = 0;
        }

        if (fireButton.isDown) {      
            this.fireBullet();
        }

        if(escButton.isDown) {
            this.endGame();
        }

        ufos.forEachAlive(function(ufo) {
            if(game.physics.arcade.distanceBetween(player, ufo) < ufo.noticeRange && game.time.now > ufoFiringTime) {
                this.fireUfoBullet(ufo);
            }
        }.bind(this));

        kamikaze.forEachAlive(function(enemy) {
            this.kamikazeFollow(enemy);
        }.bind(this));

        game.physics.arcade.overlap(bullets, asteroids, this.collisionWithPlayerBullet, null, this);
        game.physics.arcade.overlap(bullets, ufos, this.collisionWithPlayerBullet, null, this);
        game.physics.arcade.overlap(bullets, kamikaze, this.collisionWithPlayerBullet, null, this);

        game.physics.arcade.overlap(asteroids, player, this.collisionWithAsteroids, null, this);
        game.physics.arcade.overlap(kamikaze, player, this.collisionWithKamikaze, null, this);

        game.physics.arcade.overlap(ufoBullets, player, this.collisionWithUfoBullet, null, this);

        time.text = "Time: " + (game.time.events.duration/1000);
    },

    createPlayer: function() {
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
    },

    fireBullet: function() {
        if (game.time.now > bulletTime) {
            var bullet = bullets.getFirstExists(false);
            if (bullet) {
                var length = player.width * 0.5;
                var x = player.x + (Math.cos(player.rotation) * length);
                var y = player.y + (Math.sin(player.rotation) * length);
                bullet.reset(x, y);
                bullet.rotation = player.rotation;              
                game.physics.arcade.velocityFromRotation(player.rotation, 500, bullet.body.velocity);
                bulletTime = game.time.now + 100;
            }
        }
    },

    createExplosion: function() {
        explosions = game.add.group();
        explosions.createMultiple(60, 'kaboom');
        explosions.forEach(function(explosion) {
            explosion.anchor.x = 0.5;
            explosion.anchor.y = 0.5;
            explosion.animations.add('kaboom');
        }, this);
    },

    createAsteroids: function() {
        asteroids = game.add.group();
        asteroids.enableBody = true;
        asteroids.physicsBodyType = Phaser.Physics.ARCADE;
        this.spawnAsteroids();
    },

    spawnAsteroids: function() {  
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
    },

    createUfo: function() {
        ufos = game.add.group();
        ufos.enableBody = true;
        ufos.physicsBodyType = Phaser.Physics.ARCADE;
        ufoBullets = game.add.group();
        ufoBullets.enableBody = true;
        ufoBullets.physicsBodyType = Phaser.Physics.ARCADE;
        ufoBullets.createMultiple(200, 'ufoBullet');
        ufoBullets.setAll('anchor.x', 0.5);       
        ufoBullets.setAll('anchor.y', 0.5);
        ufoBullets.setAll('outOfBoundsKill', true);
        ufoBullets.setAll('checkWorldBounds', true);
        this.spawnUfos();
    },

    spawnUfos: function() {
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
    },

    fireUfoBullet: function(ufo) {
        var bullet = ufoBullets.getFirstExists(false);
        if(bullet) {
            bullet.scale.setTo(1.8,1.8);
            var length = ufo.width * 0.5;
            var x = ufo.body.x + length;
            var y = ufo.body.y + length;   
            bullet.reset(x, y);  
            game.physics.arcade.moveToObject(bullet, player, 120); 
            ufoFiringTime = game.time.now + 400;
        }
    },

    createKamikaze: function() {
        kamikaze = game.add.group();
        kamikaze.enableBody = true;
        kamikaze.physicsBodyType = Phaser.Physics.ARCADE;
        kamikaze.scale.setTo(0.3,0.3);
        this.spawnKamikaze();
    },

    spawnKamikaze: function() {
        for(let i = 0; i < maxKamikaze; i++) {
            var kamikaze_ = kamikaze.create(100 + Math.random() * 600, 100 + Math.random() * 200, 'kamikaze');
            kamikaze_.health = 1;
            kamikaze_.anchor.setTo(0.5,0.5);
            kamikaze_.body.collideWorldBounds = true;
            kamikaze_.body.bounce.set(0.5);
        }
    },

    kamikazeFollow: function(enemy) {
        enemy.rotation = game.physics.arcade.moveToObject(enemy, player, 100);
    },

    spawnEnemies: function() {
        console.log(1);
        this.killAll();
        this.createAsteroids();
        this.createUfo();
        this.createKamikaze();
    },

    collisionWithPlayerBullet: function (bullet, enemy) {
        var explosionBullet, explosionEnemy;
        explosionBullet = explosions.getFirstExists(false);
        explosionBullet.scale.setTo(0.3,0.3);
        explosionBullet.reset(bullet.body.x, bullet.body.y);
        explosionBullet.play('kaboom', 100, false, true);
        bullet.kill();
        enemy.damage(playerDamage);
        if(enemy.health <= 0) {
            score += 10;
            scoreText.text = "Score: " + score;
            explosionEnemy = explosions.getFirstExists(false);
            explosionEnemy.scale.setTo(1.2,1.2);
            explosionEnemy.reset(enemy.body.x, enemy.body.y);
            explosionEnemy.play('kaboom', 30, false, true);
        }
    },

    collisionWithUfoBullet: function(bullet, obj) {
        var explosionBullet, explosionObj;
        explosionBullet = explosions.getFirstExists(false);
        explosionBullet.scale.setTo(0.6,0.6);
        explosionBullet.reset(bullet.body.x, bullet.body.y);
        explosionBullet.play('kaboom', 50, false, true);
        bullet.kill();
        obj.damage(ufoDamage);
        health.text = "Health: " + obj.health;
        if(obj.health <= 0) {
            explosionObj = explosions.getFirstExists(false);
            explosionObj.scale.setTo(1,1);
            explosionObj.reset(obj.body.x, obj.body.y);
            explosionObj.play('kaboom', 30, false, true);
            this.endGame();
        }
    },

    collisionWithAsteroids: function(asteroid, obj) {
        var explosion;
        obj.kill();
        health.text = "Health: " + 0;
        explosion = explosions.getFirstExists(false);
        explosion.reset(obj.body.x, obj.body.y);
        explosion.play('kaboom', 30, false, true);
        this.endGame();
    },

    collisionWithKamikaze: function(enemy, obj) {
        var explosionObj, explosionEnemy;
        enemy.kill();
        explosionEnemy = explosions.getFirstExists(false);
        explosionEnemy.reset(enemy.body.x, enemy.body.y);
        explosionEnemy.play('kaboom', 30, false, true);
        obj.damage(1);   
        health.text = "Health: " + obj.health;
        if(obj.health <= 0) {
            explosionObj = explosions.getFirstExists(false);
            explosionObj.reset(obj.body.x, obj.body.y);
            explosionObj.play('kaboom', 30, false, true);
            this.endGame();
        }
    },

    endGame: function() {
        game.time.events.remove(waves);

        this.killAll();
        player.kill();
        bullets.callAll('kill');
        scoreText.kill();
        health.kill();
        time.kill();
        
        titleOver = game.add.sprite(game.camera.width / 2, (game.camera.height / 2) - 60, 'titleOver');
        titleOver.anchor.set(0.5,0.5);
        titleOver.fixedToCamera = true;

        endScore = game.add.bitmapText(game.camera.width / 2, game.camera.height / 2, 'carrier_command', "Your score is " + score, 18);
        endScore.anchor.set(0.5,0.5);
        endScore.fixedToCamera = true;

        goToMenu = game.add.button(game.camera.width / 2, (game.camera.height / 2) + 60, 'goToMenu', this.backToMenu, this);
        goToMenu.anchor.set(0.5,0.5);
        goToMenu.fixedToCamera = true;
        game.world.setBounds(0, 0, 900, 600);

        this.saveScore();
    },

    killAll: function() {
        asteroids.callAll('kill');
        ufos.callAll('kill');
        kamikaze.callAll('kill');
        ufoBullets.callAll('kill');
    },

    backToMenu: function() {
        this.state.start("Menu", true, false);
    },

    saveScore() {
        var recordsTab = [];
        if(typeof(Storage) !== 'undefined') {
            if(localStorage.getItem('records') !== null) {
                recordsTab = JSON.parse(localStorage.getItem('records'));
                for(let i = 0; i < 10; i++) {
                    if(score === recordsTab[i]) {
                        break;
                    }
                    if(score > recordsTab[i]) {
                        recordsTab.splice(i, 0, score)
                        recordsTab.splice(9, 1);
                        break;
                    }
                }
                localStorage.setItem("records", JSON.stringify(recordsTab));
            } else {
                recordsTab.length = 10;
                recordsTab.fill(0, 0, 10);
                localStorage.setItem("records", JSON.stringify(recordsTab));
            }
        }
    }
};