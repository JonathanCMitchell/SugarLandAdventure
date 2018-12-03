### 1. Description
TODO: 

### 2. Contributions
Jonathan Mitchell
Contributions:
* Car movement mechanics (accelerate, decelerate, turn right, left, reverse, ludicrous mode)
* Data structure design
* Collision detection

Car movement mechanics: 
I designed the car mechanics by creating a grid of road blocks, and allowing the car to move forward, backward, turn left and turn right. I did this by placing the camera at the origin and manipulating a 2D array of transformation matrices. I decided early on that I would move the road instead of the camera. 
I did this early on because I didn't want to have to compute an inverse (because of the computational load). So when the car moves forward, the world is actually moving backwards. There were challenges in providing acceleration and deceleration mechanics. The car begins to accelerate if you press the acceleration button, but if you let go, it will continue to move forward until it stops. Features like this made the whole game more realistic, and they were the most challenging part of the whole project for me. When determining the right values / constants for acceleration, deceleration and rotation I coordinated with Calvin, because he was in the process of making the track. Together, we found the optimal acceleration and turning values so that our mechanics would meet the game's design requirements. Furthermore, he also provided great insight into managing the display() function by helping me organize the state variable's flags.

Data structures:
The road is comprised of 2x2 blocks. When we drive the car we are simply driving on top of those blocks. I organized the road using a 2D array known as `this.box_grid`(inside road_scene.js). Each cell contains a transformation matrix for each block in the road, and it updates as we drive the car. This data struture proved to be very useful in various stages throughout this project. Its simplicity and availability allowed us to pass it between our scenes so that my team members were able to render props (shapes) and textures on top of them. We were able to maintain correspondence with each block in the road simply by passing in an index into the 2D array, which I did when performing collision detection.

Collision Detection:
Because of the decisions made earlier to keep the camera at the origin, and to keep track of all the blocks using `this.box_grid`, I was able to implement collision detection. On each frame we simply check the `x` and `z` coordinates of each box to see if they are within a certain distance from the origin. If so, we assume they have collided and we trigger our collision action. In practice, the hardest part was managing the display() function, and using flags with a global state member variable conditioned on the road class in order to keep track of our current state.


### 3. Details on how to run


### 4. Extra:



