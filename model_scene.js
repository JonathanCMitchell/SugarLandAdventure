class Model extends Shape {
    constructor(filename) {
        super("positions", "normals", "texture_coords");
        var request = new XMLHttpRequest();
        request.open("GET", filename, false);
        request.send();
        var mesh = JSON.parse(request.responseText);
		this.positions.push(mesh.data.attributes.position.array);
		this.normals.push(mesh.data.attributes.normal.array);
		this.texture_coords.push(mesh.data.attributes.uv.array);
		this.indices = mesh.data.index.array;
    }
};
window.model_scene =
class model_scene extends Scene_Component {
    transform(t,r,s){
        var matrix = Mat4.identity();
        matrix = matrix.times(Mat4.translation(t));
        matrix = matrix.times(Mat4.rotation(r[3],[r[0],r[1],r[2]]));
        matrix = matrix.times(Mat4.scale(s));    
        return matrix;
    }
    constructor(context, control_box){
        super(context, control_box);
        if (true) {				
            context.globals.graphics_state.camera_transform 
				= Mat4.look_at(Vec.of(3,3,3),Vec.of(0,0,0),Vec.of(0,1,0));
            context.globals.graphics_state.projection_transform 
				= Mat4.perspective(Math.PI/4, context.width/context.height, 1, 100);        
        }
        var shapes = {
            street: new Model("models/icebar.json")
        };
        this.submit_shapes(context, shapes);
        this.materials = {
            street: context.get_instance(Phong_Shader)
				.material(Color.of(0,0,0,1),
				{ambient: 1.0, diffusivity: 0.4, specularity: 0.6 })
				.override({texture:context.get_instance("models/icebar.jpg", true)})
		};
    }
    display(graphics_state){
        var time = graphics_state.animation_time / 1000;
        var freq = 0.2;
        var angle = 2 * Math.PI * freq * time;
        var transform = this.transform([0,0,0],[0,0,1,0],[1,1,1]);
        var transform = transform.times(Mat4.rotation(angle,[0,1,0]));
        this.shapes.street.draw( graphics_state, transform, this.materials.street);
		return;
    }
};
