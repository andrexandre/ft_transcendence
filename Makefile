END			:= \033[0m
RED			:= \033[1;31m
GREEN		:= \033[1;32m
YELLOW		:= \033[1;33m
BLUE		:= \033[1;34m
MAGENTA		:= \033[1;35m
CYAN		:= \033[1;36m
WHITE		:= \033[1;37m

build-up:
	docker compose up --build

build: setup
	docker compose build 

up:
	docker compose up

down:
	docker compose down -v

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

destroy: down rmi

rmi:
	docker rmi -f $$(docker images -a -q)

rmv:
	docker volume rm $$(docker volume ls -q)

API-DIR = backend/Gateway

setup:
	npm install --prefix frontend
	echo "JWT_SECRET_LOADER=pVSOWeTXrAddkz/YCSR2nDybdRQfwOtKZxjecJ5L0GY=\nPORT=7000" > $(API-DIR)/.env
	echo 'PORT=3000' > backend/user/conf/.env

env-clean:
	-rm -r $(API-DIR)/.env 2> /dev/null
	-rm -r backend/user/conf/.env 2> /dev/null

re: down db-clean build-up

rep: destroy db-clean build-up

DB-PATH = backend/Gateway/Database/testDB.db

DB-NAME = users

start-server:
	cd frontend ; npx vite --host 127.0.0.1 --port 9000 --open register.html

db-clean:
	sqlite3 $(DB-PATH) "drop table $(DB-NAME);" 2> /dev/null

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
	@read -p "rm -rf $$PWD/" folder;\
	docker run --rm -v ./$$folder:/folder_to_rm busybox rm -rf '/folder_to_rm' 2>/dev/null ; true
