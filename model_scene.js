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
	show(x,y,text) {
		var vertex = [];
		var normal = [];
		var texmap = [];
		var index  = [];
		var start = x;
		var k = 0;
		for (var i=0; i<text.length; i++) {
			var ch = text.charCodeAt(i);
			if (ch===10) { 
				x = start;
				y = y - 2;
				continue;
			}
			var ss = 64 / 1024;
			var u0 = (ch & 15) * ss;
			var v0 = (15 - (ch >> 4)) * ss;
			var u1 = u0 + ss;
			var v1 = v0 + ss;
			vertex = vertex.concat( [ x-1,y-1,0, x+1,y-1,0, x-1,y+1,0, x+1,y+1,0 ] );
			normal = normal.concat( [ 0,0,1, 0,0,1, 0,0,1, 0,0,1 ] );
			texmap = texmap.concat( [ u0,v0, u1,v0, u0,v1, u1,v1 ] );
			index  = index. concat( [ k+0, k+1, k+2, k+3, k+2, k+1 ] );
			k = k + 4;
			x = x + 1;
		}
		this.positions.length = 0;
		this.normals.length = 0;
		this.texture_coords.length = 0;
		this.indices = 0;
		this.positions.push(vertex);
		this.normals.push(normal);
		this.texture_coords.push(texmap);
		this.indices = index;
	}
};
window.model_scene =
class model_scene extends Scene_Component {
	panel(x,y,text) {
		var context = this.context;
		var gl = this.context.gl;
		var state = context.globals.graphics_state;
		var camera  = state.camera_transform;
		var frustum = state.projection_transform;
		gl.disable(gl.DEPTH_TEST);
		state.camera_transform 
			= Mat4.look_at(Vec.of(0,0,30),Vec.of(0,0,0),Vec.of(0,1,0));
		state.projection_transform
			= Mat4.perspective(Math.PI/4, this.aspect, 1, 1000);
		var font = this.shapes.font;
		font.show(x-20,10-y,text);
		var shape = { "font": font };
        this.submit_shapes(this.context, shape);
		this.tran0 = this.transform([0,0,0],[0,1,0,0],[1,1,1]);
		font.draw(state, this.tran0, this.materials.font);
		gl.enable(gl.DEPTH_TEST);
		state.camera_transform = camera;
		state.projection_transform = frustum;		
	}
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
		this.model("font.png");
		this.model("terrain.jpg");
		this.model("sky.jpg",100);
		this.model("car.png",1);
		this.model("lollipop.png",2);
		this.model("twist.jpg",1);
		this.model("swirl.jpg",1);
		this.model("icebar.jpg",1);
		this.model("cookie.jpg",1);
		this.model("cone1.jpg",0.5);
        this.submit_shapes(context, this.shapes);
		this.materials["shadow"] = context.get_instance(Shadow_Shader)
			.material(Color.of(0,0,0,1),
			{ambient: 1.0, diffusivity: 0.0, specularity: 0.0 })
			.override({texture:context.get_instance("models/"+name, true)});
		this.shape = [];
		this.material = [];
		for (var key in this.shapes) {
			this.shape.push(this.shapes[key]);
			this.material.push(this.materials[key]);
		}
		this.context.scene_components[0].model_scene = this;
		this.props = new Array(10);
		this.grid = new Array(10);
		for (var z=0; z<10; z++) {
			this.props[z] = new Array(10);
			this.grid[z] = new Array(10);
			for (var x=0; x<10; x++) {
				this.props[z][x] = 0;
				if ((x&1)===0 && (z&1)===0) {
					var range = this.shape.length-4;
					var value = Math.floor(Math.random()*range)+4;
					this.props[z][x] = value;
					this.grid[z][x] = Mat4.identity();
				}
			}
		}
		this.props[0][0] = 0;
		this.show = 0;
    }
	make_control_panel() {
		this.key_triggered_button( "shwo props",["5"],() => {
			this.show ^= 1;
		});
	}
    display_props(state){
        var time = state.animation_time / 1000;
        var hertz = time>0.001 ? 1000/state.animation_delta_time : 30;
		this.rate = time>0.05 ? this.rate * 0.99 + hertz * 0.01 : hertz;
		if (this.show===0) return;
        var freq = 0.1;
        var angle = 2 * Math.PI * freq * time;
		var drive = 0.01 * Math.sin(angle*3);
		this.grid = this.context.scene_components[2].box_grid;
		var xx = this.grid[0][0][0][3];
		var yy = this.grid[0][0][1][3];
		var zz = this.grid[0][0][2][3];
		var cc = this.grid[0][0][0][0];
		var ss = this.grid[0][0][2][0];
		var rr = Math.atan2(ss, cc)
		var ww = rr * 180 / Math.PI;
		var x1 = 11.3 * Math.cos(rr+Math.PI/4) + xx;
		var z1 = 11.3 * Math.sin(rr+Math.PI/4) + zz;
		this.lights = [ new Light( Vec.of(x1,yy+10,z1,1), Color.of(0,0.4,0,1),100000) ];
		if (false) {
			state.camera_transform 
				= Mat4.look_at(Vec.of(20,5,20),Vec.of(9,0,9),Vec.of(0,1,0));
			state.projection_transform
				= Mat4.perspective(Math.PI/4, this.aspect, 1, 1000);
		}
		this.tran = [
			this.transform([0,0,0],[0,1,0,0],[1,1,1]),
			this.transform([9,1.01,9],[1,0,0,Math.PI/2],[10,10,1],this.grid[0][0]),
			this.transform([0,-2,0],[0,1,0,0],[1,1,1]),
			this.transform([0.5,1.2,drive+1],[0,1,0,+Math.PI/2],[1,1,1])
		];
		state.lights = this.lights;
		for (var z=0; z<10; z++) {
			for (var x=0; x<10; x++) {
				var c = this.props[z][x];
				if (c===0) continue;
				var tran = this.transform([0,1,0],[0,1,0,angle],[1,1,1],this.grid[z][x]);
				this.shape[c].draw(state, tran, this.material[c]);
				var trans = this.transform([0,1,0],[0,1,0,angle],[1,1,1],this.grid[z][x]);
				this.shape[c].draw(state, trans, this.materials["shadow"]);
			}
		}
		for (var i=1; i<4; i++) {
			this.shape[i].draw(state, this.tran[i], this.material[i]);
		}
		var text = "";
		text += ("00000"+parseInt(time)).slice(-5);
		text += "     Sugarland Adventure     ";
		text += ("00000"+this.rate.toFixed(2)).slice(-5);
		text += "\n\n\n\n\n\n\n\n\n\n";
		this.panel(0,drive,text);
    }
};
