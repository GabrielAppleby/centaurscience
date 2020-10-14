# Backend

The beginnings of the active search backend for the centaur science molecule discovery project.

## To Run

- Create your python virtual environment of choice
- Install requirements.txt
    - gunicorn is not strictly necessary for development, but you should probably install it to make sure everything behaves as you expect when deployed
- python run.py

## Currently working

- api/molecules
- api/molecules/{id}
    
## Docker?
- This is a part of a larger docker compose
   - Which is run from a level up, see that README 
