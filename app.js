var app = {};


function init() {
app.scene = new THREE.Scene();

	// Set the scene size.
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;

    // Set some camera attributes.
    const VIEW_ANGLE = 45;
    const ASPECT = WIDTH / HEIGHT;
    const NEAR = 1e-2;
    const FAR = 20000;

    // Get the DOM element to attach to
    const container = document.getElementById('container');

    // Create a WebGL renderer, camera
    // and a scene
    app.renderer = new THREE.WebGLRenderer();
    app.camera =
        new THREE.PerspectiveCamera(
            VIEW_ANGLE,
            ASPECT,
            NEAR,
            FAR
		); 
		
		app.scene.add(app.camera);

app.camera.position.set(-2000, 0, 0 );
app.camera.lookAt(new THREE.Vector3( 1, 0, 0 ) );

app.orbit = new THREE.OrbitControls(app.camera, app.renderer.domElement );

// create a point light
const pointLight =
new THREE.PointLight(0xFFFFFF);

// set its position
pointLight.position.x = 1100;
pointLight.position.y = 1100;
pointLight.position.z = 3000;

// add to the scene
app.scene.add(pointLight);


// Start the renderer.
app.renderer.setSize(WIDTH, HEIGHT);

var axesHelper = new THREE.AxesHelper(1000);
app.scene.add( axesHelper );

// Attach the renderer-supplied
// DOM element.
container.appendChild(app.renderer.domElement);

// mean 	60470.00000 	-1.769455 	4.751039 	-2.315056 	10.921564 	5.918389 	371.969117
// std 	34912.22644 	305.715118 	305.173096 	1061.912476 	3.365705 	3.407428 	529.032206
// min 	1.00000 	-1024.839966 	-1025.109985 	-2955.500000 	7.000000 	2.000000 	1.000000
// 25% 	30235.50000 	-100.146000 	-95.896503 	-655.799988 	8.000000 	4.000000 	60.000000
// 50% 	60470.00000 	-1.651340 	1.005920 	-1.800000 	9.000000 	6.000000 	119.000000
// 75% 	90704.50000 	97.267651 	103.224003 	655.799988 	13.000000 	8.000000 	490.000000
// max 	120939.00000 	1025.329956 	1024.849976 	2955.500000 	18.000000 	14.000000 	3192.000000

}

function run () {
	if(app.orbit.autoRotate)
		app.orbit.update();

    // Draw!
	app.renderer.render(app.scene, app.camera);



    // Schedule the next frame.
	requestAnimationFrame(run);
}