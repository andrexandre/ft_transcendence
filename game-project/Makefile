NODE_MODULES = node_modules

all: install run

down: 
	docker compose down

clean: down
	@echo "🗑 Cleaning up..."
	rm -rf server.js public/menu.js public/game.js
	rm -rf $(NODE_MODULES)

recomp: down
	docker rmi pongify
	docker compose build
	docker compose up

