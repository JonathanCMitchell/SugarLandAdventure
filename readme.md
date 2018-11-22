### Notes:
Inside `road_scene.js` you will find the class that creates a grid of boxes. Each box is size (2,2,2). You can render shapes using the transformation matrices stored in `this.box_grid`.
`this.box_grid` is a 2D array that consists of rows and columns. Each item in this grid represents a transformation matrix that will enable you to rotate and translate to the point at which to render any box or item. 

The function render_box_grid() does this for you. 

If you wish to render some shapes onto the box grid. Simply keep track of the row and column of the corresponding grid cell that you want to render it on. 
Then, apply your shape using that transformation matrix as the shape origin. Note: You must translate up 2 units in Y to render your shape. Because you want to place it on top of the box, not where the box actually is. 

Here is an example of how you can do that. You will find this example commented out in road_scene.js

```
// Uncomment below for sample on how to render a shape onto box grid
let sample_m = this.box_grid[2][2]
this.shapes.box.draw(graphics_state, Mat4.translation([0,2,0]).times(sample_m), this.materials.phong.override({color: Color.of(0,1,1,1.)}) );
```


Sidenote: Breaking is not implemented yet.
We are still using axis arrows to keep track of our origin and our camera. Please don't delete them. 