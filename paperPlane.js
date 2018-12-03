var container;
var camera, scene, raycaster, renderer;
var mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
var radius = 100, theta = 0;
var plane = null, planeBox = null,
land = null,
cone = null, coneBox = null,
tree = null, energy = null;
var treeBox = [];
var trees = [];
var treeSpawn = []; //time for the respawn
var treeMap = []; //flag for the tree presence

var announcements = []; //mesh
var annBox = []; //
var annSpawn = []; //time for the respawn
var annMap = []; //flag for the presence

var signs = []; //mesh
var signBox = []; //
var signSpawn = []; //time for the respawn
var signMap = []; //flag for the presence

var extraTime = 5; //extra spawn time
var minTime = 2; //min spawn time
var currentTime = Date.now();
var animation = "run";
var tag = null;
var animator = null;
var score = 0;
var stamina = 0;
var reset = null;
var count = 0;
var grass = "images/grass.jpg";
var sky = "images/sky.png";
var post = "images/post.jpg"
var speed = 0.1
var start = false;
var pause = false;
var msd = 50; //minimum spawn distance

var orbitControls = null;

function spawnTime()
{
    return Math.random() * minTime + extraTime;
}
function firstSpawn() //just for the first time
{
    return Math.random() * 45 + 1;
}
function randomX()
{
    var posx;
    posx = Math.floor(Math.random() * 20) + 1;
    posx *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
    return posx;
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
            object.scale.set(1.2, 1.2, 1.2);
            object.position.set(Math.floor(Math.random() * 15) + 1, -1, 11);
            object.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(0), THREE.Math.degToRad(0));
            scene.add(object);
            trees.push(object);
            treeBox.push(new THREE.Box3().setFromObject(object));
            treeSpawn.push(firstSpawn());
            treeMap.push(false);

            for (var i = 0; i <= 20; i++)
                {
                    posx = Math.floor(Math.random() * 20) + 1;
                    posx *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
                    tree = object.clone();
                    tree.position.set(posx, -1.5 , 11);
                    scene.add(tree);
                    trees.push(tree);
                    tempCol = new THREE.Box3().setFromObject(tree)
                    treeBox.push(tempCol);
                    treeSpawn.push(firstSpawn());
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

async function createAnnouncement()
{
    var postmap = new THREE.TextureLoader().load(post);
    postmap.wrapS = postmap.wrapT = THREE.RepeatWrapping;
    postmap.repeat.set(1,1);
    var geometry = new THREE.CylinderGeometry( 0.75, 0.75, 10, 32 );
    var material = new THREE.MeshPhongMaterial( {color: 0x606060, map:postmap} );
    var geometry2 = new THREE.BoxGeometry(12,4,2);
    var material2 = new THREE.MeshBasicMaterial({color: 0xbfb663});
    var tube;
    var box;
    var xPos;
    for(var i = 0; i < 3; i++)
    {
        box = new THREE.Mesh( geometry2, material2); //create the box
        xPos = randomX();
        box.position.set(xPos,2,11); //position of the box
        annBox.push(new THREE.Box3().setFromObject(box));
        announcements.push(box);
        scene.add(box);

        tube = new THREE.Mesh( geometry, material ); //left tube
        tube.position.set(xPos-4 ,-2.5,11); //always -4 to the center
        announcements.push(tube);
        annBox.push(new THREE.Box3().setFromObject(tube));
        scene.add(tube);

        tube = new THREE.Mesh( geometry, material ); //right tube
        tube.position.set(xPos+4 ,-2.5,11); //always +4 to the center
        announcements.push(tube);
        annBox.push(new THREE.Box3().setFromObject(tube));
        scene.add(tube);
        var spawn = firstSpawn();

        for(var j = 0; j <= 3; j++) //add the corresponding three elements 
        {
            annSpawn.push(spawn);
            annMap.push(false);
        }
    }
    console.log("Announcements completed");
}

async function createSign()
{
    var postmap2 = new THREE.TextureLoader().load(post);
    postmap2.wrapS = postmap2.wrapT = THREE.RepeatWrapping;
    postmap2.repeat.set(1,1);
    var geometry = new THREE.CylinderGeometry( 0.15, 0.15, 10, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0x6b6b6a, map:postmap2} ); //tube
    var textureMap = new THREE.TextureLoader().load("./images/sign.png");
    var material2 = new THREE.MeshPhongMaterial({ color: 0xededed, map: textureMap});
    var geometry2 = new THREE.CubeGeometry(2, 0.1, 2);

    var tube;
    var sign;
    var xPos;
    for(var i = 0; i < 8; i++)
    {
        //character = new THREE.Mesh(geometry, material);
        sign = new THREE.Mesh( geometry2, material2); //create the box
        xPos = randomX();
        sign.position.set(xPos,0,11); //position of the box
        sign.rotation.set(Math.PI/2,0,0); //position of the box
        signBox.push(new THREE.Box3().setFromObject(sign));
        signs.push(sign);
        scene.add(sign);


        tube = new THREE.Mesh( geometry, material ); //left tube
        tube.position.set(xPos ,-6,11); //-6 y
        signs.push(tube);
        signBox.push(new THREE.Box3().setFromObject(tube));
        scene.add(tube);

        var spawn = firstSpawn();

        for(var j = 0; j < 2; j++) //add the corresponding three elements 
        {
            signSpawn.push(spawn);
            signMap.push(false);
        }
    }
    console.log("Signs completed");
}

