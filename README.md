# Gamepad Streamer
Gamepad Streamer is a specialized tool for streamers who operate on separate PCs for gaming and streaming. It serves to bridge the divide, enabling live display of gamepad inputs during a stream, even from a different computer. 
The application leverages the [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API) through a browser instance created locally with [Puppeteer](https://github.com/puppeteer/puppeteer) and 
uses [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) to stream the GamepadAPI state to client browsers, which then display the inputs on their pages.
It integrates seamlessly with streaming software for live gamepad input showcasing.

# Note
This tool is intended for setups where gameplay and streaming occur on separate PCs. For single PC setups, consider using [Gamepad Viewer](https://gamepadviewer.com/).

# Usage
1. [Download the latest release.](https://github.com/ZBAGI/gamepad-streamer/releases)
2. Run the executable suitable for your operating system.
3. The console will display suggested URLs that you can visit on other devices within your network. Visit the indicated page and follow the instructions provided.

# Screenshoots
![image](https://github.com/ZBAGI/gamepad-streamer/assets/26273080/9993b928-d0ab-4a16-bd1d-bbfddd49be2c)

![image](https://github.com/ZBAGI/gamepad-streamer/assets/26273080/d8e48095-308b-4b60-b0be-969fd903273b)

![image](https://github.com/ZBAGI/gamepad-streamer/assets/26273080/96219c85-9e04-41cf-8526-bdbc97649d90)
