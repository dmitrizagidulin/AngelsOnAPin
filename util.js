/**
 * Utility function to draw text
 * @param fontSize
 * @param fillColor
 * @param text
 * @param x
 * @param y
 */
	function drawText(fontSize, fillColor, text, x, y) {
		jaws.context.font = "bold "+fontSize+"pt courier";
		jaws.context.lineWidth = 10
		jaws.context.fillStyle =  fillColor
		jaws.context.strokeStyle =  "rgba(200, 200, 200, 0.0)"
		jaws.context.fillText(text, x, y)
	}
	
function playSoundTag(tagId) {
	var tag = document.getElementById(tagId)
	tag.currentTime = 0
	tag.play()
}
function stopSound(tagId) {
	var tag = document.getElementById(tagId)
	tag.pause()
	tag.currentTime = 0
}