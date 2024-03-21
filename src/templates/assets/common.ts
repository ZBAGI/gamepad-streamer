function updateDisplayLayer(displayLayer: (Element | null | ((value: number) => void))[]): ((state: (Gamepad | null)[]) => void) {
	const gamepadIndex = getGamepadIndex();

	return (state: (Gamepad | null)[]) => {
		const gamepad = state[gamepadIndex];
		if(!gamepad)
			return; // disconnected

		displayLayer.forEach((button, index) => {
			if(typeof button == "function") 
				button(gamepad.buttons[index].value);
			else
				button?.classList.toggle("pressed", gamepad.buttons[index]?.pressed);
		});
	}
}

function getGamepadIndex(): number {
	const urlParams = new URLSearchParams(window.location.search);
	return Number.parseInt(urlParams.get("gamepad") ?? "0");
}