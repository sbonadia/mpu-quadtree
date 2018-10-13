(function(root, factory){
    if(typeof define === 'function' && define.amd){
        define([], function(){
            return factory.call(root);
        });
    } else {
        root.webglUtils = factory.call(root);
    }
}(this, function(){
    "use script";
    var topWindow = this;
    

    function isInIFrame(w){
        w = w || topWindow;
        return w !== w.top;
    }
    if (!isInIFrame()) {
        //console.log("%c%s", 'color:blue;font-weight:bold;', 'for more about webgl-utils.js see:');  // eslint-disable-line
        //console.log("%c%s", 'color:blue;font-weight:bold;', 'http://webglfundamentals.org/webgl/lessons/webgl-boilerplate.html');  // eslint-disable-line
    }
    function error(msg) {
        if (topWindow.console) {
            if (topWindow.console.error) {
            topWindow.console.error(msg);
            } else if (topWindow.console.log) {
            topWindow.console.log(msg);
            }
        }
    }
    function compilerShader(gl, shaderSource, shaderType){
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader,shaderSource);
        gl.compileShader(shader);

        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if(!success) {
            throw "não foi possível compilar o shader. " + gl.getShaderInfoLog(shader);
        }
        return shader;
    }
    function createProgram(gl, vertexShader, fragmentShader){
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);

        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if(!success){
            throw "não foi possível linkar o programa" + gl.getProgramInfoLog(program);
        }
        return program;
    }
    function createShaderFromScript(gl, scriptId, optsShaderType){
        var shaderScript = document.getElementById(scriptId);
        if (!shaderScript) {
            throw "script não encontrado " + scriptId;
        }
        var shaderSource = shaderScript.text;
        if(!optsShaderType){
            if(shaderScript.type == "x-shader/x-vertex"){

            } else if(shaderScript.type == "x-shader/x-fragment"){

            } else {
                throw "tipo de shader não definido."
            }
        }
        return compilerShader(gl,shaderSource,optsShaderType);
    }
    function createProgramFromScripts(gl, shaderScriptIds){
        var vertexShader = createShaderFromScript(gl, shaderScriptIds[0], gl.VERTEX_SHADER);
        var fragmentShader = createShaderFromScript(gl, shaderScriptIds[1], gl.FRAGMENT_SHADER);
        return createProgram(gl, vertexShader, fragmentShader);
    }
    function resizeCanvasToDisplaySize(canvas, multiplier) {
        multiplier = multiplier || 1;
        var width  = canvas.clientWidth  * multiplier | 0;
        var height = canvas.clientHeight * multiplier | 0;
        if (canvas.width !== width ||  canvas.height !== height) {
          canvas.width  = width;
          canvas.height = height;
          return true;
        }
        return false;
    }
    
    
    return {
        compilerShader: compilerShader,
        createProgram: createProgram,
        createShaderFromScript: createShaderFromScript,
        createProgramFromScripts: createProgramFromScripts,
        resizeCanvasToDisplaySize:resizeCanvasToDisplaySize,
        
    };
}));