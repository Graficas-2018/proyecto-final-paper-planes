var container;
var camera, scene, raycaster, renderer;
var mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
var radius = 100, theta = 0;
var plane = null, planeBox = null,
land = null,
cone = null, coneBox = null,
tree = null;
var treeBox = [];
var trees = [];
var extraTime = 5; //extra spawn time
var minTime = 2; //min spawn time
var treeSpawn = []; //time for the respawn
var treeMap = []; //flag for the tree presence
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

function spawnTime()
{
    return Math.random() * minTime + extraTime;
}

async function createLand(y)
{
    console.log("creating land");

    // Create a texture map
    var map = new THREE.TextureLoader().load(grass);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    land = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));

    land.position.set(0, -4, 0);
    land.rotation.set(THREE.Math.degToRad(-89), THREE.Math.degToRad(0), 0);
    
    // Add the mesh to our group
    scene.add( land );
    land.castShadow = false;
    land.receiveShadow = true;
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
            object.material = new THREE.MeshPhongMaterial({ map:0xf919191});
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
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.load( "objects/lowpolytree.mtl", function( materials ) {
    materials.preload();
    var loader = new THREE.OBJLoader();
    loader.setMaterials(materials);
    // load a resource
    loader.load(
    // resource URL
        "objects/lowpolytree.obj",
    // called when resource is loaded
        function ( object ) 
        {
            object.material = new THREE.MeshPhongMaterial({ map:0xf0f0f0});
            object.scale.set(1, 1, 1);
            object.position.set(Math.floor(Math.random() * 15) + 1, -0.1, 11);
            object.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(0), THREE.Math.degToRad(0));
            scene.add(object);
            trees.push(object);
            treeBox.push(new THREE.Box3().setFromObject(object));
            treeSpawn.push(spawnTime());
            treeMap.push(false);

            for (var i = 0; i <= 20; i++)
                {
                    posx = Math.floor(Math.random() * 20) + 1;
                    posx *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
                    tree = object.clone();
                    tree.position.set(posx, 0 , 11);
                    scene.add(tree);
                    trees.push(tree);
                    tempCol = new THREE.Box3().setFromObject(tree)
                    treeBox.push(tempCol);
                    treeSpawn.push(spawnTime());
                    treeMap.push(false);

                }
        },
    // called when loading is in progresses
    function ( xhr ) { console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ); },
    // called when loading has errors
    function ( error ) { console.log( 'An error happened' );}
    );
    });
}

async function createcone()
{
    var coneMap = new THREE.TextureLoader().load("objects/Texture/TCone.png");
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.load( "objects/trafficcone.mtl", function( materials ) {
    materials.preload();
    var loader = new THREE.OBJLoader();
    loader.setMaterials(materials);
    // load a resource
    loader.load(
    // resource URL
        "objects/trafficcone.obj",
    // called when resource is loaded
        function ( object ) 
        {
            object.material = new THREE.MeshPhongMaterial({ map:coneMap});
            object.position.set(0,-2,0);
            object.scale.set(0.4, 0.4, 0.4);
            object.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(0), THREE.Math.degToRad(0));
            scene.add(object);
            cone = object;
        },
    // called when loading is in progresses
    function ( xhr ) { console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ); },
    // called when loading has errors
    function ( error ) { console.log( 'An error happened' );}
    );
    });
}

function animations(obj)
{
    if (obj)
    {
        grassAnimator = new KF.KeyFrameAnimator;
        grassAnimator.init({ 
            interps:
                [
                    { 
                        keys:[0, 1], 
                        values:[
                                { x : 0, y : 0 },
                                { x : 0, y : 1 },
                                ],
                        target:obj.material.map.offset
                    },
                ],
            loop: true,
            duration: 1000
        });
        grassAnimator.start();
    }
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

    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    light.position.set( 0, 15, 25 );
    scene.add( light );

    await createPlane();
    await createLand(0);
    await createTree();
    await createcone();

    animations(land);

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
    plane.position.copy(pos);
}

function detectCollision()
{
    if(planeBox && treeBox.length > 0)
    {
        var index = 0;
        for( let t of treeBox)
        {
            t = new THREE.Box3().setFromObject(trees[index]);
            if (planeBox.intersectsBox(t))
                console.log("Tree Collision");
            index = index + 1;

        }
        //resetGame();
    }

    if(planeBox && coneBox && planeBox.intersectsBox(coneBox))
    {
        console.log("cone Collision");
        //resetGame();
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

    //spawn tree check
    var index = 0;

    for(let t of treeMap)
    {
        if(t == false && treeSpawn[index] <= 0) //not in the map and time is 0
        {
            posx = Math.floor(Math.random() * 16) + 0.5;
            posx *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
            posz = Math.floor(Math.random() * 30) + 15;
            posz *= -1;
            trees[index].position.z = posz;
            trees[index].position.x = posx;
            trees[index].position.y = -0.1;
            treeMap[index] = true;
        }

        treeSpawn[index] = treeSpawn[index] - 0.01;
        index = index + 1;
    }

    if(plane)
        planeBox = new THREE.Box3().setFromObject(plane);

    //trees
    index = 0;
    for (let t of trees)
    {
        t.position.z += 0.1; //movement
        if(t.position.z > 10)
        {
            /*
            posx = Math.floor(Math.random() * 16) + 0.5;
            posx *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
            posz = Math.floor(Math.random() * 30) + 15;
            posz *= -1;
            t.position.z = posz;
            t.position.x = posx;
            t.position.y = -0.1;*/
            if(treeMap[index] == true)
            {
                updateScore();
                treeMap[index] = false;
                treeSpawn[index] = spawnTime();
            }
        }
        index = index + 1;
    }

    
    if(cone)
    {
        cone.position.z += 0.02; //movement
        if(cone.position.z > 5)
        {
            cone.position.z = -20;
            cone.position.x = Math.random() * 10 -10; //5 to -5
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