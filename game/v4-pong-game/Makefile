GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m

all: run

run:
	@echo -e "$(GREEN)Building and starting all Docker images...$(NC)"
	docker-compose up --build -d

migrate:
	@echo -e "$(GREEN)Applying database migrations...$(NC)"
	docker-compose run backend python manage.py migrate

createsuperuser:
	@echo -e "$(GREEN)Creating Django superuser...$(NC)"
	docker-compose run backend python manage.py createsuperuser

test:
	@echo -e "$(YELLOW)Running tests...$(NC)"
	docker-compose run backend pytest

down:
	@echo -e "$(RED)Stopping all containers...$(NC)"
	docker-compose down

clean: down
	@echo -e "$(RED)Cleaning up Docker resources...$(NC)"
	- docker rm -vf $$(docker ps -aq)
	- docker rmi -f $$(docker images -aq)
	- docker volume rm -f $$(docker volume ls -q)
# docker network prune -f
# docker network rm $$(docker network ls -q | grep v4-pong-game || true)

re: clean run

status:
	@echo -e "$(GREEN)Active containers:$(NC)"
	docker ps -a
	@echo
	@echo -e "$(GREEN)Available Docker images:$(NC)"
	docker image ls
	@echo
	@echo -e "$(GREEN)Existing Docker volumes:$(NC)"
	docker volume ls
	@echo
	@echo -e "$(GREEN)Available Docker networks:$(NC)"
	docker network ls
