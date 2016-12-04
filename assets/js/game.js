var player, playerDamage = 1, bullets, bulletTime = 0;

var cursors, fireButton, escButton;

var friendAndFoe, asteroids, maxAsteroids = 1,
    ufos, maxUfos = 2, ufoBullets, ufoFiringTime = 0, ufoDamage = 5,
    kamikaze, maxKamikaze = 30;

var explosions;

var scoreText, health, score = 0, time;

var titleOver, goToMenu, endScore;

var waves;

var LaserBlasts, laser, ufoExplosion, kamikazeExplosion;

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
        game.load.audio('LaserBlasts', 'assets/audio/LaserBlasts.mp3');
        game.load.audio('laser', 'assets/audio/scifi048.mp3');
        game.load.audio('ufoExplosion', 'assets/audio/ufoExplode.mp3');
        game.load.audio('kamikazeExplosion', 'assets/audio/kamikazeExplosion.mp3');
    },

    create: function() {
        score = 0;
        LaserBlasts = game.add.audio('LaserBlasts', 0.3);
        laser = game.add.audio('laser');
        ufoExplosion = game.add.audio('ufoExplosion', 1.4);
        kamikazeExplosion = game.add.audio('kamikazeExplosion');

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

        waves = game.time.events.loop(game.rnd.integerInRange(20000,40000), this.spawnEnemies, this);
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
            if(game.physics.arcade.distanceBetween(player, enemy) < enemy.noticeRange) {
                enemy.rotation = game.physics.arcade.moveToObject(enemy, player, 200);
            }
        }.bind(this));

        game.physics.arcade.overlap(bullets, asteroids, this.collisionWithPlayerBullet, null, this);
        game.physics.arcade.overlap(bullets, ufos, this.collisionWithPlayerBullet, null, this);
        game.physics.arcade.overlap(bullets, kamikaze, this.collisionWithPlayerBullet, null, this);

        game.physics.arcade.collide(player, asteroids, this.collisionWithAsteroids, null, this);
        game.physics.arcade.overlap(player, kamikaze, this.collisionWithKamikaze, null, this);

        game.physics.arcade.overlap(player, ufoBullets, this.collisionWithUfoBullet, null, this);

        time.text = "Time: " + (game.time.events.duration/1000);
    },

    createPlayer: function() {
        player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
        player.health = 50;
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
                laser.play();
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
            let x = 50 + Math.random() * 2400;
            let y = 50 + Math.random() * 1800;
            while(x > player.body.x - 200 && x < player.body.x + 200) {
                x = 50 + Math.random() * 2400; 
            }
            while(y > player.body.y - 200 && y < player.body.y + 200) {
                y = 50 + Math.random() * 1800;
            }
            var asteroid = asteroids.create(x, y, 'asteroid');
            asteroid.health = 15;
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
            let x = 100 + Math.random() * 2400;
            let y = 100 + Math.random() * 1800;
            while(x > player.body.x - 200 && x < player.body.x + 200) {
                x = 100 + Math.random() * 2400; 
            }
            while(y > player.body.y - 200 && y < player.body.y + 200) {
                y = 100 + Math.random() * 1800;
            }
            var ufo = ufos.create(x, y, 'ufo');
            ufo.health = 10;
            ufo.noticeRange = 300;
            ufo.body.angularVelocity = game.rnd.integerInRange(0, 200);
            ufo.anchor.set(0.5,0.5);
            ufo.body.collideWorldBounds = true;
            ufo.body.bounce.set(0.5);
            var randomAngle = game.math.degToRad(game.rnd.angle());
            var randomVelocity = game.rnd.integerInRange(50, 150);
            game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, ufo.body.velocity);
        }
    },

    fireUfoBullet: function(ufo) {
        var bullet = ufoBullets.getFirstExists(false);
        if(bullet) {
            LaserBlasts.play();
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
        this.spawnKamikaze();
    },

    spawnKamikaze: function() {
        for(let i = 0; i < maxKamikaze; i++) {
            let x = 50 + Math.random() * 2400;
            let y = 50 + Math.random() * 1800;
            while(x > player.body.x - 200 && x < player.body.x + 200) {
                x = 50 + Math.random() * 2400; 
            }
            while(y > player.body.y - 200 && y < player.body.y + 200) {
                y = 50 + Math.random() * 1800;
            }
            var kamikaze_ = kamikaze.create(x, y, 'kamikaze');
            kamikaze_.health = 1;
            kamikaze_.noticeRange = 300;
            kamikaze_.anchor.setTo(0.5,0.5);
            kamikaze_.body.collideWorldBounds = true;
            kamikaze_.body.bounce.set(0.5);
            kamikaze_.body.velocity.x = Math.floor(Math.random() * 151) + 50;
            kamikaze_.body.velocity.y = Math.floor(Math.random() * 151) + 50;
            kamikaze_.scale.setTo(0.3,0.3);
        }
    },

    kamikazeFollow: function(enemy) {
        enemy.rotation = game.physics.arcade.moveToObject(enemy, player, 100);
    },

    spawnEnemies: function() {
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
            ufoExplosion.play();
            score += 10;
            scoreText.text = "Score: " + score;
            explosionEnemy = explosions.getFirstExists(false);
            explosionEnemy.scale.setTo(1.2,1.2);
            explosionEnemy.reset(enemy.body.x, enemy.body.y);
            explosionEnemy.play('kaboom', 30, false, true);
        }
    },

    collisionWithUfoBullet: function(pla, bullet) {
        var explosionBullet, explosionObj;
        explosionBullet = explosions.getFirstExists(false);
        explosionBullet.scale.setTo(0.6,0.6);
        explosionBullet.reset(bullet.body.x, bullet.body.y);
        explosionBullet.play('kaboom', 50, false, true);
        bullet.kill();
        pla.damage(ufoDamage);
        health.text = "Health: " + pla.health;
        if(pla.health <= 0) {
            explosionObj = explosions.getFirstExists(false);
            explosionObj.scale.setTo(1,1);
            explosionObj.reset(pla.body.x, pla.body.y);
            explosionObj.play('kaboom', 30, false, true);
            this.endGame();
        }
    },

    collisionWithAsteroids: function(pla, asteroid) {
        var explosion;
        health.text = "Health: " + 0;
        explosion = explosions.getFirstExists(false);
        explosion.reset(pla.body.x, pla.body.y);
        explosion.play('kaboom', 30, false, true);
        pla.kill();
        this.endGame();
    },

    collisionWithKamikaze: function(pla, enemy) {
        var explosionObj, explosionEnemy;
        kamikazeExplosion.play();
        explosionEnemy = explosions.getFirstExists(false);
        explosionEnemy.reset(enemy.body.x, enemy.body.y);
        explosionEnemy.scale.setTo(0.6,0.6);
        explosionEnemy.play('kaboom', 30, false, true);
        enemy.kill();
        score -= 2;
        scoreText.text = "Score: " + score;
        pla.damage(1);   
        health.text = "Health: " + pla.health;
        if(pla.health <= 0) {
            explosionObj = explosions.getFirstExists(false);
            explosionObj.reset(pla.body.x, pla.body.y);
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
                        recordsTab.splice(10, 1);
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