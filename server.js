const express = require("express");
const path = require("path");

const app = express();

app.use("/static", express.static(path.resolve(__dirname, "frontend", "static")));

app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "index.html"));
});

app.listen(process.env.PORT || 3000, () => console.log("Server running..."));

/*
	https://github.com/dcode-youtube/single-page-app-vanilla-js
	Install Node.js from https://nodejs.org/en/download
	npm init -y
	npm i express
	node server.js
	open http://localhost:3000/
*/
