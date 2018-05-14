var hit_mesh = function(x,y,z,color) {
	// var geometry = new THREE.TetrahedronGeometry(1,0);
	// var material = new THREE.MeshBasicMaterial( {color: color} );
	// var sphere = new THREE.Mesh( geometry, material );	
	var dotGeometry = new THREE.Geometry();
	dotGeometry.vertices.push(new THREE.Vector3( 0, 0, 0));
	var dotMaterial = new THREE.PointsMaterial( { size: 1, sizeAttenuation: false } );
	var dot = new THREE.Points( dotGeometry, dotMaterial );
	dot.position.x = parseFloat(x);
	dot.position.y = parseFloat(y);
	dot.position.z = parseFloat(z);
	return dot;
}