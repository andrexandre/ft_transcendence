END			:= \033[0m
RED			:= \033[1;31m
GREEN		:= \033[1;32m
YELLOW		:= \033[1;33m
BLUE		:= \033[1;34m
MAGENTA		:= \033[1;35m
CYAN		:= \033[1;36m
WHITE		:= \033[1;37m

all: env build up

up:
	docker compose up

build:
	docker compose build

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
	@docker network ls --filter "name=ft_transcendence"
	@echo

env:
	@IP=$$(hostname -I | awk '{print $$1}'); \
	echo -n "IP = $$IP "; \
	if ! grep -sq "IP = $$IP" .env; then \
		echo "IP = $$IP" > .env; \
		echo "CORS_ORIGIN = https://$$IP:5500" >> .env; \
		echo "was added to .env"; \
	else \
		echo "already exists in .env"; \
	fi

rm-env:
	find . -iname .env -delete

destroy: down
#	docker compose down --rmi all
	find . -type f -iname '*.db' -delete
	find . -type f -iname '*.jsonl' -delete

rm-node_modules: rmi
	find . -type d -name node_modules | while read folder; do \
		docker run --rm -v "$$(realpath -q "$$folder"):/folder_to_rm" busybox rm -rf /folder_to_rm 2>/dev/null || true; \
	done
	find . -type d -iname node_modules -delete

rmi:
	-docker rmi -f $$(docker images -a -q)

rmv:
	docker volume rm $$(docker volume ls -q)

DB-PATH = backend/user/userManagement/user.db

DB-NAME = users

db-clean:
	sqlite3 $(DB-PATH) "delete from $(DB-NAME);"

list-users:
	sqlite3 $(DB-PATH) "select * from $(DB-NAME);"

o:
	@open http://$$(hostname -I | awk '{print $$1}'):5500

# docker system prune --help
system-prune:
	-docker stop $$(docker ps -qa)
	-docker system prune -f -a --volumes

# this is useful when root permissions are required to delete files
rm-rf:
	@read -p "rm -rf $$PWD/" folder;\
	docker run --rm -v ./$$folder:/folder_to_rm busybox rm -rf '/folder_to_rm' 2>/dev/null ; rmdir $$folder


# mc speed commands
guser:
	docker exec pongify sqlite3 -header -column /pong_vol/game-project/db_game.db "SELECT * FROM users;"
ggame:
	docker exec pongify sqlite3 -header -column /pong_vol/game-project/db_game.db "SELECT * FROM games;"



alex:
#	docker compose build user_management
	docker compose up user_management
