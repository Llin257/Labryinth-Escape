"use strict";

var canvas;
var gl;

var numTimesToSubdivide = 5;

var index = 0;

var pointsArray = [];
var normalsArray = [];
var newpointsArray = [];


var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
var myMatrix;

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalMatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var actionQueue = [];

//var worldViewMatrix;
//var worldViewMatrixLoc；

function triangle(a, b, c) {

     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t2, t1));
     normal = vec4(normal); 

     normalsArray.push(normal);
     normalsArray.push(normal);
     normalsArray.push(normal);

     //console.log(a);
     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);

     index += 3;
     //return normal
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);

}

function enqueueTranslation(direction) {
    actionQueue.push(['translation',direction]);

    dequeueAction();
}

function dequeueAction() {
    if (actionQueue.length == 0) { //isRotating()) {
        return;
    }
    // If an action is possible, pop off the action parameters
    var nextAction = actionQueue.shift();

    // Check if next action is a translation or rotation
    var currentAction = nextAction[0];
    if (currentAction == 'translation') {
        var translationDir = nextAction[1];
        console.log(translationDir);
        //currSphere.canTranslate('left');
        //translationAxis = nextAction[2];
        //translationDirAlongAxis = nextAction[3];
    } else if (currentAction == 'rotation') {
        /*
        rotationFace = nextAction[1];
        rotationDir = nextAction[2];
        rotationAxis = nextAction[3];
        // This triggers the render function to start drawing the rotation
        rotationAngle = 0;
        rotationSpeed = rotationSpeedTemp;
        */
    }
}


window.onload = function init() {
    //console.log(modelViewMatrix);
    //console.log(projectionMatrix);

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);


    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    document.onkeydown = function(e) {
            myMatrix = vec4(va, vb, vc, vd); //Position matrix
            console.log(myMatrix);
            switch (e.keyCode) {
                case 37: // left
                    enqueueTranslation('left');
                    e.preventDefault();
                    va = mult(translate(-1,0,0), va);
                    vb = mult(translate(-1,0,0), vb);
                    vc = mult(translate(-1,0,0), vc);
                    vd = mult(translate(-1,0,0), vd);
                    index = 0;
                    pointsArray = [];
                    normalsArray = [];
                    init();
                    //console.log(va);
                    //console.log(myMatrix);
                    break;

                case 38: // up 
                    enqueueTranslation('up');
                    e.preventDefault();
                    break;
                case 39: // right 
                    var i;
                    var j;
                    enqueueTranslation('right');
                    e.preventDefault();
                    console.log(pointsArray[0]);
                    //var firstpoint = pointsArray[0][0];
                    //console.log(mult(translate(1,0,0),firstpoint[0]));
                    for (i=0; i <pointsArray.length; i++){
                        newpointsArray.push(mult(translate(1,0,0,0),pointsArray[i]))
                        
                    }
                    //va = mult(translate(1,0,0), va);
                    //vb = mult(translate(1,0,0), vb);
                    //vc = mult(translate(1,0,0), vc);
                    //vd = mult(translate(1,0,0), vd);
                    index = 0;
                    //pointsArray = [];
                    //normalsArray = [];
                    //console.log(newpointsArray);
                    init();
                    return newpointsArray;
                    break;
                case 40: // down 
                    enqueueTranslation('down');
                    e.preventDefault();
                    break;

            }
        }

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(newpointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //worldViewMatrixLoc = gl.getUniformLocation(program, "worldViewMatrix");
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    document.getElementById("Button0").onclick = function(){radius *= 2.0;};
    document.getElementById("Button1").onclick = function(){radius *= 0.5;};
    document.getElementById("Button2").onclick = function(){theta += dr;};
    document.getElementById("Button3").onclick = function(){theta -= dr;};
    document.getElementById("Button4").onclick = function(){phi += dr;};
    document.getElementById("Button5").onclick = function(){phi -= dr;};

    document.getElementById("Button6").onclick = function(){
        numTimesToSubdivide++;
        index = 0;
        pointsArray = [];
        normalsArray = [];
        init();
    };
    document.getElementById("Button7").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        index = 0;
        pointsArray = [];
        normalsArray = [];
        init();
    };


    gl.uniform4fv( gl.getUniformLocation(program,
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),materialShininess );
     
    initEventListeners();
    render();
}


function initEventListeners() {
    // Event listeners for keys
   
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
    //worldViewMatrix = mat4();
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];


    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
         gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );


    for( var i=0; i<index; i+=3)
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    window.requestAnimFrame(render);
}
