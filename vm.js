function Truth(hit_id,particle_id,tx,ty,tz,tpx,tpy,tpz,weight) {
	this.hit_id = hit_id;
	this.particle_id = particle_id;
	this.p = new THREE.Vector3(tx,ty,tz);
	this.m = new THREE.Vector3(tpx,tpy,tpz);
	this.weight = weight;
}

function Particle(particle_id,vx,vy,vz,px,py,pz,q,nhits) {
	this.particle_id = particle_id;
	this.p = new THREE.Vector3( vx, vy, vz );
	this.m = new THREE.Vector3( px, py, pz );
	this.q = q;
	this.nhits= nhits;
}

function ViewModel(scene) {
	this.scene = scene;
	this.Hits = ko.observable([]);
	this.Autorotate = ko.observable(false);
		
	this.VelocityLenMultiplier = ko.observable(1);

	this.FilterParticleIdx = ko.observable("");

	var that = this;

	this.attemptedIdx = ko.pureComputed({
		read: function() {
			return that.FilterParticleIdx();
		},
		write: function(value) {
			if(value.length==0) {
				that.FilterParticleIdx("");
			}
			else {
				var parsed = parseInt(value);
				if(!isNaN(parsed)) {
					if((parsed>=0) && (parsed < that.Particles().length)){
						that.FilterParticleIdx(parsed.toString());
						that.fillHelix();
					}
				}
			}
		}
	});

	this.attemptedId =ko.pureComputed({
		read: function() {
			var map = that.ParticleIdxToID();
			var idx = that.FilterParticleIdx();
			if(idx.length==0)
				return "";
			else {
				var id = parseInt(idx);
				return map[id].toString();				
			}
		},
		write: function(value) {
			var map = that.ParticleIDtoIDX();
			if(value.length === 0){
				that.FilterParticleIdx("");				
			}
			else
			{
				var parsed = parseInt(value);
				if(!isNaN(parsed)) {
					var idx = map[parsed];
					that.FilterParticleIdx(idx.toString());
					that.fillHelix();
				}
			}
		}
	});

	this.Truths = ko.observable([]);
	this.Particles = ko.observable([]);

	this.ShowHits = ko.observable(true);
	this.ShowOrigins = ko.observable(false);

	//hitID -> Hits idx
	this.HitsMap = ko.observable({});
	//particleID -> Particle
	this.ParticleMap = ko.observable({});
	this.ParticleIdxToID = ko.observable([]);
	this.ParticleIDtoIDX = ko.observable({});

	var that = this;

	var dots = undefined;

	var originsPos = undefined;
	var originsNeg = undefined;

	this.ControlsVisible = ko.observable(true);
	this.HelixControlsVisible = ko.observable(false);

	this.ShownHits = ko.pureComputed(function() {
		if(!that.ShowHits())
			return [];
		var hits = that.Hits();
		var availableParticleIDs = that.ParticleIdxToID();
		var particleIdx = parseInt(that.FilterParticleIdx());
		if(isNaN(particleIdx) || particleIdx >= availableParticleIDs.length)
			return hits;
		var truth = that.Truths();
		var N = truth.length;
		var res = [];
		var particleID = availableParticleIDs[particleIdx];
		var hitsMap = that.HitsMap();
		for(var i=0;i<N;i++) {
			if(truth[i].particle_id == particleID) {				
				res.push(hits[hitsMap[truth[i].hit_id]]);
			}
		}
		return res;
	});

	this.ShownHits.subscribe(function(value) {
		var dotGeometry = new THREE.Geometry();
		dotGeometry.vertices = value;
		var dotMaterial = new THREE.PointsMaterial( { size: 1, sizeAttenuation: false } );		
		if(dots)
			app.scene.remove(dots);
		dots = new THREE.Points(dotGeometry, dotMaterial);
		app.scene.add(dots);
	});

	this.ShownOrigins = ko.pureComputed(function() {
		var availableParticleIDs = that.ParticleIdxToID();
		var idx = that.FilterParticleIdx();
		var particles = that.Particles();
		var p_map = that.ParticleMap();
		that.VelocityLenMultiplier();
		if(!that.ShowOrigins())
			return [];				 
		var particleIdx = parseInt(idx);
		if(isNaN(particleIdx) || particleIdx >= availableParticleIDs.length)
			return particles;
		var id = availableParticleIDs[particleIdx];				
		return [p_map[id]];
	});

	this.ShownOrigins.subscribe(function(value) {
		var N = 0;
		if(originsPos)
			app.scene.remove(originsPos);				
		if(originsNeg)
			app.scene.remove(originsNeg);
		N = value.length;
		origins = [];
		var mult = parseFloat(that.VelocityLenMultiplier());

		var geometryPos = new THREE.Geometry();	
		var geometryNeg = new THREE.Geometry();

		for(var i=0;i<N;i++) {
			var particle = value[i];
			var origin = particle.p;
			var hex;
			var sndVertex = origin.clone();			
			sndVertex.addScaledVector(particle.m,mult);
			if(particle.q>0)
				geometryPos.vertices.push(origin,sndVertex);			
			else
				geometryNeg.vertices.push(origin,sndVertex);			
		}
		var materialPos = new THREE.LineBasicMaterial({color: 0xff0000});
		originsPos = new THREE.LineSegments( geometryPos, materialPos );
		app.scene.add(originsPos);
		var materialNeg = new THREE.LineBasicMaterial({color: 0x0000ff});
		originsNeg = new THREE.LineSegments( geometryNeg, materialNeg );
		app.scene.add(originsNeg);
	});

	this.Autorotate.subscribe(function(value) {
		app.orbit.autoRotate = value;
	});	

	this.HitsCount = ko.pureComputed(function() {
		var hits = that.Hits();
		if(hits.length == 0)
			return "Loading...";
		else
			return hits.length;
	});

	this.ParticlesCount = ko.pureComputed(function() {
		var particles = that.ParticleIdxToID();
		if(particles.length == 0)
			return "Loading...";
		else
			return particles.length;
	});

	//helix related
	this.ShowHelix = ko.observable(false);
	this.helix_x_0 = ko.observable("0.0");
	this.helix_y_0 = ko.observable("0.0");
	this.helix_z_0 = ko.observable("0.0");
	this.helix_px = ko.observable("0.0");
	this.helix_py = ko.observable("0.0");
	this.helix_pz = ko.observable("0.0");
	this.helix_q = ko.observable("0.0");
	this.helix_alpha = ko.observable("0.0");
	
	this.helix_pt_num = ko.pureComputed(function() {
		var px = parseFloat(that.helix_px())
		var py = parseFloat(that.helix_py())
		return Math.sqrt(px*px + py*py);
	});

	this.helix_k_num = ko.pureComputed(function() {
		var q = parseFloat(that.helix_q());
		return q/that.helix_pt_num();
	});

	this.helix_rho_num = ko.pureComputed(function() {
		return parseFloat(that.helix_alpha())/that.helix_k_num();
	})

	this.helix_tau_num = ko.pureComputed(function() {
		var pz = parseFloat(that.helix_pz())
		return pz*Math.abs(that.helix_k_num())
		//return pz/that.helix_pt_num();
	});

	this.helix_phi_0_num = ko.pureComputed(function() {
		var px = parseFloat(that.helix_px());
		var py = parseFloat(that.helix_py());
		var abs_k = Math.abs(that.helix_k_num());
		var phi_0 = Math.asin(-px*abs_k);
		if(py<0) //cos < 0
			phi_0 = Math.PI - phi_0;
		
		return phi_0;
	});

	this.showHelixEnabled = ko.pureComputed(function() {
		return that.FilterParticleIdx().length>0;
	});

	this.fillHelix = function() {
		var idx = parseInt(that.FilterParticleIdx());
		var id = that.ParticleIdxToID()[idx];
		var particle = that.ParticleMap()[id];
		that.helix_x_0(particle.p.x.toString());
		that.helix_y_0(particle.p.y.toString());
		that.helix_z_0(particle.p.z.toString());
		that.helix_px(particle.m.x.toString());
		that.helix_py(particle.m.y.toString());
		that.helix_pz(particle.m.z.toString());
		that.helix_q(particle.q.toString());
	}

	this.helix_xy_of_z = ko.pureComputed(function() {
		var x_0 = parseFloat(that.helix_x_0());
		var y_0 = parseFloat(that.helix_y_0());
		var z_0 = parseFloat(that.helix_z_0());
		var alpha = parseFloat(that.helix_alpha());
		var tau = that.helix_tau_num();
		var px = parseFloat(that.helix_px());
		var py = parseFloat(that.helix_py());
		var phi_0 = that.helix_phi_0_num();
		var q = parseFloat(that.helix_q());

		var p_t = Math.sqrt(px*px+py*py);
		
		var rho = that.helix_rho_num();

		var phi = function(z) {return (z_0 - z)/(rho*tau)}		

		return function(z) {
			var phi_at_z = phi(z)
			var x = x_0 + rho*(Math.cos(phi_0) - Math.cos(phi_0 + phi_at_z))
			var y = y_0 + rho*(Math.sin(phi_0) - Math.sin(phi_0 + phi_at_z))
			return [x, y];
		}
	});

	this.helixVerticies = ko.pureComputed(function() {
		var helix_func = that.helix_xy_of_z();
		var enabled = that.ShowHelix();

		if(!enabled || !that.showHelixEnabled())
			return [];
		else
			{
				var vertices = [];
				for(var i =0;i<6000;i++) {
					var z = -3000+i;
					var xy = helix_func(z);
					vertices.push(new THREE.Vector3(xy[0],xy[1],z));
				}
				return vertices;
			}
	});

	var helix = undefined;

	this.helixVerticies.subscribe(function(value) {
		if(helix)
			app.scene.remove(helix);
		var vertices = that.helixVerticies();

		var material = new THREE.LineBasicMaterial({
			color: 0xffff00
		});
		
		var geometry = new THREE.Geometry();
		geometry.vertices = vertices;
		
		helix = new THREE.Line( geometry, material );
		app.scene.add( helix );
	});
}

