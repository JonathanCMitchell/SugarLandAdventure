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
    transform(t,r,s,t1=[0,0,0],r1=[0,1,0,0],s1=[1,1,1],t2=[0,0,0],r2=[0,1,0,0],s2=[1,1,1]){
        var matrix = Mat4.identity();
        matrix = matrix.times(Mat4.translation(t));
        matrix = matrix.times(Mat4.rotation(r[3],[r[0],r[1],r[2]]));
        matrix = matrix.times(Mat4.scale(s));
        matrix = matrix.times(Mat4.translation(t1));
        matrix = matrix.times(Mat4.rotation(r1[3],[r1[0],r1[1],r1[2]]));
        matrix = matrix.times(Mat4.scale(s1));
        matrix = matrix.times(Mat4.translation(t2));
        matrix = matrix.times(Mat4.rotation(r2[3],[r2[0],r2[1],r2[2]]));
        matrix = matrix.times(Mat4.scale(s2));
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
		this.model("sky.jpg");
		this.model("car.png",0.5);
		this.model("lollipop.png",1.2);
		this.model("twist.jpg",0.75);
		this.model("swirl.jpg",0.75);
		this.model("icebar.jpg",0.75);
		this.model("cookie.jpg",0.75);
		this.model("cone1.jpg",0.75);
        this.submit_shapes(context, this.shapes);
    }
    display(state){
		//return;
		if (true) {
			state.camera_transform 
				= Mat4.look_at(Vec.of(5,1,1),Vec.of(0,1,0),Vec.of(0,1,0));
			state.projection_transform
				= Mat4.perspective(Math.PI/4, this.aspect, 1, 1000);
		}
        var time = state.animation_time / 1000;
        var freq = 0.1;
        var angle = 2 * Math.PI * freq * time;
		var drive = 0.25 * Math.sin(angle*3); 
		this.tran = [
			this.transform([0,0,0],[0,0,1,0],[3,0.2,3],[0,0,0],[0,0,-1,angle],[1,1,1]),
			this.transform([0,-10,0],[0,1,0,angle],[10,10,10]),
			this.transform([2.5,0.2,drive],[0,1,0,-Math.PI/2],[1,1,1]),
			this.transform([0,-1,0],[0,0,-1,0],[1,0.2,1],[0,0,0],[0,0,-1,angle],[1,1,1],[2,5,+1],[0,0,-1,0],[1,5,1]),
			this.transform([-1,0,3],[0,1,0,angle],[1,1,1]),
			this.transform([-3,0,2],[0,1,0,angle],[1,1,1]),
			this.transform([1,0,-2],[0,1,0,angle],[1,1,1]),
			this.transform([-1,0,-3],[0,1,0,0],[1,1,1]),
			this.transform([-3,0,-2],[0,1,0,0],[1,1,1]),
		];
		var i = 0;
		for (var key in this.shapes) {
			var transform = this.tran[i++];
			if (key=="font") continue;
			this.shapes[key].draw(state, transform, this.materials[key]);
		}
    }
};
