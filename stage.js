function Enemy(options) {
	options.x += game.groundX
	options.y = game.groundY - 25
	options.width = 50
	options.height = 48
	Thing.call(this, options) // Use parent's constructor
	this._name = 'Enemy Angel'
	this.touchDamage = 1
	this.isEnemy = true
	this.speed = 1

	this.sprite = new jaws.Sprite({
		image : "angel3_50.png",
		x : options.x,
		y : options.y,
		anchor : "center"
	});

	this.collision = false
}
Object.extend(Enemy, Thing)

Enemy.prototype.damageTo = function(thing) {
	var damage = 0
	if (thing.isPlayer) {
		damage = this.touchDamage
	}
	return damage
}

Enemy.prototype.draw = function() {
	// drawText(20, 'Red', 'A', this.rect().x, this.rect().bottom)
	this.sprite.draw()
	var txt = 'Pride: ' + this.hp
	drawText(8, 'Red', txt, this.rect().x + 3, this.rect().y - 2)
}

Enemy.prototype.doCollideWith = function(thing) {
	if (thing.damageTo) {
		damage = thing.damageTo(this)
	} else {
		damage = 0
	}
	this.takeDamageFrom(damage, thing)
	this.collision = true
}
Enemy.prototype.isAlive = function() {
	return this.hp > 0
}
Enemy.prototype.move = function(dxdy) {
	dx = dxdy.x * this.speed
	dy = dxdy.y * this.speed
	this.sprite.move(dx, dy);
}
Enemy.prototype.rect = function() {
	return this.sprite.rect()
}
Enemy.prototype.update = function() {
	dxdy = direction_keys['left']
	this.move(dxdy)
}

function Stage(id, data, stageList) {
	this.id = id
	this.bossName = data.boss_name
	this.cleared = false
	this.data = data
	this.totalLevels = 0
	this.level = 1
	this.stageList = stageList
	
	// Initialize the number of total levels
	for(i in data.levels) {
		this.totalLevels++
	}
	
	this.currentLevel = function() {
		return this.level
	}
	
	this.enemyList = function() {
		return this.levelData().enemies
	}
	
	this.enemies = function() {
		enemies = new jaws.SpriteList()
		enemyList = this.enemyList()
		for(i in enemyList) {
			enemyId = enemyList[i]
//			enemy = new Enemy(enemyId)
			enemy = new Enemy({
				x : 300,
				hp : 3
			})
//			sprite = enemy.getSprite()	
			enemies.push(enemy)
		}
		return enemies
	}
	
	this.isCleared = function() {
		return this.cleared
	}
	
	this.levelData = function() {
		return this.data.levels[this.level]
	}
	
	this.nextLevelMarkCleared = function() {
		
		if(this.level >= this.totalLevels) {
			this.stageMarkCleared()
		} else {
			this.level += 1
		}
	}
	
	this.stageMarkCleared = function() {
		this.cleared = true
		this.stageList.currentStageMarkCleared()
	}
}

function StageList() {
	this.currentStageIdx = 0
	this.stages = {
		1: 'One',
		2: 'Two'
	}
	this.stageData = {
		'One':{
			'levels':{
				1: {
					'enemies': ['red_angel']
				}
			}
		},
		'Two':{
			'levels':{
				1: {
					'enemies': ['red_angel']
				}
			}
		}
	}
	this.currentStageObj = null
	this.stagesCleared = {}

	this.currentBossName = function() {
		stageKey = this.currentStageId()
		bossName = this.stageData[stageKey]['boss_name']
		return bossName
	}
	
	this.currentStage = function() {
		return this.currentStageObj
	}
	
	this.currentStageId = function() {
		return this.stages[this.currentStageIdx]
	}
	
	this.currentStageMarkCleared = function() {
		this.stagesCleared[this.currentStageId()] = 1
	}
	
	this.initAssets = function() {

	}
	
	this.isStageCleared = function(stageId) {
		return this.stagesCleared[stageId] == 1
	}
	
	this.nextStage = function() {
		this.currentStageIdx++
		stageId = this.currentStageId()
		if(stageId) {
			stageData = this.stageData[stageId]
			this.currentStageObj = new Stage(stageId, stageData, this)
			return true
		} else {
			this.currentStageObj = null
			return false
		}
	}
	
	this.resetStages = function() {
		this.currentStageIdx = 0
		this.currentStageObj = null
		this.stagesCleared = {}
	}
	
/**
 * Player has made a selection from the Stage Select screen
 */
	this.selectStage = function(index) {
		this.currentStageIdx = index
		stageId = this.currentStageId()
		stageData = this.stageData[stageId]
		this.currentStageObj = new Stage(stageId, stageData, this)
	}
	
	this.allStages = function() {
		stageKeys = []
		for(i in this.stages) {
			stageKeys.push(this.stages[i])
		}
		return stageKeys
	}

	this.allStagesClear = function() {
		var cleared = true
		var stageId = null
		for(i in this.stages) {
			stageId = this.stages[i]
			if(!stageList.stagesCleared[stageId]) {
				cleared = false
			}
		}
		return cleared
	}
}
