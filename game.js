
var game = {
	creatureHeight: 17,
	playerSpeed: 2,
	groundX: 200,
	groundY: 310,
	groundWidth: 490,
	groundHeight: 10,
	gameAreaMinX: 10,
	gameAreaMaxX: 890,
	gameAreaMinY: 10,
	gameAreaMaxY: 490,
	gravity: 0.06
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
	this.hp = options.hp || 0
	
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
	if(this.sprite) {
		this.sprite.rect().draw()
	} else {
		jaws.context.strokeStyle = "white"
		jaws.context.lineWidth = 1
		jaws.context.strokeRect(this.rect().x, this.rect().y, this.rect().width,
				this.rect().height)
	}
}
Thing.prototype.move = function(dxdy) {
	dx = dxdy.x * this.speed
	dy = dxdy.y * this.speed
	if(this.sprite) {
		this.sprite.move(dx, dy)
	} else {
		this.rect().move(dx, dy);
	}
}
Thing.prototype.rect = function() {
	if(this.sprite) {
		return this.sprite.rect()
	} else {
		return this.my_rect;
	}
}
Thing.prototype.takeDamageFrom = function(damage, thing) {
	this.hp -= damage
	console.log('Took '+damage+' damage!')
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
	this.damage = options.damage
}
Object.extend(Projectile, Thing)

Projectile.prototype.doCollideWith = function(thing) {
	this.collision = true
}
Projectile.prototype.damageTo = function(thing) {
	var damage = 0
	if(thing.isEnemy) {
		damage = this.damage
	}
	return damage
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
	if(this.sprite) {
		this.sprite.move(this.speed_vector.x, this.speed_vector.y)
	} else {
		this.rect().move(this.speed_vector.x, this.speed_vector.y)
	}
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
function Seal(options) {
	options.height = 49
	options.width = 49  // sprite 
	options.y = game.ground.rect().y - options.height - 1
	this.sprite = new jaws.Sprite({image: "seal1.png", x: options.x, y: options.y});
	Projectile.call(this, options)
	this.draw = function() {
//		drawText(20, 'White', '*', this.rect().x - 2, this.rect().bottom + 5)
		this.sprite.draw()
	}
}
Object.extend(Seal, Projectile)

function Dash(options) {
	options.height = 4
	options.width = 14
	Projectile.call(this, options)
	this.draw = function() {
		drawText(20, 'Teal', '-', this.rect().x - 1, this.rect().bottom + 5)
	}
}
Object.extend(Dash, Projectile)

function Ex(options) {
	options.height = 4
	options.width = 14
	Projectile.call(this, options)
	this.draw = function() {
		drawText(20, 'Pink', 'x', this.rect().x - 1, this.rect().bottom + 5)
	}
}
Object.extend(Ex, Projectile)

function Weapon(options) {
	this.speed = options.speed
	this.range = options.range
	this.cooldown = options.cooldown
	this.projectileType = options.projectileType
	this.affectedByGravity = options.affectedByGravity
	this.damage = options.damage
	this.speed = 1
	
	this.projectile = function(owner) {
		var projectile = new this.projectileType({
			x : owner.rect().right - (owner.rect().width / 2),
//			y : owner.y,
			speed_vector: {x: this.speed, y: -4},
			affectedByGravity: this.affectedByGravity,
			damage: this.damage,
			range: 600 //this.range
		})
		return projectile
	}
}

var allWeapons = {
	SealWeapon : new Weapon({
		speed : 2,
		range : 50,
		damage: 1,
		cooldown : 300,
		affectedByGravity: true,
		projectileType : Seal
	}),
	DashWeapon : new Weapon({
		speed : 3,
		range : 500,
		cooldown : 300,
		affectedByGravity: true,
		projectileType : Dash
	}),
	ExWeapon : new Weapon({
		speed : 3,
		range : 10000,
		cooldown : 300,
		affectedByGravity: false,
		ricochets: true,
		projectileType : Ex
	})
}

function Player(options) {
	options.x += game.groundX
	options.y = game.groundY - 25 
	options.width = 50
	options.height = 51
	Thing.call(this, options) // Use parent's constructor

	this.sprite = new jaws.Sprite({image: "angel2_50.png", x: options.x, y: options.y,
		anchor: "center"});
	
	this.speed = options.speed
}
Object.extend(Player, Thing)
Player.prototype.draw = function() {
//		drawText(20, 'White', 'A', this.rect().x, this.rect().bottom)
		this.sprite.draw()
		var txt = 'Hp: '+this.hp
		drawText(8, 'White', txt, this.rect().x + 10, this.rect().y - 2)
}
Player.prototype.move = function(dxdy) {
	dx = dxdy.x * this.speed
	dy = dxdy.y * this.speed
	this.sprite.move(dx, dy);
}
Player.prototype.rect = function() {
	return this.sprite.rect()
}

function Enemy(options) {
	options.x += game.groundX
	options.y = game.groundY - 25
	options.width = 50
	options.height = 48
	Thing.call(this, options) // Use parent's constructor
	
	this.sprite = new jaws.Sprite({image: "angel3_50.png", x: options.x, y: options.y,
		anchor: "center"});
	
	this.collision = false
	
	this.draw = function() {
//		drawText(20, 'Red', 'A', this.rect().x, this.rect().bottom)
		this.sprite.draw()
		var txt = 'Hp: '+this.hp
		drawText(8, 'Red', txt, this.rect().x + 10, this.rect().y - 2)
	}
}
Object.extend(Enemy, Thing)

Enemy.prototype.name = function() {
	return 'Enemy Angel';
}
Enemy.prototype.isEnemy = true

Enemy.prototype.move = function(dxdy) {
	dx = dxdy.x * this.speed
	dy = dxdy.y * this.speed
	this.sprite.move(dx, dy);
}
Enemy.prototype.rect = function() {
	return this.sprite.rect()
}
Enemy.prototype.doCollideWith = function(thing) {
	if(thing.damageTo) {
		damage = thing.damageTo(this)
	} else {
		damage = 0
	}
	this.takeDamageFrom(damage, thing)
	this.collision = true
}

Enemy.prototype.isAlive = function() {
	return this.hp > 0
//	return !this.collision
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
	
	var background = new jaws.Sprite({image: "background2.png", x: 0, y: 0})
	
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
		game.player.weapon = allWeapons.SealWeapon
		
		enemy = new Enemy({
			x: 300,
			hp: 3
		})
		enemies.push(enemy)
	}

	this.draw = function() {
		// Clear screen
		jaws.context.fillStyle = "#011451"
		jaws.context.fillRect(0, 0, jaws.width, jaws.height)
//		jaws.context.globalAlpha = 0.25
		background.draw()
//		jaws.context.globalAlpha = 1
		
		this.drawGround()
		game.player.draw()
		enemies.draw()
		playerProjectiles.draw()
	}

	this.drawGround = function() {
		jaws.context.strokeStyle = "white"
		jaws.context.fillStyle = "blue"
		jaws.context.lineWidth = 1
//		jaws.context.fillRect(game.ground.x, game.ground.y, game.ground.width, game.ground.height)
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
		drawText(45, "Black", "Angels on a Pin", 150, 150)

	}
}

function initAssets() {
	jaws.assets.add("background2.png")
	jaws.assets.add("seal1.png")
	jaws.assets.add("angel2_50.png")
	jaws.assets.add("angel3_50.png")
}

/**
 * Our script-entry point
 *
 */
window.onload = function() {
	initAssets()
	jaws.start(MenuState)
}