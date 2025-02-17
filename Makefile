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

build: env
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

# wget -qO $(API-DIR)/.env gist.githubusercontent.com/andrexandre/8c011820a35117d005016151cfd46207/raw/.env
env:
	echo "JWT_SECRET_LOADER=pVSOWeTXrAddkz/YCSR2nDybdRQfwOtKZxjecJ5L0GY=\nPORT=7000" > $(API-DIR)/.env
	echo 'PORT=3000' > backend/user/conf/.env
	@echo "$(GREEN)Please start live server on register.html$(END)"

env-clean:
	-rm -r $(API-DIR)/.env 2> /dev/null
	-rm -r backend/user/conf/.env 2> /dev/null

re: down db-clean build-up

rep: destroy db-clean build-up

DB-PATH = backend/Gateway/Database/testDB.db

DB-NAME = users

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

# this is the old way of cleaning, the newer needs testing
# -docker stop $$(docker ps -qa)
# -docker rm $$(docker ps -qa)
# -docker rmi -f $$(docker image ls -qa)
# -docker volume rm $$(docker volume ls -q)
# -docker network rm $$(docker network ls --filter "name=ft_transcendence" -q)
