var game = {
	creatureHeight: 17,
	playerSpeed: 2,
	groundX: 200,
	groundY: 330,
	groundWidth: 450,
	groundHeight: 10,
	gameAreaMinX: 10,
	gameAreaMaxX: 890,
	gameAreaMinY: 10,
	gameAreaMaxY: 490,
	gravity: 0.01
}
game.ground = new Thing({x: game.groundX, y: game.groundY, width: game.groundWidth, height: game.groundHeight})

var direction_keys = {
		left : {
			x : -1,
			y : 0
		},
		right : {
			x : 1,
			y : 0
		},
		up : {
			x : 0,
			y : -1
		},
		down : {
			x : 0,
			y : 1
		}
}

function isOutsideCanvas(item) {
	return (item.x < game.gameAreaMinX || item.y < game.gameAreaMinY
			|| item.x > game.gameAreaMaxX || item.y > game.gameAreaMaxY)
}

function Thing(options) {
	this.x = options.x
	this.y = options.y
	this.height = options.height
	this.width = options.width
	
	if(!this.height) {
		this.height = game.creatureHeight
	}
	if(!this.width) {
		this.width = this.height
	}
	this.my_rect = new jaws.Rect(this.x, this.y, this.width, this.height);
	this.speed = 0
}
Thing.prototype.drawRect = function() {
	jaws.context.strokeStyle = "white"
	jaws.context.lineWidth = 1
	jaws.context.strokeRect(this.rect().x, this.rect().y, this.rect().width,
			this.rect().height)
}

Thing.prototype.move = function(dxdy) {
	dx = dxdy.x * this.speed
	dy = dxdy.y * this.speed
	this.rect().move(dx, dy);
}
Thing.prototype.rect = function() {
	return this.my_rect;
}
Thing.isDead = function(item) {
	return !item.isAlive()
}

function Projectile(options) {
	Thing.call(this, options) // Use parent's constructor
	this.startX = options.x
	this.startY = options.y
	this.speed_vector = options.speed_vector
	this.range = options.range
	this.affectedByGravity = options.affectedByGravity
	this.collision = false
}
Object.extend(Projectile, Thing)

Projectile.prototype.doCollideWith = function(thing) {
	this.collision = true
}

Projectile.prototype.hasHitGround = function() {
	hasHitGround = jaws.collideOneWithOne(this, game.ground)
	return hasHitGround
}

Projectile.prototype.isAlive = function() {
	return !this.collision
}
Projectile.prototype.isInRange = function() {
	return this.rect().x < (this.startX + this.range)
}
Projectile.prototype.move = function() {
	if(this.affectedByGravity) {
		this.speed_vector.y += game.gravity
	}
	this.rect().move(this.speed_vector.x, this.speed_vector.y)
//	this.rect().x += this.speed_vector.x
//	this.rect().y += this.speed_vector.y
}
Projectile.prototype.update = function() {
	this.move()
}

Projectile.isOutsideRange = function(item) {
	isOutsideRange = !item.isInRange() || item.hasHitGround()
	return isOutsideRange
}
function Star(options) {
	options.height = 13
	options.width = 13
	Projectile.call(this, options)
	this.draw = function() {
		drawText(20, 'White', '*', this.rect().x - 2, this.rect().bottom + 5)
	}
}
Object.extend(Star, Projectile)

function Dash(options) {
	options.height = 4
	options.width = 14
	Projectile.call(this, options)
	this.draw = function() {
		drawText(20, 'Teal', '-', this.rect().x - 1, this.rect().bottom + 5)
	}
}
Object.extend(Dash, Projectile)


function Weapon(options) {
	this.speed = options.speed
	this.range = options.range
	this.cooldown = options.cooldown
	this.projectileType = options.projectileType
	this.affectedByGravity = options.affectedByGravity
	
	this.projectile = function(owner) {
		var projectile = new this.projectileType({
			x : owner.rect().right,
			y : owner.y,
			speed_vector: {x: this.speed, y: 0},
			affectedByGravity: this.affectedByGravity,
			range: this.range
		})
		return projectile
	}
}

var allWeapons = {
	StarWeapon : new Weapon({
		speed : 2,
		range : 50,
		cooldown : 300,
		affectedByGravity: false,
		projectileType : Star
	}),
	DashWeapon : new Weapon({
		speed : 3,
		range : 500,
		cooldown : 300,
		affectedByGravity: true,
		projectileType : Dash
	})
}

