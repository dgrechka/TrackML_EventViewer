function Truth(hit_id,particle_id) {
	this.hit_id = hit_id;
	this.particle_id = particle_id;
}

function ViewModel(scene) {
	this.scene = scene;
	this.Hits = ko.observable([]);
	this.Autorotate = ko.observable(false);
		
	this.FilterParticleIdx = ko.observable("");
	
	this.Truths = ko.observable([]);	

	this.AvailableParticleIDs = ko.pureComputed(function() {		
		return Array.from(new Set(that.Truths().map(v => v.particle_id)))
	});

	//hitID -> Hits idx
	this.HitsMap = ko.observable({});

	var that = this;

	var dots = undefined;

	this.ShownHits = ko.pureComputed(function() {
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