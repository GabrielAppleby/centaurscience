# Backend

The beginnings of the active search backend for the centaur science molecule discovery project.

## To Run

- Create your python virtual environment of choice
- Install requirements.txt
    - gunicorn is not strictly necessary for development, but you should probably install it to make sure everything behaves as you expect when deployed
- python run.py

## Currently working

- /candidates
    - Displays a fake list of candidates
    
## Docker?
- In the future this will probably be a part of a larger docker compose
- Currently can build and run using the Dockerfile here
- Steps
    - In this directory
    - docker build . (should probably tag here)
    - docker image ls
        - find the image you just created
    - docker run -p 5000:5000 <image-id>
    - go to localhost/5000/<a_working_resource>