(function(root, factory){
  if(typeof define === 'function' && define.amd){
      define(["webglUtils","qtree","m4"], function(){
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
  console.log(canvas);
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }
  function main() {
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
      let aspect = gl.canvas.clientWidth/gl.canvas.clientHeight
      //TODO: implementar matriz perspectiva, câmera e luz
      //var matrix = m4.perspective(fov,aspect,near,far);
      var matrix = m4.projection(gl.canvas.clientWidth,gl.canvas.clientHeight,500); // projeção temporária
      matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
      matrix = m4.xRotate(matrix, rotation[0]);
      matrix = m4.yRotate(matrix, rotation[1]);
      matrix = m4.zRotate(matrix, rotation[2]);
      matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

      // configura Matriz de transformação.
      gl.uniformMatrix4fv(matrixLocation, false, matrix);

      // Desenha Geometria.
      //var primitiveType = gl.TRIANGLES;
      //var primitiveType = gl.LINE_STRIP;
      var primitiveType = gl.LINES;
      //var primitiveType = gl.POINTS;
      var offset = 0;
      //gl.drawArrays(primitiveType, offset, totalPoints);

      // gl.bindBuffer(gl.ARRAY_BUFFER, positionRectanglesBuffer);
      gl.drawArrays(primitiveType, offset, totalPoints);
      
      window.requestAnimationFrame(drawScene);
    }
  }

  //console.log(m4);

  // Processa dados do TXT
  function processDataFile(data){
      //captura quantidade de pontos dada na primeira linha do conjunto de dados
      totalPoints = data[0]*1; 
      // inicia variáveis de limites máx e min dos eixos X Y Z
      var maxX=0;
      var maxY=0;
      var maxZ=0;
      var minX=0;
      var minY=0;
      var minZ=0;

      // looping que percorre as linhas e monta o vetor de pontos
      for(let i=1; i<= totalPoints; i++){
         var vectorCoord = data[i].split(" ");
         vectorCoord[2] = 0;// torna o objeto em 2D;
         var x = vectorCoord[0]*1;
         var y = vectorCoord[1]*1;
         var z = vectorCoord[2]*1;
          vectorCoord.push("1.0");
          // atualiza variáveis de limites
          if(maxX<x) maxX = x;
          if(maxY<y) maxY = y;
          if(maxZ<z) maxZ = z;
          if(minX>x) minX = x;
          if(minY>y) minY = y;
          if(minZ>z) minZ = z;
      }
      console.log("maxX: ", maxX,
                  "minX: ", minX,
                  "maxZ: ", maxZ,
                  "minZ", minZ);

      //  armazena maior valor para montagem nos limites do quadrado
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
      // adiciona espaço ao redor do limites da figura
      let safet = .5;
      minX-= safet; maxX+= safet; minY-= safet; maxY+= safet;
      //cria as bordas do QuadTree
      let boundary = new qtree.Rectangle(minX, minY, maxX-minX, maxY-minY);
      // Inicia o QuadTree
      let qt = new qtree.QuadTree(boundary, totalPoints, 0);
      //qt.callPoints();
      // Adiciona os pontos ao qt
      for(let i = 1; i<=totalPoints; i++){
        let vectorCoord = data[i].split(" ");
          let m = new qtree.Point(vectorCoord[0], vectorCoord[1], vectorCoord[2]);
          qt.insert(m);
      }
      // coleta os pontos do qt para processar os MPUs
      qt.collectPoints(qt);

      // coleta pontos para que delimitam os quadrantes do QuadTree.
      var rect = qt.arrayBoundary_fn(); // teste

      // imprime na tela os valores dos limites da figura
      var text = "> <b>boundary:</b> <br/>";
      text += "maxX: "+ maxX + ", ";
      text += "minX: "+ minX + ", ";
      text += "maxY: "+ maxY + ", ";
      text += "minY: "+ minY + ", ";
      var debug = document.getElementById("info");
      debug.innerHTML = text;
      console.log(qt);
      qt.rect = rect; // adiciona coordenadas dos retangulos como propriedades do objeto qt
      //retorna objeto qt para montagem do VBO
    return (qt);
    
  }
  // recebe valor e direciona carregamento
  function informFileBox() {
      var file_name = prompt("Qual o arquivo deseja abrir? ", "2torus");
      if (file_name != null) {
        loadExternalTextFile(file_name)
      } else {
        loadInternalText()
      }
  }
  // carrega dados internos do círculo
  function loadInternalText(){
    let text = drawCircle(10);
    let lines = text.split("\n"); // separa linhas e insere no Vetor
    objectsAll = processDataFile(lines); // processa dados e monta no objeto
    main(); 
  }
  //carrega arquivo de dados externo
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
              }
          }
      }
      txtFile.send(null);
  }
  // converte radianos em angulo
  function radToDeg(r) {
    return r * 180 / Math.PI;
  }
  //converte angulo em radianos
  function degToRad(d) {
    return d * Math.PI / 180;
  }
  // Desenha Circulo caso cancele o carregamento do arquivo externo
  function drawCircle(radius){
    
    let text = "360\n";
    var x;
    var y;
    
     for(var i = 0; i< 360; i++){
        x = radius * Math.sin(degToRad(i)) + (.2*Math.random()-.2);
        y = radius * Math.cos(degToRad(i)) + (.2*Math.random()-.2);
        text += x + " " + y + " " + "0.0\n"
     }
     return text;
  }
  var positionVBO =[];
  var colorVBO = [];

  // converte dados do VBO de posição para 32bits
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
  // converte dados do VBO de cores para 32bits
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
  // monta o objeto geometrico no VBO
  function setGeometry(gl) {
    for (var obj in objectsAll.points) {
      positionVBO.push(objectsAll.points[obj]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, convert32Bits(positionVBO), gl.STATIC_DRAW);
  }
  
  function setColors(gl) {
    for (var obj in objectsAll.points) {
      colorVBO.push( [0.0,0.0, 1.0, 1.0] );
    }
    gl.bufferData(gl.ARRAY_BUFFER, convert32BitsColor(colorVBO), gl.STATIC_DRAW);
  }
  // inicia aplicação a caixa de diálogo
  informFileBox(); 
  
  return {
        main: main,
        playing:playing,
        objectsAll:objectsAll,
        gl:gl,
    };
  }));