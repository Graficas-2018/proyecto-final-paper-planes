var container;
var camera, scene, raycaster, renderer;
var mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
var radius = 100, theta = 0;
var plane;
var currentTime = Date.now();
var animation = "run";
var tag = null;
var animator = null;
var score = 0;
var reset = null;
var count = 0;
var grass = "images/grass.jpg";

async function createLand(y)
{
    console.log("creating land");

    // Create a texture map
    var map = new THREE.TextureLoader().load(grass);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(25, 10, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));

    mesh.position.set(0, y, 0);
    
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
            object.position.set(0,0,1);
            object.scale.set(70, 70, 70);
            object.rotation.set(THREE.Math.degToRad(90), THREE.Math.degToRad(0), THREE.Math.degToRad(0));
            scene.add(object);
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
    scene.background = new THREE.Color( 0xf0f0f0 );
    
    // Camera setup
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );
    camera.position.set(0, 0, 16);
    camera.rotation.set(0,0,0)
    scene.add(camera);

    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 1, 100 );
    scene.add( light );

    await createPlane();
    await createLand(0);

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
    window.addEventListener( 'resize', onWindowResize);
}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function run() 
{
    requestAnimationFrame(function() { run(); });
    renderer.render( scene, camera );

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;;
    KF.update();
}
