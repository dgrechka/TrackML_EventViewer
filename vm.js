function Truth(hit_id,particle_id) {
	this.hit_id = hit_id;
	this.particle_id = particle_id;
}

function Particle(particle_id,vx,vy,vz,px,py,pz,q,nhits) {
	this.particle_id = particle_id;
	this.p = new THREE.Vector3( px, py, pz );
	this.v = new THREE.Vector3( vx, vy, vz );
	this.q = q;
	this.nhits= nhits;
}

function ViewModel(scene) {
	this.scene = scene;
	this.Hits = ko.observable([]);
	this.Autorotate = ko.observable(false);
		
	this.VelocityLenMultiplier = ko.observable(1);

	this.FilterParticleIdx = ko.observable("");	

	this.Truths = ko.observable([]);
	this.Particles = ko.observable([]);

	this.AvailableParticleIDs = ko.pureComputed(function() {		
		return Array.from(new Set(that.Truths().map(v => v.particle_id)))
	});

	this.ShowHits = ko.observable(true);
	this.ShowOrigins = ko.observable(false);

	//hitID -> Hits idx
	this.HitsMap = ko.observable({});
	//particleID -> Particle
	this.ParticleMap = ko.observable({});

	var that = this;

	var dots = undefined;

	var origins = undefined;

	this.ShownHits = ko.pureComputed(function() {
		if(!that.ShowHits())
			return [];
		var hits = that.Hits();
		var availableParticleIDs = that.AvailableParticleIDs();
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
		var availableParticleIDs = that.AvailableParticleIDs();
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
		if(origins) {
			N = origins.length;
			for( var i=0;i<N;i++) {
				var origin = origins[i];
				app.scene.remove(origin);				
			}
		}
		N = value.length;
		origins = [];
		var mult = parseInt(that.VelocityLenMultiplier());
		for(var i=0;i<N;i++) {
			var particle = value[i];
			var dir = particle.v.clone();
			//normalize the direction vector (convert to vector of length 1)
			dir.normalize();
			var origin = particle.p;
			var length = particle.v.length()*mult;
			var hex;
			if(particle.q>0)
				hex=0xFF0000;
			else
				hex=0x0000FF;
			var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex);
			app.scene.add(arrowHelper);
			origins.push(arrowHelper);
		}
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
		var particles = that.AvailableParticleIDs();
		if(particles.length == 0)
			return "Loading...";
		else
			return particles.length;
	});
}