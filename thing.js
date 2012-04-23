function Thing(options) {
	this.x = options.x
	this.y = options.y
	this.height = options.height
	this.width = options.width
	this.hp = options.hp || 0

	if (!this.height) {
		this.height = game.creatureHeight
	}
	if (!this.width) {
		this.width = this.height
	}
	this.my_rect = new jaws.Rect(this.x, this.y, this.width, this.height);
	this.speed = 0
}
Thing.prototype.drawRect = function() {
	if (this.sprite) {
		this.sprite.rect().draw()
	} else {
		jaws.context.strokeStyle = "white"
		jaws.context.lineWidth = 1
		jaws.context.strokeRect(this.rect().x, this.rect().y,
				this.rect().width, this.rect().height)
	}
}
Thing.prototype.knockBack = function(dx) {
	if(this.rect().x > game.gameAreaMinX) { 
		this.move({
			x : -dx,
			y : 0
		})
	}
}
Thing.prototype.move = function(dxdy) {
	dx = dxdy.x * this.speed
	dy = dxdy.y * this.speed
	if (this.sprite) {
		this.sprite.move(dx, dy)
	} else {
		this.rect().move(dx, dy);
	}
}
Thing.prototype.name = function() {
	return this._name || 'Thing';
}
Thing.prototype.rect = function() {
	if (this.sprite) {
		return this.sprite.rect()
	} else {
		return this.my_rect;
	}
}
Thing.prototype.takeDamageFrom = function(damage, thing) {
	this.hp -= damage
	console.log('Took ' + damage + ' damage!')
}
Thing.isDead = function(item) {
	return !item.isAlive()
}