const Direction = {
  RIGHT: 'RIGHT',
  LEFT: 'LEFT',
  UP: 'UP',
  DOWN: 'DOWN'
};

class PlayerContainer extends Phaser.GameObjects.Container {
  constructor(scene, x, y, key, frame, health, maxHealth, id, attackAudio) {
    super(scene, x, y);
    this.scene = scene; // the scene this container will be added to
    this.velocity = 160 * 1.5; // the velocity when moving our player
    this.currentDirection = Direction.LEFT;
    this.isAttacking = false;
    this.flipX = true;
    this.swordHit = false;
    this.health = health;
    this.maxHealth = maxHealth;
    this.id = id;
    this.attackAudio = attackAudio;

    // set a size on the container
    this.setSize(64, 64);
    // enable physics
    this.scene.physics.world.enable(this);
    // collide with world bounds
    this.body.setCollideWorldBounds(true);
    // add the player container to our existing scene
    this.scene.add.existing(this);
    // have the camera follow the player
    this.scene.cameras.main.startFollow(this);

    // create the player
    this.player = new Player(this.scene, 0, 0, key, frame);
    this.add(this.player);

    this.body.setCircle(12, 20, 36);

    // create the weapon game object
    this.weapon = this.scene.add.image(40, 0, 'items', 4);
    this.scene.add.existing(this.weapon);
    this.weapon.setScale(1.5);
    this.scene.physics.world.enable(this.weapon);
    this.add(this.weapon);
    // set alpha to 0 to hide sword if player not swinging
    this.weapon.alpha = 0;

    // create player's health bar
    this.createHealthBar();
    if (DEBUG) {
      this.createCoordsText();
    }

    console.log('Player', this);
  }

  createHealthBar() {
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBar();
  }

  updateHealthBar() {
    // clear all graphics already drawn
    this.healthBar.clear();
    this.healthBar.fillStyle(0xffffff, 1);
    this.healthBar.fillRect(this.x - 32, this.y - 40, 64, 5);
    this.healthBar.fillGradientStyle(0x00ff00, 0x00ff00, 4);
    this.healthBar.fillRect(
      this.x - 32,
      this.y - 40,
      Math.max(64 * (this.health / this.maxHealth), 0),
      5
    );
  }

  updateHealth(health) {
    this.health = health;
    this.updateHealthBar();
  }

  respawn(playerObject) {
    this.health = playerObject.health;
    this.setPosition(playerObject.x * 2, playerObject.y * 2);
    this.updateHealthBar();
  }

  createCoordsText() {
    this.coordsText = this.scene.add.text(0, 0, `(${this.x},${this.y})`, {
      fontSize: '20px',
      fill: '#fff'
    });
    this.updateCoordsText();
  }

  updateCoordsText() {
    this.coordsText.setText(`(${Math.round(this.x)},${Math.round(this.y)})`);
    this.coordsText.x = this.x - 55;
    this.coordsText.y = this.y - 60;
  }

  update(cursors) {
    this.updateCoordsText();

    this.body.setVelocity(0);

    if (cursors.left.isDown) {
      this.body.setVelocityX(-this.velocity);
      this.currentDirection = Direction.LEFT;
      this.weapon.setPosition(-40, 0);
      this.player.flipX = false;
    } else if (cursors.right.isDown) {
      this.body.setVelocityX(this.velocity);
      this.currentDirection = Direction.RIGHT;
      this.weapon.setPosition(40, 0);
      this.player.flipX = true;
    }

    if (cursors.up.isDown) {
      this.body.setVelocityY(-this.velocity);
      this.currentDirection = Direction.UP;
      this.weapon.setPosition(0, -40);
    } else if (cursors.down.isDown) {
      this.body.setVelocityY(this.velocity);
      this.currentDirection = Direction.DOWN;
      this.weapon.setPosition(0, 40);
    }

    if (Phaser.Input.Keyboard.JustDown(cursors.space) && !this.isAttacking) {
      this.weapon.alpha = 1;
      this.isAttacking = true;
      this.attackAudio.play();
      this.scene.time.delayedCall(
        150,
        () => {
          this.weapon.alpha = 0;
          this.isAttacking = false;
          this.swordHit = false;
        },
        [],
        this
      );
    }

    if (this.isAttacking) {
      if (this.weapon.flipX) {
        this.weapon.angle -= 10;
      } else {
        this.weapon.angle += 10;
      }
    } else {
      if (this.currentDirection === Direction.DOWN) {
        this.weapon.setAngle(90);
      } else if (this.currentDirection === Direction.UP) {
        this.weapon.setAngle(-90);
      } else {
        this.weapon.setAngle(0);
      }

      this.weapon.flipX = false;
      if (this.currentDirection === Direction.LEFT) {
        this.weapon.flipX = true;
      }
    }

    this.updateHealthBar();
  }
}
