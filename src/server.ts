import express from "express";
import fs from "fs/promises"; // Using fs/promises for the Promise-based fs module
import http from "http";
import { EOL, networkInterfaces } from "os";
import path from "path";
import { Server as SocketIOServer } from "socket.io";

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
  
	const folderPath = path.join(__dirname, "errors");
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

app.get("/:templateName?", async (req, res) => {
	const { templateName } = req.params;
	if(!templateName) {
		const indexPath = path.join(__dirname, "index.html");
		res.send(await fs.readFile(indexPath, "utf8"));

		return;
	}

	const templatePath = path.join(__dirname, "templates", `${templateName}.html`);
	try {
		console.log(templatePath);
		await fs.access(templatePath);
		const content = await fs.readFile(templatePath, "utf8");
		res.send(content);
	} catch {
		res.status(404).send("Not found");
	}
});

io.on("connection", async (socket) => {
	const templatePath = path.join(__dirname, "templates");
	const files = await fs.readdir(templatePath);
	const templates = files.filter(file => path.extname(file) === ".html").map(f => f.replace(".html", ""));

	const state = {
		templates,
		gamepads: [1,2,3]
	};
	socket.emit("info", state);
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