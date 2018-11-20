
window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
class Assignment_Three_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 
         context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,0,90 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );
         this.initial_camera_location = Mat4.inverse( context.globals.graphics_state.camera_transform );

         const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );
         // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
        //        texture coordinates as required for cube #2.  You can either do this by modifying the cube code or by modifying
        //        a cube instance's texture_coords after it is already created.
        const shapes = { box:   new Cube(),
                         box_2: new Cube(),
                         world:    new Subdivision_Sphere(8),
                         axis:  new Axis_Arrows()
                       }

        
        //  Initialize model transform matrix of all cubes
        let column_list = []
        for (var i = 0; i < 20; i+=2)
        {
            let row_list = []
            for (var j = 0; j < 20; j+=2)
            {
                // push to rowlist    
              let model_transform = Mat4.identity()
              model_transform = model_transform.times(Mat4.translation(([j, 0, i])));
              row_list.push(model_transform)
            }
            column_list.push(row_list)

        }
//      // 
        this.box_grid = column_list
        
        this.step_size = .1
        this.back_step_size = 0.1
        this.rotation_angle = Math.PI/30


        this.submit_shapes( context, shapes );
         // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when 
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials =
          { 
            phong: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient:0.6, texture: context.get_instance("assets/gravel.jpg", true) } ),
            phong1: context.get_instance( Phong_Shader ).material( Color.of( 1,0,0,1 ), { ambient:0.6})
          }
         this.lights = [ new Light( Vec.of( -5,5,5,1 ), Color.of( 0,1,1,1 ), 100000 ) ];
         
         this.pause_rotation_left = false
         this.rotation_angle_left = 0

         this.pause_rotation_right = false
         this.rotation_angle_right = 0

         this.in_turn_left = false
         this.in_turn_right = false

         this.speed_limit = 2
         
         this.state = {
           'accel': false,
           'decel': false
         }

         // TODO:  Create any variables that needs to be remembered from frame to frame, such as for incremental movements over time.
       }
    // TODO: Add a method to keep track of the current speed and update step_size based on current speed
    // Enable deceleration and acceleration and breaking.
    // Breaking: toggle current speed to 0
    // Acceleration: Increase current speed up to a limit
    // Deceleration: Decrease current speed to 0 then reverse. Must change flags here

    // TODO: Enable rotation angle change based on time of pressed rotation key (possible?)
    make_control_panel()
      { 
        this.key_triggered_button( "View world",  [ "0" ], () => this.attached = () => this.initial_camera_location );
        this.key_triggered_button( "accelerate",  [ "t" ], () => { 
          // toggle acceleration on
          this.state.accel = true
          this.state.decel = false

          let transformation_mtx = Mat4.identity()
          // default is move forward
          this.transform_box_grid(transformation_mtx, 'move_forward')
          
          this.step_size += 0.2
          this.step_size = min(this.step_size, this.speed_limit)
        });

        this.key_triggered_button( "reverse",  [ "y" ], () => { 
          // toggle acceleration on
          // (1) Move current step_size to 0 over a period of time
          // (2) Move current step size to negative value
          // (3) make sure < speed_limit
          this.state.accel = false
          this.state.decel = true

          let transformation_mtx = Mat4.identity()
          // move backward
          // push step size down to zero

          if ((this.step_size) > 0) {
            // push current step size to 0 to slow down
            this.step_size -= 0.2
            this.transform_box_grid(transformation_mtx, 'move_forward')
          }
          else if (this.step_size <= 0) {
            this.step_size = 0
            this.transform_box_grid(transformation_mtx, 'move_backward')
            this.back_step_size += 0.1
            this.back_step_size = min(this.back_step_size, -2)
          }
        });

        this.key_triggered_button( "break",  [ "k" ], () => { 
          // toggle acceleration on
        

          if (Math.abs(this.step_size) > 0) {
            
            let transformation_mtx = Mat4.identity()

            if (this.state.accel) {
              this.step_size -= 0.5
              // move forward while decreasing
              // include guard so you dont go the other way
              this.back_step_size = max(0, this.step_size)
              this.transform_box_grid(transformation_mtx, 'move_forward')
            } else if (this.state.decel) {
              this.back_step_size -= 0.5
              this.back_step_size = max(0, this.back_step_size)
              // move backward while decreasing
              this.transform_box_grid(transformation_mtx, 'move_backward')
            } else if (this.step_size == 0) {
              this.state.accel = false
            } else if (this.back_step_size == 0) {
              this.state.decel = false
            }

          }

          // TODO decrease current speed to 0
          let transformation_mtx = Mat4.identity()
          // move backward
          // Move the step_size to 0 and reset it
          // reset step size to 0
          // reset step size by moving it to 0 slowly
          this.transform_box_grid(transformation_mtx, 'move_backward')
        });


        this.key_triggered_button( "turn left",  [ "q" ], () => { 
          let transformation_mtx = Mat4.identity()
          if (this.state.accel) {
            this.transform_box_grid(transformation_mtx, 'move_forward')
            this.transform_box_grid(transformation_mtx, 'rotate_left')  
          } else if (this.state.decel) {
            this.transform_box_grid(transformation_mtx, 'move_backward')
            this.transform_box_grid(transformation_mtx, 'rotate_right')
          } else {
            // TODO Add logic so that if the speed is zero it won't actively turn
            // move right with no turn
            this.transform_box_grid(transformation_mtx, 'rotate_left')  
          }

          
        });
        this.key_triggered_button( "turn right",  [ "e" ], () => { 
        // Whatever you want to rotate around, make its X, Y, Z coordinates here
        // This will translate around the origin
          let transformation_mtx = Mat4.identity()
          // transform one item
          // this.transform_box_grid_item(transformation_mtx, 2, 2)
          // this.transform_box_grid_item(transformation_mtx, 2, 3)
          
          // can use custom step size if you want
          if (this.state.accel) {
            this.transform_box_grid(transformation_mtx, 'move_forward')
            this.transform_box_grid(transformation_mtx, 'rotate_right')  
          } else if (this.state.decel) {
            this.transform_box_grid(transformation_mtx, 'move_backward') // TODO Fix for step size
            this.transform_box_grid(transformation_mtx, 'rotate_left')
          } else {
            // TODO Add logic so that if the speed is zero it won't actively turn
            // move right with no turn
            this.transform_box_grid(transformation_mtx, 'rotate_right')  
          }
        });
        this.key_triggered_button( "Attach to world", [ "1" ], () => this.attached = () => this.attach_world );
        
        this.key_triggered_button( "move forward",  [ "c" ], () => { 
          const transformation_mtx = Mat4.identity()
          // transformation_mtx = this.get_translate_forward(transformation_mtx, this.step_size)
          // pass in the current transformation matrix
          this.transform_box_grid(transformation_mtx, 'move_forward')
          
        });

        this.key_triggered_button( "move backward",  [ "v" ], () => { 
          const transformation_mtx = Mat4.identity()
          // pass in the current transformation matrix
          this.transform_box_grid(transformation_mtx, 'move_backward')
        });
        
      }
    render_box_grid(graphics_state) {
        for (var i = 0; i < 10; i++)
        {
            for(var j = 0; j < 10; j++)
            {
                this.shapes.axis.draw(graphics_state, this.box_grid[i][j], this.materials.phong)
            }
        }
    }

    // ======= HELPER FUNCTION ==============
    render_box_grid_item(graphics_state, row, col) {
    // render first item in the box grid
    this.shapes.axis.draw(graphics_state, this.box_grid[row][col], this.materials.phong)
    }

    // ======== HELPER FUNCTION =================
    transform_box_grid_item(transformation_mtx, row=0, col=0) {
        // save x,z
      const x = this.box_grid[row][col][0][3]
      const z = this.box_grid[row][col][2][3]

      // Apply rotation around origin (using identity) will be replaced with camera x and camera z eventually  
      // apply rotation
      let rotation_mtx = transformation_mtx.times(Mat4.rotation(Math.PI/30, [0, 1, 0]))

      // translate out x,z _ cam_x cam_z
      rotation_mtx = rotation_mtx.times(Mat4.translation([x, 0, z]))
      // set to box grid coord
      this.box_grid[row][col] = rotation_mtx
    }

    transform_box_grid(transformation_mtx, kind='') {

      this.box_grid = this.box_grid.map( row_list => row_list.map( (box) => {
      
      if (kind == 'rotate_left') {
       const x = box[0][3]
       const z = box[2][3]

       let M = transformation_mtx.times(Mat4.rotation(this.rotation_angle, [0, -1, 0]))
       M = M.times(Mat4.translation([x, 0, z]))
       return M

      } else if (kind == 'rotate_right') {
        const x = box[0][3]
        const z = box[2][3]
 
        let M = transformation_mtx.times(Mat4.rotation(this.rotation_angle, [0, 1, 0])) // then move up here
        M = M.times(Mat4.translation([x, 0, z]))
        // TODO: Try to translate with x + dt
        return M 
      } else if (kind == 'move_forward') {
        return box.times(Mat4.translation([-this.step_size, 0, 0]))
      } else if (kind == 'move_backward') {
        return box.times(Mat4.translation([+this.back_step_size, 0, 0]))
      } else {
        // do nothing
        return box
      }
       }));   
    }
    

    get_translate_forward(transformation_mtx, step_size) {
      transformation_mtx= transformation_mtx.times(Mat4.translation([step_size, 0, 0]))
      return transformation_mtx
    }

    get_translate_backward(transformation_mtx, step_size) {
      transformation_mtx= transformation_mtx.times(Mat4.translation([-step_size, 0, 0]))
      return transformation_mtx

    }

    get_rotate_right(transformation_mtx) {
      transformation_mtx= Mat4.identity().times(Mat4.rotation(Math.PI/30, [0, 1, 0]))
      return transformation_mtx
    }


    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000
        this.dt = graphics_state.animation_delta_time / 1000
        const dt = graphics_state.animation_delta_time / 1000;

        // if (!this.pause_rotation_left) {
        //   this.rotation_angle_left += dt
        // }

        // if (this.pause_rotation_left) {
        //     this.rotation_angle_left = 0
        // }


        // if (!this.pause_rotation_right) {
        //   this.rotation_angle_right += dt
        // }

        // if (this.pause_rotation_right) {
        //     this.rotation_angle_right = 0
        // }

        this.shapes.axis.draw(graphics_state, Mat4.identity(), this.materials.phong.override({color: Color.of(1,1,1,1)}))
        
        

         // TODO:  Draw the required boxes. Also update their stored matrices.
         let axis_transform = Mat4.identity().times(Mat4.translation([2,0,0])).times(Mat4.scale([1/5,1/5,1/5]))

        this.shapes.axis.draw( graphics_state, axis_transform, this.materials.phong1.override({color: Color.of(0,1,1,1.)}) );

