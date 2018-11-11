var container;
var camera, scene, raycaster, renderer;
var mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
var radius = 100, theta = 0;
var plane = null, planeBox = null,
land = null,
cone = null, coneBox = null,
tree = null, treeBox = null;
var currentTime = Date.now();
var animation = "run";
var tag = null;
var animator = null;
var score = 0;
var reset = null;
var count = 0;
var grass = "images/grass.jpg";
var sky = "images/sky.png";

var orbitControls = null;
var mousemesh = null;

async function createLand(y)
{
    console.log("creating land");

    // Create a texture map
    var map = new THREE.TextureLoader().load(grass);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));

    mesh.position.set(0, -4, 0);
    mesh.rotation.set(THREE.Math.degToRad(-89), THREE.Math.degToRad(0), 0);
    
    // Add the mesh to our group
    scene.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;
}

async function createPlane()
{
    var loader = new THREE.OBJLoader();
    // load a resource
    loader.load(
    // resource URL
        "objects/paper_airplane.obj",
    // called when resource is loaded
        function ( object ) 
        {
            object.material = new THREE.MeshPhongMaterial({ map:0xf0f0f0});
            object.position.set(0,0,0);
            object.scale.set(20, 20, 20);
            object.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(0), THREE.Math.degToRad(0));
            scene.add(object);
            plane = object;
        },
    // called when loading is in progresses
    function ( xhr ) { console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ); },
    // called when loading has errors
    function ( error ) { console.log( 'An error happened' );}
    );
}

async function createTree()
{
    var loader = new THREE.OBJLoader();
    // load a resource
    loader.load(
    // resource URL
        "objects/lowpolytree.obj",
    // called when resource is loaded
        function ( object ) 
        {
            object.material = new THREE.MeshPhongMaterial({ map:0xf0f0f0});
            object.position.set(5,0,1.8);
            object.scale.set(1, 1, 1);
            object.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(0), THREE.Math.degToRad(0));
            scene.add(object);
            tree = object;
        },
    // called when loading is in progresses
    function ( xhr ) { console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ); },
    // called when loading has errors
    function ( error ) { console.log( 'An error happened' );}
    );
}

async function createcone()
{
    var coneMap = new THREE.TextureLoader().load("objects/Texture/TCone.png");

    var loader = new THREE.OBJLoader();
    // load a resource
    loader.load(
    // resource URL
        "objects/Traffic Cone.obj",
    // called when resource is loaded
        function ( object ) 
        {
            object.material = new THREE.MeshPhongMaterial({ map:coneMap});
            object.position.set(0,-2,0);
            object.scale.set(0.5, 0.5, 0.5);
            object.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(0), THREE.Math.degToRad(0));
            scene.add(object);
            cone = object;
        },
    // called when loading is in progresses
    function ( xhr ) { console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ); },
    // called when loading has errors
    function ( error ) { console.log( 'An error happened' );}
    );
}

async function createScene(canvas) 
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);
        
    scene = new THREE.Scene();
    scene.background = new THREE.TextureLoader().load(sky);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );
    camera.position.set(0, 0, 10);
    camera.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(0), THREE.Math.degToRad(0));
    scene.add(camera);

    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 4, 4 );
    scene.add( light );

    await createPlane();
    await createLand(0);
    await createTree();
    await createcone()

    /*result = $("#result");
    score_l = $("#score");
    reset = $("#reset");
    $("#reset").click(() =>{
        score = 0;
        reset.addClass("hidden");
        score_l.text("Score:0");
        scene.add(cube);
        cube.position.set(0, 0, 1.1);
        result.text("");
    });*/

    //document.addEventListener('keydown', onDocumentKeyDown);
    //orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    document.addEventListener( 'mousemove', onDocumentMouseMove );
    window.addEventListener( 'resize', onWindowResize);

}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event )  {

    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
	vector.unproject( camera );
	var dir = vector.sub( camera.position ).normalize();
	var distance = - camera.position.z / dir.z;
    var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
    //plane.position.x = pos.x
   // plane.position.y = pos.y
   // plane.position.z = pos.z
    plane.position.copy(pos);
}

function detectCollision()
{
    if(planeBox && treeBox && planeBox.intersectsBox(treeBox))
    {
        console.log("Tree Collision");
        resetGame();
    }

    if(planeBox && coneBox && planeBox.intersectsBox(coneBox))
    {
        console.log("cone Collision");
        resetGame();
    }
}

function run() 
{
    requestAnimationFrame(function() { run(); });
    renderer.render( scene, camera );

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;

    KF.update();

    if(orbitControls)
        orbitControls.update();

    if(plane)
    {
        planeBox = new THREE.Box3().setFromObject(plane);
    }
    if(tree)
    {
        tree.position.z += 0.05; //movement
        if(tree.position.z > 10)
        {
            tree.position.z = -20;
            tree.position.x = Math.random() * 10 -5; //5 to -5
            updateScore();
        }
        treeBox = new THREE.Box3().setFromObject(tree);
    }
    if(cone)
    {
        cone.position.z += 0.02; //movement
        if(cone.position.z > 5)
        {
            cone.position.z = -20;
            cone.position.x = Math.random() * 10 -5; //5 to -5
            updateScore();
        }
        coneBox = new THREE.Box3().setFromObject(cone);
    }

    detectCollision();
}

function updateScore()
{
    score +=1;
    document.getElementById("score").innerHTML = "Score:"+score;
}

function resetGame()
{
    score = 0;
    document.getElementById("score").innerHTML = "Score:"+score;
    tree.position.z = -20;
    tree.position.x = Math.random() * 10 - 5; //5 to -5
    cone.position.z = -20;
    cone.position.x = Math.random() * 10 - 5; //5 to -5

    

}