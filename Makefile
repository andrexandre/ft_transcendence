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

build:
	docker compose build 

up:
	docker compose up

down:
	docker compose down
	make rmv

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

destroy: down
	make rmi

rmi:
	docker rmi $$(docker images -a -q)

rmv:
	docker volume rm $$(docker volume ls -q)

# temporary db-commands
API-DIR = backend/Gateway

db-setup:
	wget -qO $(API-DIR)/.env gist.githubusercontent.com/andrexandre/8c011820a35117d005016151cfd46207/raw/.env
	echo 'PORT=3000' > backend/user/conf/.env
	npm install --loglevel=error --prefix $(API-DIR)
	@echo "$(GREEN)Please start live server on register.html$(END)"

db-start:
	npm run dev --prefix $(API-DIR)

DB-NAME = users

db-clean:
	-sqlite3 backend/Gateway/Database/testDB.db "drop table $(DB-NAME);" 2> /dev/null

db-prune: db-clean
	-rm -r $(API-DIR)/node_modules 2> /dev/null
	-rm -r $(API-DIR)/.env 2> /dev/null

db-re: db-clean db-start

db-rep: db-prune db-setup db-start

db-ls:
	sqlite3 backend/Gateway/Database/testDB.db "select * from $(DB-NAME);"

USER = as

db-rm:
	sqlite3 backend/Gateway/Database/testDB.db 'delete from $(DB-NAME) where username = "$(USER)";'
