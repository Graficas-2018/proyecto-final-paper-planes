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

