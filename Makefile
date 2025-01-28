END			:= \033[0m
RED			:= \033[1;31m
GREEN		:= \033[1;32m
YELLOW		:= \033[1;33m
BLUE		:= \033[1;34m
MAGENTA		:= \033[1;35m
CYAN		:= \033[1;36m
WHITE		:= \033[1;37m

NAME = inception

build-up:
	docker compose up --build 

# Run docker-compose and create the containers
up:
	docker compose up

down:
	docker compose down

# Show the status of the infrastructure 
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

destroy:
	docker compose down
	make rmi
	make rmv

rmi:
	docker rmi $$(docker images -a -q)

rmv:
	docker volume rm $$(docker volume ls -q)
