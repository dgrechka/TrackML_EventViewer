function Truth(hit_id,particle_id,tx,ty,tz,tpx,tpy,tpz,weight) {
	this.hit_id = hit_id;
	this.particle_id = particle_id;
	this.p = new THREE.Vector3(tx,ty,tz);
	this.m = new THREE.Vector3(tpx,tpy,tpz);
	this.weight = weight;
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
					if((parsed>=0) && (parsed < that.Particles().length))
						that.FilterParticleIdx(parsed.toString());
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
			sndVertex.addScaledVector(particle.v,mult);
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
}
