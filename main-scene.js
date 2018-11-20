
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

         // TODO:  Create any variables that needs to be remembered from frame to frame, such as for incremental movements over time.
       }
    make_control_panel()
      { 
        this.key_triggered_button( "View world",  [ "0" ], () => this.attached = () => this.initial_camera_location );
        this.key_triggered_button( "turn left",  [ "q" ], () => { 
          // transform with the current dt value
          this.pause_rotation_left = !this.pause_rotation_left
          this.in_turn_right = false
          this.in_turn_left = true
        });
        this.key_triggered_button( "turn right",  [ "e" ], () => { 
          let transformation_mtx = this.camera_mat
          transformation_mtx = transformation_mtx.times(Mat4.translation([0, -2, 0]))
          transformation_mtx = this.get_rotate_right(transformation_mtx)


          // pass in the current transformation matrix
          this.transform_box_grid(transformation_mtx)

          // this.pause_rotation_right = !this.pause_rotation_right
          // this.in_turn_left = false
          // this.in_turn_right = true

        });
        this.key_triggered_button( "Attach to world", [ "1" ], () => this.attached = () => this.attach_world );
        
        this.key_triggered_button( "move forward",  [ "c" ], () => { 

          let transformation_mtx = Mat4.identity()
          transformation_mtx = this.get_translate_forward(transformation_mtx)
          // pass in the current transformation matrix
          this.transform_box_grid(transformation_mtx)

          
          // set everything else to false
          this.in_turn_left = false
          this.in_turn_right = false
        });

        this.key_triggered_button( "move backward",  [ "v" ], () => { 

          let transformation_mtx = Mat4.identity()
          transformation_mtx = this.get_translate_backward(transformation_mtx)
          // pass in the current transformation matrix
          this.transform_box_grid(transformation_mtx)

          
          // set everything else to false
          this.in_turn_left = false
          this.in_turn_right = false
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

    transform_box_grid(transformation_mtx) {
      console.log('button pressed inside transform_box_grid function')
      this.box_grid = this.box_grid.map( row_list => row_list.map( (box) => box.times(transformation_mtx)));
      
    }

    get_translate_forward(transformation_mtx) {
      transformation_mtx= transformation_mtx.times(Mat4.translation([2., 0, 0]))
      return transformation_mtx

    }


    get_translate_backward(transformation_mtx) {
      transformation_mtx= transformation_mtx.times(Mat4.translation([-2., 0, 0]))
      return transformation_mtx

    }

    get_rotate_right(transformation_mtx) {
      transformation_mtx= transformation_mtx.times(Mat4.rotation(.1, [0, -1, 0]))
      return transformation_mtx

    }


    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000
        this.dt = graphics_state.animation_delta_time / 1000;
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

        console.log('render box grid')
        let camera_mat = Mat4.identity();
        camera_mat = camera_mat.times(Mat4.rotation(Math.PI/2, [0, -1.0, 0]))
        camera_mat = camera_mat.times(Mat4.translation([1, 2., 0]))
        this.camera_mat = camera_mat
        this.attach_world = camera_mat
        this.shapes.axis.draw(graphics_state, camera_mat, this.materials.phong1)

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