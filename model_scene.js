class Model extends Shape {
    constructor(filename, size=1) {
        super("positions", "normals", "texture_coords");
        var request = new XMLHttpRequest();
        request.open("GET", filename, false);
        request.send();
        var mesh = JSON.parse(request.responseText);
		var vertex = mesh.data.attributes.position.array;
		for (var i=0; i<vertex.length; i++) {
			vertex[i] *= size;
		}
		this.positions.push(vertex);
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
        if (false) {				
            context.globals.graphics_state.camera_transform 
				= Mat4.look_at(Vec.of(3,3,3),Vec.of(0,0,0),Vec.of(0,1,0));
            context.globals.graphics_state.projection_transform 
				= Mat4.perspective(Math.PI/4, context.width/context.height, 1, 100);        
        }
        var shapes = {
            icebar: new Model("models/icebar.json", 1),
            lollipop: new Model("models/lollipop.json", 1),
            car: new Model("models/car.json", 1)
        };
        this.submit_shapes(context, shapes);
        this.materials = {
            icebar: context.get_instance(Phong_Shader)
				.material(Color.of(0,0,0,1),
				{ambient: 1.0, diffusivity: 0.4, specularity: 0.6 })
				.override({texture:context.get_instance("models/icebar.jpg", true)}),
            lollipop: context.get_instance(Phong_Shader)
				.material(Color.of(0,0,0,1),
				{ambient: 1.0, diffusivity: 0.4, specularity: 0.6 })
				.override({texture:context.get_instance("models/lollipop.png", true)}),
            car: context.get_instance(Phong_Shader)
				.material(Color.of(0,0,0,1),
				{ambient: 1.0, diffusivity: 0.4, specularity: 0.6 })
				.override({texture:context.get_instance("models/car.png", true)})
		};
    }
    display(graphics_state){
        var time = graphics_state.animation_time / 1000;
        var freq = 0.2;
        var angle = 2 * Math.PI * freq * time;
		var trans = [ 
			this.transform([1,0,0],[0,1,0,angle],[1,1,1]),
			this.transform([-1,0,0],[0,1,0,angle],[1,1,1]),
			this.transform([0,0,0],[0,1,0,angle],[1,1,1])
		];
		var model = [
			this.shapes.icebar,
			this.shapes.lollipop,
			this.shapes.car
		];
		var material = [
			this.materials.icebar,
			this.materials.lollipop,
			this.materials.car
		];
		for (var i=0; i<model.length; i++) {
			model[i].draw(graphics_state, trans[i], material[i]);
		}
		return;
    }
};
