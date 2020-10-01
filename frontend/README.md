# Backend

The beginnings of the active search frontend for the centaur science molecule discovery project.

## To Run
- cd app
- npm install 
- npm start 

### For non dev purposes
- cd app
- (I'm assuming you already did npm install)
- npm run build
- serve -s build 

## Currently working
- Displays what is pretty much fake data
- Pictures of molecules
- Need candidates
 
## Docker?
- This is a part of a larger docker compose
   - Which is run from a level up, see that README 
- Currently can build and run just using the Dockerfile here as well
- Steps
    - In this directory
    - docker build . (should probably tag here)
	- This should spit out for image-id
    - docker image ls (if for whatever reason you've forgotten your image id)
        - find the image you just created
    - docker run -p 4000:80 <image-id>
    - go to localhost/:4000
