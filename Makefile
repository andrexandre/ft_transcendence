END			:= \033[0m
RED			:= \033[1;31m
GREEN		:= \033[1;32m
YELLOW		:= \033[1;33m
BLUE		:= \033[1;34m
MAGENTA		:= \033[1;35m
CYAN		:= \033[1;36m
WHITE		:= \033[1;37m

build-up: backend/services-api/.env
	docker compose up --build

build:
	docker compose build 

up:
	docker compose up

upd:
	docker compose up -d

down:
	-docker compose down -v

status:
	@echo "$(GREEN)Containers status$(END)\n"
	@docker ps -a
	@echo "\n$(GREEN)Images status$(END)\n"
	@docker image ls
	@echo
	@echo "\n$(GREEN)Volume status$(END)\n"
	@docker volume ls
	@echo
	@echo "\n$(GREEN)Network status$(END)\n"
	@docker network ls
	@echo

backend/services-api/.env:
	curl -s https://gist.githubusercontent.com/andrexandre/8c011820a35117d005016151cfd46207/raw/83a0d67fbf775a78355dd617e6502d9c03f496ad/.env > backend/services-api/.env

destroy: down
	find . -type f -iname '*.db' -delete
	find . -type f -iname '*.jsonl' -delete

rm-node_modules: rmi
	docker run --rm -v ./backend/user/userManagement/node_modules:/folder_to_rm busybox rm -rf '/folder_to_rm' 2>/dev/null ; true
	docker run --rm -v ./backend/Gateway/node_modules:/folder_to_rm busybox rm -rf '/folder_to_rm' 2>/dev/null ; true
	docker run --rm -v ./game-project/node_modules:/folder_to_rm busybox rm -rf '/folder_to_rm' 2>/dev/null ; true
	docker run --rm -v ./chat/node_modules:/folder_to_rm busybox rm -rf '/folder_to_rm' 2>/dev/null ; true
	docker run --rm -v ./frontend/node_modules:/folder_to_rm busybox rm -rf '/folder_to_rm' 2>/dev/null ; true
	find . -type d -iname 'node_modules' -delete

rmi:
	-docker rmi -f $$(docker images -a -q)

rmv:
	docker volume rm $$(docker volume ls -q)

DB-PATH = backend/user/userManagement/user.db

DB-NAME = users

frontend/node_modules:
	cd frontend ; npm install

server-up: frontend/node_modules
	cd frontend ; npx vite --host 127.0.0.1 --port 5500

server-upd: frontend/node_modules
	cd frontend ; npx vite --host 127.0.0.1 --port 5500 &

server-down:
	pkill -2 -f '/.bin/vite'

db-clean:
	sqlite3 $(DB-PATH) "delete from $(DB-NAME);"

list-users:
	sqlite3 $(DB-PATH) "select * from $(DB-NAME);"

USER = as

rm-user:
	sqlite3 $(DB-PATH) 'delete from $(DB-NAME) where username = "$(USER)";'




# this is used to clean up the whole docker ecosystem
system-prune:
	-docker stop $$(docker ps -qa)
	-docker system prune -f -a --volumes

# this is useful when root permissions are required to delete files
# note: this removes the contents of the specified folder
rm-rf:
	docker pull public.ecr.aws/docker/library/busybox:stable
	@read -p "rm -rf $$PWD/" folder;\
	docker run --rm -v ./$$folder:/folder_to_rm busybox rm -rf '/folder_to_rm' 2>/dev/null ; true


# mc speed commands
guser:
	docker exec pongify sqlite3 -header -column /pong_vol/game-project/db_game.db "SELECT * FROM users;"
ggame:
	docker exec pongify sqlite3 -header -column /pong_vol/game-project/db_game.db "SELECT * FROM games;"



alex:
#	docker compose build user_management
	docker compose up user_management