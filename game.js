/**
* GameState is the actual game play. We switch to it once user choses "Start game"
*
*/
	function GameState() {
		this.setup = function() {
		}
		
		
		this.draw = function() {
			// Clear screen
			jaws.context.fillStyle = "black"
			jaws.context.fillRect(0,0,jaws.width, jaws.height)
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
			jaws.on_keydown(["down","s"],       function()  { index++; if(index >= items.length) {index=items.length-1} } )
			jaws.on_keydown(["up","w"],         function()  { index--; if(index < 0) {index=0} } )
			jaws.on_keydown(["enter","space"],  function()  {
				jaws.switchGameState(GameState)
			})
		}
		
		this.draw = function() {
			jaws.context.clearRect(0,0,jaws.width,jaws.height)

			// Draw Title
			drawText(60, "Green", "New Game", 200, 150)

		}
	}
 
/**
* Our script-entry point
*
*/
	window.onload = function() {
		jaws.start(MenuState)
	}