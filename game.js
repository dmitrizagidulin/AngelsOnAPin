var game = {
	creatureHeight: 17,
	playerSpeed: 2,
	groundX: 200,
	groundY: 330,
	groundWidth: 450,
	groundHeight: 10
}
function Creature(options) {
	this.x = options.x
	this.y = options.y
	this.height = game.creatureHeight
	this.my_rect = new jaws.Rect(this.x, this.y, this.height, this.height);
	this.speed = 1
}
Creature.prototype.move = function(dxdy) {
	dx = dxdy.x * this.speed
	dy = dxdy.y * this.speed
	this.rect().move(dx, dy);
}
Creature.prototype.rect = function() {
	return this.my_rect;
}

function Player(options) {
	options.x = game.groundX + 10
	options.y = game.groundY

	Creature.call(this, options) // Use parent's constructor

	this.speed = options.speed
	
	
	this.draw = function() {
		drawText(20, 'White', 'A', this.rect().x, this.rect().y)
	}
}
Object.extend(Player, Creature)

function Enemy(options) {

	Creature.call(this, options) // Use parent's constructor

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
Object.extend(Enemy, Creature)

/**
 * GameState is the actual game play. We switch to it once user choses "Start game"
 *
 */

function GameState() {
	this.setup = function() {
		jaws.on_keydown("esc", function() {
			jaws.switchGameState(MenuState)
		})
		
		game.player = new Player({
			x : 20,
			y : 20,
			speed: game.playerSpeed
		})
	}

	this.draw = function() {
		// Clear screen
		jaws.context.fillStyle = "black"
		jaws.context.fillRect(0, 0, jaws.width, jaws.height)

		this.drawGround()
		game.player.draw()
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