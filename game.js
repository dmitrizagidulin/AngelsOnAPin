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
	gameAreaMaxY: 490
}
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
	this.height = game.creatureHeight
	this.my_rect = new jaws.Rect(this.x, this.y, this.height, this.height);
	this.speed = 1
}
Thing.prototype.move = function(dxdy) {
	dx = dxdy.x * this.speed
	dy = dxdy.y * this.speed
	this.rect().move(dx, dy);
}
Thing.prototype.rect = function() {
	return this.my_rect;
}

function Projectile(options) {
	Thing.call(this, options) // Use parent's constructor
	this.startX = options.x
	this.startY = options.y
	this.speed = options.speed
	this.range = options.range
}
Object.extend(Projectile, Thing)

Projectile.prototype.isInRange = function() {
	return this.rect().x < (this.startX + this.range)
}

Projectile.isOutsideRange = function(item) {
	return !item.isInRange()
}

function Star(options) {
	Projectile.call(this, options)
	this.draw = function() {
		drawText(20, 'White', '*', this.rect().x, this.rect().y)
	}
	this.update = function() {
		dxdy = direction_keys['right']
		this.move(dxdy)
	}
}
Object.extend(Star, Projectile)

function Dash(options) {
	options.y -= 4  // Nudge the height of the dash slightly upward
	Projectile.call(this, options)
	this.draw = function() {
		drawText(20, 'Teal', '-', this.rect().x, this.rect().y)
	}
	this.update = function() {
		dxdy = direction_keys['right']
		this.move(dxdy)
	}
}
Object.extend(Dash, Projectile)


function Weapon(options) {
	this.speed = options.speed
	this.range = options.range
	this.cooldown = options.cooldown
	this.projectileType = options.projectileType
	
	this.projectile = function(owner) {
		var projectile = new this.projectileType({
			x : owner.rect().right,
			y : owner.y,
			speed: this.speed,
			range: this.range
		})
		projectile.collision = false
		return projectile
	}
}

var allWeapons = {
	StarWeapon: new Weapon({speed: 2, range: 50, cooldown: 300, projectileType: Star}),
	DashWeapon: new Weapon({speed: 3, range: 500, cooldown: 300, projectileType: Dash})
}

function Player(options) {
	options.x = game.groundX + 10
	options.y = game.groundY

	Thing.call(this, options) // Use parent's constructor

	this.speed = options.speed
	
	this.draw = function() {
		drawText(20, 'White', 'A', this.rect().x, this.rect().y)
	}
}
Object.extend(Player, Thing)

function Enemy(options) {

	Thing.call(this, options) // Use parent's constructor

	this.draw = function() {
		drawText(17, 'Red', 'A', this.rect().x, this.rect().y)
		// draw collision rect
		square_side = this.height
		jaws.context.lineWidth = 0.5
		jaws.context.strokeStyle = "gray"
		jaws.context.strokeRect(this.rect().x, this.rect().y - this.height,
				square_side, square_side)
	}
}
Object.extend(Enemy, Thing)

/**
 * GameState is the actual game play. We switch to it once user choses "Start game"
 *
 */

function GameState() {
	var playerProjectiles = new jaws.SpriteList()
	
	this.setup = function() {
		jaws.on_keydown("esc", function() {
			jaws.switchGameState(MenuState)
		})
		jaws.preventDefaultKeys(["left", "right", "space"])
		
		game.player = new Player({
			x : 20,
			y : 20,
			speed: game.playerSpeed
		})
		game.player.can_fire = true
		game.player.weapon = allWeapons.DashWeapon
	}

	this.draw = function() {
		// Clear screen
		jaws.context.fillStyle = "black"
		jaws.context.fillRect(0, 0, jaws.width, jaws.height)

		this.drawGround()
		game.player.draw()
		playerProjectiles.draw()
	}

	this.drawGround = function() {
		var x = game.groundX
		var y = game.groundY
		var height = game.groundHeight
		var width = game.groundWidth

		jaws.context.strokeStyle = "white"
		jaws.context.fillStyle = "blue"
		jaws.context.lineWidth = 1
		jaws.context.fillRect(x, y, width, height)
		jaws.context.strokeRect(x, y, width, height)
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