.PHONY: install build start dev test clean help

help:
	@echo "Multi-Agent Orchestrator Backend — Makefile targets"
	@echo ""
	@echo "  install    Install dependencies (npm install)"
	@echo "  build      Compile TypeScript to JavaScript (npm run build)"
	@echo "  start      Start the server in production mode"
	@echo "  dev        Build and start in development mode"
	@echo "  test       Run unit tests (npm test)"
	@echo "  clean      Remove dist/ and node_modules/"
	@echo "  help       Show this help message"

install:
	npm install

build:
	npm run build

start: build
	node dist/server.js

dev: build
	node dist/server.js

test:
	npm test

clean:
	rm -rf dist/ node_modules/

.DEFAULT_GOAL := help