async function createEnergy()
{
    energy = new THREE.Mesh((new THREE.SphereGeometry(1, 20, 20)),(new THREE.MeshBasicMaterial({ map:new THREE.TextureLoader().load("images/sunmap.jpg")})));
    energy.scale.set(0.5,0.5,0.5);
    energy.position.set(Math.floor(Math.random() * 15) + 1, 5, 10);
    scene.add(energy);
}

/*async function createcone()
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
*/
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
            duration: 900
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
   // await createcone();
    await createAnnouncement();
    await createSign();
    await createEnergy();

    stamina = Date.now() + 105000;

    animations(land);

    score_l = $("#score");
    reset = $("#reset");
    startB = $("#start");
    title = $("#title");
    staminaL = $("#stamina");
    result = $("#result");

    startB.removeClass("hidden");
    title.removeClass("hidden");

    $("#start").click(() =>{
        start = true;
        score = 0;
        startB.addClass("hidden");
        title.addClass("hidden");
        score_l.text("Score:0");
    });

    $("#reset").click(() =>{
        score = 0;
        reset.addClass("hidden");
        score_l.text("Score:0");
        location.reload();
    });

    document.addEventListener('keydown', onDocumentKeyDown);
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

function onDocumentKeyDown(event)
{
    var keyCode = event.which;

    if (keyCode == 32 && pause == false)
    {
        pause = true;
        console.log("pause");
    }
    else if(keyCode == 32 && pause == true)
    {
        pause = false;
        console.log("unpause");
    }
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

function lose()
{
    reset.removeClass("hidden");
    console.log("lost")
    result.text(" YOU LOST !")
    pause = true;
}

function detectCollision()
{
    if(planeBox && treeBox.length > 0) //trees
    {
        var index = 0;
        for( let t of treeBox)
        {
            t = new THREE.Box3().setFromObject(trees[index]);
            if (planeBox.intersectsBox(t))
            {
                console.log("Tree Collision");
                lose();
            }
                
            index = index + 1;

        }
        //resetGame();
    }

    if(planeBox && annBox.length > 0) //announcements
    {
        var index = 0;
        for( let a of annBox)
        {
            a = new THREE.Box3().setFromObject(announcements[index]);
            if (planeBox.intersectsBox(a))
            {
                lose();
                console.log("Announcement Collision");
            }
            index = index + 1;
        }
        //resetGame();
    }

    if(planeBox && signBox.length > 0) //signs
    {
        var index = 0;
        for( let a of signBox)
        {
            a = new THREE.Box3().setFromObject(signs[index]);
            if (planeBox.intersectsBox(a))
            {
                lose();
                console.log("Sign Collision");
            }
            index = index + 1;
        }
        //resetGame();
    }

    energyBox = new THREE.Box3().setFromObject(energy);
    if(planeBox.intersectsBox(energyBox))
    {
        stamina += 1000;
        score += 1;
        console.log("Energy obtained")
    }

    /*if(planeBox && coneBox && planeBox.intersectsBox(coneBox))
    {
        console.log("cone Collision");
        //resetGame();
    }*/
}

function run() 
{
    
    requestAnimationFrame(function() { run(); });
    renderer.render( scene, camera );

    if(!pause)
    KF.update();

    if(start)
    {
        var now = Date.now();
        var deltat = now - currentTime;
        currentTime = now;
        if(!pause)
        {
            if(orbitControls)
            orbitControls.update();

            if(plane) //plane's collider
            planeBox = new THREE.Box3().setFromObject(plane);

            //increase spawn speed
            if(score / 50 > 5)
                extraTime = 0;
            else if(score / 50 > 4)
                extraTime = 1;
            else if(score / 50 > 3)
                extraTime = 2;
            else if(score / 50 > 2)
                extraTime = 3;
            else if(score / 50 > 1)
                extraTime = 4;
            
            if (score != 0 && score % 10 == 0)
                speed += 0.0001;

            //spawn tree check
            var index = 0;
            for(let t of treeMap)
            {
                if(t == false && treeSpawn[index] <= 0) //not in the map and time is 0
                {
                    posx = Math.floor(Math.random() * 16) + 0.5;
                    posx *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
                    posz = Math.floor(Math.random() * 30) + msd;
                    posz *= -1;
                    trees[index].position.z = posz;
                    trees[index].position.x = posx;
                    treeMap[index] = true;
                }

                treeSpawn[index] = treeSpawn[index] - 0.01;
                index = index + 1;
            }

            //announcements' spawn check
            index = 0;
            for(var a = 0; a < announcements.length; a++)
            {
                if(annMap[a] == false && annSpawn[index] <= 0 && (a % 3) == 0) //not in the map and time is 0
                {
                    posx = Math.floor(Math.random() * 16) + 0.5;
                    posx *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
                    posz = Math.floor(Math.random() * 30) + msd;
                    posz *= -1;

                    //three parts for just one obstacle
                    announcements[a].position.z = posz;
                    announcements[a].position.x = posx;
                    annMap[a] = true;


                    announcements[a+1].position.z = posz;
                    announcements[a+1].position.x = posx-4;
                    annMap[a+1] = true;


                    announcements[a+2].position.z = posz;
                    announcements[a+2].position.x = posx+4;
                    annMap[a+2] = true; 

                }
                annSpawn[a] = annSpawn[a] - 0.01;
            }

            //signs' spawn check
            index = 0;
            for(var a = 0; a < signs.length; a++)
            {
                if(signMap[a] == false && signSpawn[index] <= 0 && (a % 2) == 0) //not in the map and time is 0
                {
                    posx = Math.floor(Math.random() * 16) + 0.5;
                    posx *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
                    posz = Math.floor(Math.random() * 30) + msd;
                    posz *= -1;

                    //three parts for just one obstacle
                    signs[a].position.z = posz;
                    signs[a].position.x = posx;
                    signMap[a] = true;


                    signs[a+1].position.z = posz;
                    signs[a+1].position.x = posx;
                    signMap[a+1] = true;
                }
                signSpawn[a] = signSpawn[a] - 0.01;
            }

            //announcements
            for(var a = 0; a < announcements.length; a++)
            {
                announcements[a].position.z += speed; //movement
                if( announcements[a].position.z > 10 && annMap[a] == true && (a % 3) == 0) //if announcement is in the screen and is the first piece
                {
                    updateScore();
                    var spawn = spawnTime();
                    annMap[a] = false; //not in screen
                    annSpawn[a] = spawn; //new spawn time

                    annMap[a+1] = false; //not in screen
                    annSpawn[a+1] = spawn //new spawn time

                    annMap[a+2] = false; //not in screen
                    annSpawn[a+2] = spawn; //new spawn time

                }
            }

            //signs
            for(var a = 0; a < signs.length; a++)
            {
                signs[a].position.z += speed; //movement
                if( signs[a].position.z > 10 && signMap[a] == true && (a % 2) == 0) //if announcement is in the screen and is the first piece
                {
                    updateScore();
                    var spawn = spawnTime();
                    signMap[a] = false; //not in screen
                    signSpawn[a] = spawn; //new spawn time

                    signMap[a+1] = false; //not in screen
                    signSpawn[a+1] = spawn //new spawn time
                }
            }

            //trees
            index = 0;
            for (let t of trees)
            {
                t.position.z += speed; //movement
                if(t.position.z > 10)
                {
                    if(treeMap[index] == true) //if tree is in the screen
                    {
                        updateScore();
                        treeMap[index] = false; //not in screen
                        treeSpawn[index] = spawnTime(); //new spawn time
                    }
                }
                index = index + 1;
            }
            // energy sphere

            energy.position.z += speed;
            if(energy.position.z > 10)
            {
                var sposx = Math.floor(Math.random() * 7) + 1;
                sposx *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
                energy.position.set(sposx, Math.floor(Math.random() * 3) + 1, -120);
            }
            /*if(cone)
            {
                cone.position.z += 0.02; //movement
                if(cone.position.z > 5)
                {
                    cone.position.z = -20;
                    cone.position.x = Math.random() * 10 -10; //5 to -5
                    updateScore();
                }
                coneBox = new THREE.Box3().setFromObject(cone);
            }*/

            staminaL.text("Stamina:" + Math.round((stamina - now)/1000));
            if (Math.round((stamina - now)/1000) <= 0)
                lose();
            detectCollision();
        }
    }
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
    //cone.position.z = -20;
    //cone.position.x = Math.random() * 10 - 5; //5 to -5
}