function Player(options) {
	options.x += game.groundX
	options.y = game.groundY - (game.groundHeight * 2) + 1

	Thing.call(this, options) // Use parent's constructor

	this.speed = options.speed
	
	this.draw = function() {
		drawText(20, 'White', 'A', this.rect().x, this.rect().bottom)
	}
}
Object.extend(Player, Thing)

function Enemy(options) {
	options.x += game.groundX
	options.y = game.groundY - (game.groundHeight * 2) + 1
	Thing.call(this, options) // Use parent's constructor
	
	this.collision = false
	
	this.draw = function() {
		drawText(20, 'Red', 'A', this.rect().x, this.rect().bottom)
	}
}
Object.extend(Enemy, Thing)

Enemy.prototype.doCollideWith = function(thing) {
	this.collision = true
}

Enemy.prototype.isAlive = function() {
	return !this.collision
}

/**
 * GameState is the actual game play. We switch to it once user choses "Start game"
 *
 */
function GameState() {
	var playerProjectiles = new jaws.SpriteList()
	var enemies = new jaws.SpriteList()
//	var test = new Star({
//		x : 100,
//		y : 100,
//		speed_vector: {x: 2, y: 0},
//		affectedByGravity: false,
//		range: 30
//	})
	
	this.setup = function() {
		jaws.on_keydown("esc", function() {
			jaws.switchGameState(MenuState)
		})
		jaws.preventDefaultKeys(["left", "right", "space"])
		
		game.player = new Player({
			x : 20,
			speed: game.playerSpeed
		})
		game.player.can_fire = true
		game.player.weapon = allWeapons.StarWeapon
		
		enemy = new Enemy({
			x: 300
		})
		enemies.push(enemy)
	}

	this.draw = function() {
		// Clear screen
		jaws.context.fillStyle = "black"
		jaws.context.fillRect(0, 0, jaws.width, jaws.height)

		this.drawGround()
		game.player.draw()
		enemies.draw()
		playerProjectiles.draw()
	}

	this.drawGround = function() {
		jaws.context.strokeStyle = "white"
		jaws.context.fillStyle = "blue"
		jaws.context.lineWidth = 1
		jaws.context.fillRect(game.ground.x, game.ground.y, game.ground.width, game.ground.height)
		jaws.context.strokeRect(game.ground.x, game.ground.y, game.ground.width, game.ground.height)
	}
	
	this.update = function() {
		var player = game.player
		var dxdy
		if (jaws.pressed("left")) {
			dxdy = direction_keys['left']
			player.move(dxdy)
		}
		if (jaws.pressed("right")) {
			dxdy = direction_keys['right']
			player.move(dxdy)
		}
		if (jaws.pressed("space")) {
			if(player.can_fire) {
				bullet = player.weapon.projectile(player)
				playerProjectiles.push(bullet)
				player.can_fire = false
				setTimeout(function() { game.player.can_fire = true }, game.player.weapon.cooldown)
			}
		}
		playerProjectiles.update()
		playerProjectiles.removeIf(Projectile.isOutsideRange)
		
//		jaws.collideOneWithMany(game.ground, playerProjectiles).forEach( function(bullet) {
////				bullet.doCollideWith(game.ground)
//		})
		jaws.collideManyWithMany(playerProjectiles, enemies).forEach( function(pair, index) {
			bullet = pair[0]
			enemy = pair[1]
			bullet.doCollideWith(enemy)
			enemy.doCollideWith(bullet)
		});
		playerProjectiles.removeIf(Thing.isDead)
		enemies.removeIf(Thing.isDead)
	}
}

/**
 * Start menu
 *
 */
function MenuState() {
	this.setup = function() {
		index = 0
		jaws.on_keydown([ "down", "s" ], function() {
			index++;
			if (index >= items.length) {
				index = items.length - 1
			}
		})
		jaws.on_keydown([ "up", "w" ], function() {
			index--;
			if (index < 0) {
				index = 0
			}
		})
		jaws.on_keydown([ "enter", "space" ], function() {
			jaws.switchGameState(GameState)
		})
	}

	this.draw = function() {
		jaws.context.clearRect(0, 0, jaws.width, jaws.height)

		// Draw Title
		drawText(60, "Black", "New Game", 200, 150)

	}
}

/**
 * Our script-entry point
 *
 */
window.onload = function() {
	jaws.start(MenuState)
}