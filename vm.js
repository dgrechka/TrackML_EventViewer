function ViewModel(scene) {
	this.scene = scene;
	this.Hits = ko.observable([]);
	this.Autorotate = ko.observable(false);

	var that = this;


	var dots = undefined;

	this.Hits.subscribe(function(value) {
		var dotGeometry = new THREE.Geometry();
		dotGeometry.vertices = value;
		var dotMaterial = new THREE.PointsMaterial( { size: 1, sizeAttenuation: false } );		
		if(dots)
			that.scene.remove(dots);
		dots = new THREE.Points( dotGeometry, dotMaterial );
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
}