# centaurscience
The start of a super cool active search app

# Run simple

If you want to you can run pieces of this application on its own. Pieces that support being run without docker compose are:
  - backend
  - frontend (Not super helpful though)

# Run docker

If you don't have docker/docker-compose all set up on your computer head on over to their docs. 

Otherwise:
  - Dev: 
    - run "docker-compose -f docker-compose.yml -f docker-compose.dev.yml build" to build
    - run "docker-compose -f docker-compose.yml -f docker-compose.dev.yml up" to run
  - What will eventually be prod (no hot reloading + nginx only difference for now)
    - run "docker-compose -f docker-compose.yml -f docker-compose.prod.yml build" to build
    - run "docker-compose -f docker-compose.yml -f docker-compose.prod.yml up" to run

You're all set to access the site at localhost:3000.

