
window.road_scene = window.classes.road_scene =
class road_scene extends Scene_Component
  {
     constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 
         context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,30,25 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );
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
        this.box_grid = column_list

        this.step_size = 0
        this.step_size_incrementer = 0.0001
        this.step_size_decrementer = 0.0001
        this.speed_limit = 0.0100
        this.rotation_amount = 50
        this.back_step_size = 0
        this.rotation_angle = Math.PI/30
        this.pause_rotation_left = false
        this.rotation_angle_left = 0
        this.pause_rotation_right = false
        this.rotation_angle_right = 0
        this.in_turn_left = false
        this.in_turn_right = false
        this.button_holding = false

        this.submit_shapes( context, shapes );
        this.materials =
          { 
            phong: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient:0.6, texture: context.get_instance("assets/gravel.jpg", true) } ),
            phong1: context.get_instance( Phong_Shader ).material( Color.of( 1,0,0,1 ), { ambient:0.6}),
            phong3: context.get_instance( Phong_Shader ).material( Color.of( 1,0,0,1 ), { ambient:0.6, texture: context.get_instance("assets/car.png", true)})
          }
         this.lights = [ new Light( Vec.of( -5,5,5,1 ), Color.of( 0,1,1,1 ), 100000 ) ];
         
         this.state = {
           'accel': false,
           'decel': false
         }

      // =========== ATTACHES SHAPES =================

       }
      
    make_control_panel()
      { 
        this.key_triggered_button( "View world",  [ "0" ], () => this.attached = () => this.initial_camera_location );
        this.key_triggered_button( "accelerate",  [ "t" ], () => { 
          // toggle acceleration on
          this.state.accel = true
          this.state.decel = false

        }, '#'+Math.random().toString(9).slice(-6), () => {
          this.state.accel = false
        });

        this.key_triggered_button( "reverse",  [ "y" ], () => { 
          this.state.accel = false
          this.state.decel = true

        }, '#'+Math.random().toString(9).slice(-6), () => {
          this.state.decel = false
        });

        // NOTE: Break not implemented yet
        this.key_triggered_button( "break",  [ "k" ], () => { 
          // toggle acceleration on
        

          if (Math.abs(this.step_size) > 0) {
            
            let transformation_mtx = Mat4.identity()

            if (this.state.accel) {
              this.step_size -= 0.05
              // move forward while decreasing
              // include guard so you dont go the other way
              this.back_step_size = Math.max(0, this.step_size)
              this.transform_box_grid(transformation_mtx, 'move_forward')
            } else if (this.state.decel) {
              this.back_step_size -= 0.05
              this.back_step_size = Math.max(0, this.back_step_size)
              // move backward while decreasing
              this.transform_box_grid(transformation_mtx, 'move_backward')
            } else if (this.step_size <= 0) {
              this.state.accel = false
            } else if (this.back_step_size <= 0) {
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

          let rot_step = this.rotation_amount * this.step_size
          if (this.step_size > 0) {
            // this.transform_box_grid(transformation_mtx, 'move_forward')
            this.transform_box_grid(transformation_mtx, 'rotate_left', rot_step)  
          } else if (this.back_step_size > 0 && this.step_size <= 0) {
            this.transform_box_grid(transformation_mtx, 'move_backward') // TODO Fix for step size
            this.transform_box_grid(transformation_mtx, 'rotate_right')
          } else {
            // TODO Add logic so that if the speed is zero it won't actively turn
            // move right with no turn
            // this.transform_box_grid(transformation_mtx, 'rotate_right',0)  
          }

          
        });
        this.key_triggered_button( "turn right",  [ "e" ], () => { 
        // Whatever you want to rotate around, make its X, Y, Z coordinates here
        // This will translate around the origin
          let transformation_mtx = Mat4.identity()
          // can use custom step size if you want
          let rot_step = this.rotation_amount * this.step_size
          if (this.step_size > 0) {
            // this.transform_box_grid(transformation_mtx, 'move_forward')
            this.transform_box_grid(transformation_mtx, 'rotate_right', rot_step)  
          } else if (this.back_step_size > 0 && this.step_size <= 0) {
            this.transform_box_grid(transformation_mtx, 'move_backward') // TODO Fix for step size
            this.transform_box_grid(transformation_mtx, 'rotate_left')
          } else {
            // TODO Add logic so that if the speed is zero it won't actively turn
            // move right with no turn
            // this.transform_box_grid(transformation_mtx, 'rotate_right',0)  
          }
        });
        this.key_triggered_button( "Attach to world", [ "1" ], () => this.attached = () => this.attach_world );
        
        this.key_triggered_button( "move forward",  [ "c" ], () => { 
          const transformation_mtx = Mat4.identity()
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
                this.shapes.box.draw(graphics_state, this.box_grid[i][j], this.materials.phong)
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

    transform_box_grid(transformation_mtx, kind='', rotation_step=0) {

      this.box_grid = this.box_grid.map( row_list => row_list.map( (box) => {
      
      if (kind == 'rotate_left') {
       return Mat4.translation([-rotation_step, 0, 0]).times(Mat4.rotation(this.rotation_angle,[0, -1, 0]).times(box))
      } else if (kind == 'rotate_right') {
        return Mat4.translation([-rotation_step, 0, 0]).times(Mat4.rotation(this.rotation_angle,[0, 1, 0]).times(box))
      } else if (kind == 'move_forward') {
        return Mat4.translation([-this.step_size, 0, 0]).times(box)
      } else if (kind == 'move_backward') {
        return Mat4.translation([+this.back_step_size, 0, 0]).times(box)
        // return box.times(Mat4.translation([+this.back_step_size, 0, 0]))
      } else {
        // do nothing
        return box
      }
       }));   
    }

    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000
        this.dt = graphics_state.animation_delta_time / 1000
        const dt = graphics_state.animation_delta_time / 1000;

        // Accelerate/decelerate in forward direction
        if (this.state.accel) {
          // console.log("Accelerate forward")
          let transformation_mtx = Mat4.identity()
          this.step_size += this.step_size_incrementer
          this.step_size = Math.min(this.step_size, this.speed_limit)
          this.transform_box_grid(transformation_mtx, 'move_forward')

        }  else if (!this.state.accel && this.step_size > 0 && !this.state.decel) {
          // console.log("Decelerate forward")
          let transformation_mtx = Mat4.identity()
          this.step_size = Math.max(this.step_size-this.step_size_decrementer, 0)
          this.transform_box_grid(transformation_mtx, 'move_forward')
        }
        
        // Accelerate/decelerate in backward direction
        if (this.state.decel) {
          let transformation_mtx = Mat4.identity()

          if ((this.step_size) > 0) {
            // push current step size to 0 to slow down
            //  Decrement at a faster rate 
            this.step_size -= 0.0015
            // prevent step size from going negative in reverse step
            this.step_size = Math.max(0, this.step_size)
            this.transform_box_grid(transformation_mtx, 'move_forward')
          }
          else if (this.step_size <= 0) {
            this.step_size = 0
            this.transform_box_grid(transformation_mtx, 'move_backward')
            this.back_step_size += this.step_size_incrementer
            this.back_step_size = Math.min(this.back_step_size, this.speed_limit)
          }
        }  else if (!this.state.decel && this.back_step_size > 0 && !this.state.accel) {
          // console.log("Decelerate backward")
          let transformation_mtx = Mat4.identity()
          // default is move forward
          this.transform_box_grid(transformation_mtx, 'move_backward')
          this.back_step_size = Math.max(this.back_step_size-this.step_size_decrementer, 0)
        }
        //console.log(this.step_size, this.back_step_size)
        this.shapes.axis.draw(graphics_state, Mat4.identity(), this.materials.phong.override({color: Color.of(1,1,1,1)}))
        
        

         // TODO:  Draw the required boxes. Also update their stored matrices.
        let axis_transform = Mat4.identity().times(Mat4.translation([2,0,0])).times(Mat4.scale([1/5,1/5,1/5]))

        this.shapes.axis.draw( graphics_state, axis_transform, this.materials.phong1.override({color: Color.of(0,1,1,1.)}) );
        // this.transform_box_grid(transform_sample)
        this.render_box_grid(graphics_state)

        // ==========================================================================================================
        // ==========================================================================================================
        // =========== Uncomment below for sample on how to render a shape onto box grid=============================
        // ==========================================================================================================
        // ==========================================================================================================

        // let sample_m = this.box_grid[2][2]
        // this.shapes.box.draw(graphics_state, Mat4.translation([0,2,0]).times(sample_m), this.materials.phong.override({color: Color.of(0,1,1,1.)}) );

        let camera_mat = Mat4.identity();
        camera_mat = camera_mat.times(Mat4.rotation(Math.PI/2, [0, -1.0, 0]))
        camera_mat = camera_mat.times(Mat4.translation([1, 2., 0]))
        this.camera_mat = camera_mat
        this.attach_world = camera_mat
        this.shapes.box.draw(graphics_state, camera_mat.times(Mat4.scale([1/10,1/10,1/10])).times(Mat4.translation([0, 0, 1])), this.materials.phong3)

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