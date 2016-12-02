var game = new Phaser.Game(900, 600, Phaser.AUTO, '');

game.state.add('Menu', Menu);
game.state.add('Records', Records);
game.state.add('Game', Game);
game.state.add('GameOver', GameOver);

game.state.start('Menu');