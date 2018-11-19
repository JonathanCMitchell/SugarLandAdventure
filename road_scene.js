window.road_scene = window.classes.road_scene =
class road_scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,0,5 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
        //        texture coordinates as required for cube #2.  You can either do this by modifying the cube code or by modifying
        //        a cube instance's texture_coords after it is already created.
        const shapes = { box:   new Cube(),
                         box_2: new Cube(),
                         axis:  new Axis_Arrows(),
                         torus:  new Torus( 15, 15 ),
                        //  torus2: new ( Torus.prototype.make_flat_shaded_version() )( 15, 15 )
                       }
        this.submit_shapes( context, shapes );

        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when 
        //        you get to requirements 6 and 7 you will need different ones.
        // You can use_mipmap True if you want 
        this.materials =
          { 
            phong: context.get_instance( Phong_Shader ).material( Color.of( 1.,1.,0,1 ), {ambient: 1}),
            
            phong2: context.get_instance( Texture_Scroll_X ).material( Color.of( 0.,0.,0,1 ), {ambient: 1, texture:context.get_instance("/assets/road_texture_3.jpg", true)})
          }

        // this.lights = [ new Light( Vec.of( -5,5,5,1 ), Color.of( 0,1,1,1 ), 100000 ) ];
        // TODO Make sure lighting doesn't interfere with global lighting

        this.lights = [ new Light( Vec.of( 5,-10,5,1 ), Color.of( 0, 0, 0, 1 ), 1000) ];

        this.pause_rotation = false
        // this.time = context.globals.graphics_state.animation_time / 1000
        // this.dt = context.globals.graphics_state.animation_delta_time / 1000
        this.rotation_angle = 0

      }
    make_control_panel()
      { // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
      this.key_triggered_button( "start/stop rotation",  [ "c" ], () => {this.pause_rotation = !this.pause_rotation});
      this.key_triggered_button( "Attach to planet 1", [ "1" ], () => this.attached = () => this.road_view1 );
        
      }
    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const dt = graphics_state.animation_delta_time / 1000;
        const t = graphics_state.animation_time / 1000

        
        // TODO Will use this to start/stop the rotation of the torus
        // if not use pause flag then dont ask for new rotation angle
        if (!this.pause_rotation) {
          this.rotation_angle += dt
        }
        
        this.shapes.axis.draw(graphics_state, Mat4.identity().times(Mat4.scale([1/3,1/3,1/3])), this.materials.phong.override({color: Color.of(0.75,0.75,0.77,1), 
                                                                                              ambient: 0.}))
        

        let road_transform = Mat4.identity()
        let squeeze_torus = true
        let t_scale_y = 1.0
        let t_scale_x = 1.5  
        let t_scale_z = 1.5 

        if (squeeze_torus) {
          t_scale_y = 1/20
        }
        else {
          t_scale_y = 1.0
        }

        // TODO You can scale here by uncommenting
        road_transform = road_transform.times(Mat4.scale([t_scale_x, t_scale_y, t_scale_z]))
        

        road_transform = road_transform.times(Mat4.rotation(((2 * Math.PI) / 3) * this.rotation_angle, [0,0,-1]))
        this.shapes.torus.draw(graphics_state, road_transform, this.materials.phong2)

        const torus_displacement = 2 
        let road_view_1 = Mat4.identity()
        road_view_1 = road_view_1.times(Mat4.rotation(Math.PI/2, [0,1,0]))
        road_view_1 = road_view_1.times(Mat4.translation([0,torus_displacement-1,1.5]))
        // Draw axis shape with road view 
        road_view_1 = road_view_1.times(Mat4.translation([0, -0.6,0]))
        this.road_view1 = road_view_1

        // Note: X, Z switch 
        // View to see where camera is
        this.shapes.axis.draw(graphics_state, this.road_view1, this.materials.phong)

        // TODO Rotate aroud z a bit

        // downscale to make smaller box
        let car_transform = Mat4.identity()
        // translate torus displacement plus scale
        // scale of the car, sample scale
        let s_x = 1/5
        car_transform  = road_view_1.times(Mat4.translation([0, -(torus_displacement*t_scale_y+1)+torus_displacement*t_scale_y+s_x, 0]))
        car_transform = car_transform.times(Mat4.scale([s_x,s_x,s_x]))
        this.shapes.box.draw( graphics_state, car_transform, this.materials.phong );
        
        // make sample box
        // TODO: account for the angle so that we can place on the actual torus
        // use road transform then translate out and draw small scale
        let sample_object_transform = road_transform.times(Mat4.translation([torus_displacement+1, 0, 0]))
        sample_object_transform = sample_object_transform.times(Mat4.scale([1/5, 1/5, 1/5]))
        this.shapes.box.draw( graphics_state, sample_object_transform, this.materials.phong );
        
        // make another sample box
        // use road transform then translate out but with + Ty
        // Here you can translate out X and Y as you want to create and append objects onto the torus
        let sample_object_transform_2 = road_transform.times(Mat4.translation([torus_displacement+1, 1, 0]))
        sample_object_transform_2 = sample_object_transform_2.times(Mat4.scale([1/5, 1/5, 1/5]))
        this.shapes.box.draw( graphics_state, sample_object_transform_2, this.materials.phong );

        // Ultimately these sample_object_transforms will form a list of transformation matrices that we can pass to the shape drawer 
        // in order to render buildings, etc.


        if (this.attached) {
          let matrix = this.attached()
          if (matrix == this.initial_camera_location) graphics_state.camera_transform = Mat4.inverse(matrix).map((x, idx) => Vec.from(graphics_state.camera_transform[idx]).mix(x, 0.1))
          else {
            graphics_state.camera_transform = Mat4.inverse(matrix).map((x, idx) => Vec.from(graphics_state.camera_transform[idx]).mix(x, 0.1))
          }
        }
  

      }
  }


  // blank shader class for # 6 and # 7
  // Work in texture space must use the shader
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
                                            // This function looks between pixels in graphics cards, 8 samples
                                            // f_text_coord is the pre-interpolated texture coordinate, its injected into the fragment shader code and the 
                                            // vertex shader code
                                            // its varying so it takes s,t values and collapses them down 
                                            // f_tex_coord x,y value determines which part of the picture the curent pixel is on
                                            // It lives in s,t (texture space) between [0, 1] in texture coordinate space
                                            // if we have an x,y point, take rotation matrix and apply the point on the right side

          mat4 sxy = mat4(2, 0.,0.,0., 0., 2, 0., 0., 0., 0., 1., 0., 0., 0., 0., 1.);
          mat4 txy = mat4(1.0, 0.,0.,0., 0., 1.0, 0., 0., 0., 0., 1., 1, 2.0 * mod(float(animation_time), 60.), 0.5, 0., 1.);
          // vec4 new_texture_coordinate4 = sxy* txy * vec4(f_tex_coord, 0, 1);
          vec4 new_texture_coordinate4 =  vec4(f_tex_coord, 0, 1);


          vec2 new_texture_coordinate =  new_texture_coordinate4.xy;
          
         
          vec4 tex_color = texture2D( texture, new_texture_coordinate );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}