//         var world_model_transform = Mat4.identity()
//         world_model_transform   = world_model_transform.times( Mat4.rotation( t/15, Vec.of( 1, 0, 0) ) );
//         world_model_transform = world_model_transform.times(Mat4.scale([30, 30, 30]));
//         this.shapes.world.draw(graphics_state, world_model_transform, this.materials.phong);

        // double map

//         let G = this.box_grid.map(  (g) => g.map((b) => {
//             b.times(Mat4.translation([0, 0, 2]))



//         }))

        
        // (1) Build transformation matrix

        // (2) Render box grid
        

        
        // this.transform_box_grid(transform_sample)
        this.render_box_grid(graphics_state)
        // this.render_box_grid_item(graphics_state, 2, 2)
        // this.render_box_grid_item(graphics_state, 2, 3)

        let camera_mat = Mat4.identity();
        camera_mat = camera_mat.times(Mat4.rotation(Math.PI/2, [0, -1.0, 0]))
        camera_mat = camera_mat.times(Mat4.translation([1, 2., 0]))
        this.camera_mat = camera_mat
        this.attach_world = camera_mat
//         this.shapes.axis.draw(graphics_state, camera_mat, this.materials.phong1)

//         let camera_mat = Mat4.identity();
//         camera_mat = camera_mat.times(Mat4.translation([0, 0, 30.1]));
//         camera_mat = camera_mat.times(Mat4.rotation(0.5* Math.PI, Vec.of(1, 0, 0)));
//         this.shapes.axis.draw(graphics_state, camera_mat, this.materials.phong1)
//         this.attach_world = camera_mat

        //  Set camera_mat
        if (this.attached != undefined)
        {
            let matrix = this.attached()
            matrix = Mat4.inverse(matrix).map((x, i) => Vec.from(graphics_state.camera_transform[i]).mix(x, 0.1))
            graphics_state.camera_transform = matrix
            //graphics_state.camera_transform = Mat4.inverse(matrix).map((x, i) => Vec.from(graphics_state.camera_transform[i]).mix(x, 0.1))

        }


      }
  }
 class Texture_Scroll_X extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #6.
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          vec4 tex_color = texture2D( texture, f_tex_coord );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}
 class Texture_Rotate extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #7.
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          vec4 tex_color = texture2D( texture, f_tex_coord );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
} 