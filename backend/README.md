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
- This is a part of a larger docker compose
   - Which is run from a level up, see that README 
- Currently can build and run just using the Dockerfile here as well
- Steps
    - In this directory
    - docker build . (should probably tag here)
    - docker image ls
        - find the image you just created
    - docker run -p 5000:5000 <image-id> gunicorn --bind 0.0.0.0:5000 app:application
    - go to localhost/5000/<a_working_resource>
