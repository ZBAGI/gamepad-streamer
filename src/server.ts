import express from "express";
import fs from "fs/promises"; // Using fs/promises for the Promise-based fs module
import http from "http";
import { EOL, networkInterfaces } from "os";
import path from "path";
import puppeteer from "puppeteer";
import { Server as SocketIOServer } from "socket.io";

const basePath = (<any>process).pkg ? path.dirname(process.execPath) : __dirname;

function getLocalNetworks(): { name: string, ip: string }[] {
	const interfaces = networkInterfaces();
	const networks = [];
	for (const devName in interfaces) {
		const iface = interfaces[devName];
		if (!iface) continue;

		for (let index = 0; index < iface.length; index++) {
			const alias = iface[index];
			if (alias.family === "IPv4" && !alias.internal)
				networks.push({ name: devName, ip: alias.address });
		}
	}
	return networks;
}

process.on("uncaughtException", async (e) => {
	const dateString = (new Date()).toISOString().replace(/[:T-]/g, "_").split(".")[0];
	const crashFilename = `crash_${dateString}.txt`;
  
	const folderPath = path.join(basePath, "errors");
	const filePath = path.join(folderPath, crashFilename);
  
	try {
		await fs.mkdir(folderPath, { recursive: true });
		await fs.writeFile(filePath, `${e.name}${EOL}${e.message}${EOL}${EOL}${e.stack}`);
	} catch (error) {
		console.error("Error while saving the file:", error);
	}

	console.error(e);
	process.stdin.resume();
});

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

app.use(express.static(path.join(basePath, "templates", "assets")));

app.get("/:templateName?", async (req, res) => {
	const { templateName } = req.params;
	if(!templateName) {
		const indexPath = path.join(__dirname, "index.html");
		res.send(await fs.readFile(indexPath, "utf8"));

		return;
	}

	const templatePath = path.join(basePath, "templates", `${templateName}.html`);
	try {
		await fs.access(templatePath);
		const content = await fs.readFile(templatePath, "utf8");
		res.send(content);
	} catch {
		res.status(404).send("Not found");
	}
});

io.on("connection", async (socket) => {
	const templatePath = path.join(basePath, "templates");
	const files = await fs.readdir(templatePath);
	const templates = files.filter(file => path.extname(file) === ".html").map(f => f.replace(".html", ""));

	socket.emit("templates", templates);
});

server.listen(3136, () => {
	console.log("Gamepad stream v1.0");
	console.log("Server started on port 3136.");
	
	const localNetworks = getLocalNetworks();
	if(localNetworks.length > 0) {
		console.log("");
		console.log("You can reach it on local network via");

		localNetworks.forEach(network => {
			console.log(`- ${network.name}: http://${network.ip}:3136`);
		});
	}
});

async function startGamepadMonitoring() {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.exposeFunction("updateState", (state: any[]) => {
		io.emit("state", state.filter(gamepad => gamepad != null));
	});

	await page.evaluate(() => {
		setInterval(() => {
			const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
			// Clone state in order to pass it into node context
			const state = Array.from(gamepads).map(gamepad => {
				return gamepad ? {
					id: gamepad.id,
					index: gamepad.index,
					buttons: gamepad.buttons.map(button => ({
						pressed: button.pressed,
						value: button.value
					})),
					axes: gamepad.axes.slice()
				} : null;
			});
			(window as any).updateState(state);
		}, 50);
	});
}

startGamepadMonitoring();