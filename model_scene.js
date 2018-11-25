class Model extends Shape {
    constructor(name, size=1) {
        super("positions", "normals", "texture_coords");
        var request = new XMLHttpRequest();
        request.open("GET", name, false);
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
    transform(t,r,s,m=Mat4.identity()){
        var matrix = m;
        matrix = matrix.times(Mat4.translation(t));
        matrix = matrix.times(Mat4.rotation(r[3],[r[0],r[1],r[2]]));
        matrix = matrix.times(Mat4.scale(s));
        return matrix;
    }
	model(name, size=1) {
		var context = this.context;
		var key = name.slice(0,-4);
		this.shapes[key] = new Model("models/"+key+".json", size);
		this.materials[key] = context.get_instance(Phong_Shader)
			.material(Color.of(0,0,0,1),
			{ambient: 1.0, diffusivity: 0.0, specularity: 0.0 })
			.override({texture:context.get_instance("models/"+name, true)});
	}
    constructor(context, control_box){
        super(context, control_box);
		this.context = context;
		this.aspect = context.width/context.height;
		this.shapes = {};
		this.materials = {};
		this.model("road.jpg");
		this.model("sky.jpg",100);
		this.model("car.png",1);
		this.model("lollipop.png",2);
		this.model("twist.jpg",1);
		this.model("swirl.jpg",1);
		this.model("icebar.jpg",1);
		this.model("cookie.jpg",1);
		this.model("cone1.jpg",0.5);
        this.submit_shapes(context, this.shapes);
		this.shape = [];
		this.material = [];
		for (var key in this.shapes) {
			this.shape.push(this.shapes[key]);
			this.material.push(this.materials[key]);
		}
		this.props = new Array(10);
		for (var z=0; z<10; z++) {
			this.props[z] = new Array(10);
			for (var x=0; x<10; x++) {
				this.props[z][x] = 0;
				if ((x&1)==0 && (z&1)==0) {
					var value = Math.floor(Math.random()*6)+3;
					this.props[z][x] = value;
				}
			}
		}
		this.props[0][0] = 0;
    }
    display(state){
		if (false) {
			state.camera_transform 
				= Mat4.look_at(Vec.of(5,1,1),Vec.of(0,1,0),Vec.of(0,1,0));
			state.projection_transform
				= Mat4.perspective(Math.PI/4, this.aspect, 1, 1000);
		}
        var time = state.animation_time / 1000;
        var freq = 0.1;
        var angle = 2 * Math.PI * freq * time;
		var drive = 0.01 * Math.sin(angle*3);
		this.tran = [
			this.transform([8,2,1],[0,0,1,0],[1,1,1]),
			this.transform([0,-2,0],[0,1,0,0],[1,1,1]),
			this.transform([0.5,1.2,drive+1],[0,1,0,+Math.PI/2],[1,1,1]),
		];
		this.grid = this.context.scene_components[2].box_grid;
		for (var z=0; z<10; z++) {
			for (var x=0; x<10; x++) {
				var c = this.props[z][x];
				if (c==0) continue;
				var tran = this.transform([0,1,0],[0,0,1,0],[1,1,1],this.grid[z][x]);
				this.shape[c].draw(state, tran, this.material[c]);
			}
		}
		for (var i=1; i<3; i++) {
			this.shape[i].draw(state, this.tran[i], this.material[i]);
		}
    }
};
