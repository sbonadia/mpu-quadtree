(function(root, factory){
  if(typeof define === 'function' && define.amd){
      define([], function(){
          return factory.call(root);
      });
  } else {
      root.mpuProject = factory.call(root);
  }
}(this, function(){
  "use strict";
  var playing = false;
  var objectsAll ={};
  var totalPoints = totalPoints;
  var canvas = document.getElementById("canvas");
  
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }
  function main(mdata) {
    // pega WebGL context
    /** @type { HTMLCanvasElement } */
   
    // configura GLSL program
    var program = webglUtils.createProgramFromScripts(gl, ["3d-vertex-shader", "3d-fragment-shader"]);

    // aponta para a variável do vertex shader (cor e posição)
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var colorLocation = gl.getAttribLocation(program, "a_color");

    // aponta para a variável de uniforms
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");

    // cria o buffer para a posição
    var positionBuffer = gl.createBuffer();
    // vincula o buffer com ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // envia os dados da geometria no buffer
    setGeometry(gl);
    
    // cria um buffer para as cores
    var colorBuffer = gl.createBuffer();
    // vincula o buffer com ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // envia os dados das cores da geometria para o buffer
    setColors(gl);

    // converte radianos em angulo
    function radToDeg(r) {
      return r * 180 / Math.PI;
    }
    //converte angulo em radianos
    function degToRad(d) {
      return d * Math.PI / 180;
    }

    // configurações iniciais do objeto X Y Z
    var translation = [440, 220, 0];
    var rotation = [0, 0, 0];
    var scale = [15, 15, 15];
    var currentAngle = 0;

    // desenha a cena
    drawScene()
    //
    let previousTime = 0.0;

    // Desena a cena
    function drawScene() {
      currentAngle += 0.01;
      webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    
      // informa ao WebGL tamanho do viewport
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0, 0, 0, 1);

      // limpa os buffers
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // habilita o culling
      gl.enable(gl.CULL_FACE);
      gl.enable(gl.DEPTH_TEST);
      
      // indica o program que será usado (shaders de vertice + shader de fragmento)
      gl.useProgram(program);

      // habilita o VAO de posições
      gl.enableVertexAttribArray(positionLocation);

      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      gl.vertexAttribPointer( positionLocation, 4, gl.FLOAT, false, 0, 0 );

      // Turn on the color attribute
      gl.enableVertexAttribArray(colorLocation);

      // Bind the color buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

      gl.vertexAttribPointer( colorLocation, 4, gl.FLOAT, false, 0, 0 );
      
      rotation = [currentAngle, currentAngle, currentAngle];
      
      // Computa as matrizes
      var matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
      matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
      matrix = m4.xRotate(matrix, rotation[0]);
      matrix = m4.yRotate(matrix, rotation[1]);
      matrix = m4.zRotate(matrix, rotation[2]);
      matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

      // configura Matriz uniforme.
      gl.uniformMatrix4fv(matrixLocation, false, matrix);

      // Desenha Geometria.
      //var primitiveType = gl.TRIANGLES;
      var primitiveType = gl.LINES;
      var offset = 0;
      gl.drawArrays(primitiveType, offset, totalPoints);

      window.requestAnimationFrame(drawScene);
    }
  }
  
  var m4 = {

    projection: function(width, height, depth) {
      // Note: This matrix flips the Y axis so 0 is at the top.
      return [
        2 / width, 0, 0, 0,
        0, -2 / height, 0, 0,
        0, 0, 2 / depth, 0,
        -1, 1, 0, 1,
      ];
    },

    multiply: function(a, b) {
      var a00 = a[0 * 4 + 0];
      var a01 = a[0 * 4 + 1];
      var a02 = a[0 * 4 + 2];
      var a03 = a[0 * 4 + 3];
      var a10 = a[1 * 4 + 0];
      var a11 = a[1 * 4 + 1];
      var a12 = a[1 * 4 + 2];
      var a13 = a[1 * 4 + 3];
      var a20 = a[2 * 4 + 0];
      var a21 = a[2 * 4 + 1];
      var a22 = a[2 * 4 + 2];
      var a23 = a[2 * 4 + 3];
      var a30 = a[3 * 4 + 0];
      var a31 = a[3 * 4 + 1];
      var a32 = a[3 * 4 + 2];
      var a33 = a[3 * 4 + 3];
      var b00 = b[0 * 4 + 0];
      var b01 = b[0 * 4 + 1];
      var b02 = b[0 * 4 + 2];
      var b03 = b[0 * 4 + 3];
      var b10 = b[1 * 4 + 0];
      var b11 = b[1 * 4 + 1];
      var b12 = b[1 * 4 + 2];
      var b13 = b[1 * 4 + 3];
      var b20 = b[2 * 4 + 0];
      var b21 = b[2 * 4 + 1];
      var b22 = b[2 * 4 + 2];
      var b23 = b[2 * 4 + 3];
      var b30 = b[3 * 4 + 0];
      var b31 = b[3 * 4 + 1];
      var b32 = b[3 * 4 + 2];
      var b33 = b[3 * 4 + 3];
      return [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
      ];
    },

    translation: function(tx, ty, tz) {
      return [
        1,  0,  0,  0,
        0,  1,  0,  0,
        0,  0,  1,  0,
        tx, ty, tz, 1,
      ];
    },

    xRotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);

      return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
      ];
    },

    yRotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);

      return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
      ];
    },

    zRotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);

      return [
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ];
    },

    scaling: function(sx, sy, sz) {
      return [
        sx, 0,  0,  0,
        0, sy,  0,  0,
        0,  0, sz,  0,
        0,  0,  0,  1,
      ];
    },

    translate: function(m, tx, ty, tz) {
      return m4.multiply(m, m4.translation(tx, ty, tz));
    },

    xRotate: function(m, angleInRadians) {
      return m4.multiply(m, m4.xRotation(angleInRadians));
    },

    yRotate: function(m, angleInRadians) {
      return m4.multiply(m, m4.yRotation(angleInRadians));
    },

    zRotate: function(m, angleInRadians) {
      return m4.multiply(m, m4.zRotation(angleInRadians));
    },

    scale: function(m, sx, sy, sz) {
      return m4.multiply(m, m4.scaling(sx, sy, sz));
    },

  };

  var positionVBO =[];
  var colorVBO = [];

  function convert32Bits(arr){
    var arr32 = new Float32Array(arr.length*4);
    var count = 0;
    for(var i=0; i<arr.length; i++){
      let temp = [arr[i].x,arr[i].y,arr[i].z,arr[i].w];
      for(var k=0; k<4; k++){
        arr32[count] = temp[k];
        //console.log(count, ' -- > ', arr32[count]);
        count++;
      }
    }
    
    return arr32;
  } 
  function convert32BitsColor(arr){
    var arr32 = new Float32Array(arr.length*4);
    var count = 0;
    for(var i=0; i<arr.length; i++){
      for(var j = 0; j < 4; j++){
        arr32[count] = arr[i][j];
        count++;  
      }
      
    }
    return arr32;
  } 

  class objectData{
    constructor(id, coord, normal){
      this.id = id;
      this.coord = coord;
      this.normal = normal;
    }
}
  function processDataFile(data){
      totalPoints = data[0];
      let allObjects = {};
      
      var maxX=0;
      var maxY=0;
      var maxZ=0;
      var minX=0;
      var minY=0;
      var minZ=0;

      for(let i=1; i<= totalPoints; i++){
         var vectorCoord = data[i].split(" ");
         var x = vectorCoord[0]*1;
         var y = vectorCoord[1]*1;
         var z = vectorCoord[2]*1;
          vectorCoord.push("1.0");
          if(maxX<x) maxX = x;
          if(maxY<y) maxY = y;
          if(maxZ<z) maxZ = z;
          if(minX>x) minX = x;
          if(minY>y) minY = y;
          if(minZ>z) minZ = z;
          vectorCoord[2] = 0; // torna o objeto em 2D;
          allObjects[i] = new objectData(i,vectorCoord , data[i+totalPoints*1].split(" "));
      }
      console.log("maxX: ", maxX,
                  "minX: ", minX,
                  "maxZ: ", maxZ,
                  "minZ", minZ);
      if(minX<minY) {
        minY = minX;
      } else {
        minX = minY;
      }
      if(maxX>maxY) {
        maxY = maxX;
      } else {
        maxX = maxY;
      }

      let boundary = new qtree.Rectangle(minX, minY, maxX, maxY);
      let qt = new qtree.QuadTree(boundary, totalPoints, 0);

      for(let i = 1; i<=totalPoints; i++){
        let vectorCoord = data[i].split(" ");
          let m = new qtree.Point(vectorCoord[0], vectorCoord[1]);
          qt.insert(m);
      }
      qt.drawline();
      
      console.log(qt);
    
    return (qt);
    
  }

  function informFileBox() {
      var file_name = prompt("Qual o arquivo deseja abrir? ", "2torus");
      if (file_name != null) {
        loadExternalTextFile(file_name)
      }
  }
  function loadExternalTextFile(file_name){
      var txtFile = new XMLHttpRequest();
      var name = "data/"+file_name+".pwn" || "data/2torus.pwn";
      txtFile.open("GET", name, true);
      txtFile.onreadystatechange = function() {
          if (txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
              if (txtFile.status === 200) {  // Makes sure it's found the file.
                  let allText = txtFile.responseText;
                  
                  let lines = txtFile.responseText.split("\n"); // Will separate each line into an array
                  objectsAll = processDataFile(lines);
                  main();
                 
                  return {
                    objectsAll:objectsAll
                  }
              }
          }
      }
      txtFile.send(null);
      
  }
  
  function setGeometry(gl) {
    //console.log(objectsAll.points);
    for (var obj in objectsAll.points) {
      positionVBO.push(objectsAll.points[obj]);
    }
    //console.log(positionVBO);
    gl.bufferData(gl.ARRAY_BUFFER, convert32Bits(positionVBO), gl.STATIC_DRAW);
  }
  function setColors(gl) {
    for (var obj in objectsAll.points) {
      colorVBO.push( [0.0,0.0, 1.0, 1.0] );
    }
    gl.bufferData(gl.ARRAY_BUFFER, convert32BitsColor(colorVBO), gl.STATIC_DRAW);
  }
  informFileBox();
  return {
        main: main,
        playing:playing,
        objectsAll:objectsAll,
        gl:gl,
    };
  }));