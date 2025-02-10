NODE_MODULES = node_modules
# DIST_FOLDER = public/dist
SERVER_FILE = server.ts

all: install run

# install:
# 	@echo "🔧 Installing dependencies... & 🔨 Compiling TypeScript..."
# 	npm install
# 	npm install fastify @fastify/static @fastify/websocket
# 	tsc
recomp:
	docker compose down
	docker rmi pongify
	docker compose build
	docker compose up

run:
	@echo "🚀 Starting the server..."
	npm run dev

clean:
	@echo "🗑 Cleaning up..."
	rm -rf server.js public/menu.js public/game.js
	rm -rf $(NODE_MODULES)

re: clean all
	@echo "🔄 Rebuilding the project..."
