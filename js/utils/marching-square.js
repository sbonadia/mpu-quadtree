(function(root, factory){
    if(typeof define === 'function' && define.amd){
        define([qtree, math], function(){
            return factory.call(root);
        });
    } else {
        root.marchsquare = factory.call(root);
    }     
}(this, function(){
    "use script";
    class Point{ // pontos com propriedades x e y
        constructor(x,y,z){
            this.x = Number(x);
            this.y = Number(y);
            this.z = Number(z);
            this.w = 1.0;
        }
    }
    class MarchingSquare {
        constructor(minX,minY,maxX,maxY,res,f){
            this.minX = minX;
            this.minY = minY;
            this.maxX = maxX;
            this.maxY = maxY;
            this.func = f || function(x,y){   
                return Math.pow((0.6*(Math.pow(x,2)+0.7*Math.pow(y,2))-1),3)-(1.8*Math.pow(x,2)*0.6*Math.pow(y,3)); // Heart: ( a*x^2 + b*y^2 -1 )^3 - c*x^2 * d*y^3 = 0
                //return Math.pow(y,2) - Math.pow(x,3) + 3*x - 1.5;// Elipse curva # y^2 = x^3 + a*x + b
                //return Math.pow(y,3)-y - 1.1*(Math.pow(x,3) + x); // Elegante de Euler # y^3 - y = a * (x^3 - x)
                //return Math.pow(y,2) + Math.pow(x,2) - Math.pow(10,2); // ## Círculo de raio 100 # a*x^2 + b*y^2 = c^2

            };
            this.res = res;

        }
        globalFunction(point, qt){
            var x = point.x;
            var y = point.y;
            //var localWeights = qt.getLocalWeight(point);
            //var totalWeights = qt.getGlobalWeight(point);
            
            var a = qt.getGlobalFunction();  
            //console.log(a)
            //var mpu = localWeights/totalWeights;
            //return Math.pow(y,2) + Math.pow(x,2) - Math.pow(10,2); // ## Círculo de raio 100 # a*x^2 + b*y^2 = c^2
            //return Math.pow(y,2) - Math.pow(x,3) + 3*x - 1.5;
            //return Math.pow((0.6*(Math.pow(x,2)+0.7*Math.pow(y,2))-1),3)-(1.8*Math.pow(x,2)*0.6*Math.pow(y,3)); // Heart: ( a*x^2 + b*y^2 -1 )^3 - c*x^2 * d*y^3 = 0
            return (a[0] +a[1]*x +a[2]*y +a[3]*x*y +a[4]*x*x +a[5]*y*y)  
        }
        render(qt){
            // 0 - vertice abaixo da faixa
            // 1 - vertice em cima da faixa
            // 2 - vertice abaixo da faixa

            //console.log(this.globalFunction({x:1,y:2},qt)());

            var stepX = (this.maxX-this.minX)/this.res; // define tamanho da unidade de linha
            var stepY = (this.maxY-this.minY)/this.res; // define tamanho da unidade de coluna
            
            var points = []; // vetor para armazenar os pontos do MarchingSquare 
            var c = 0; // valor de f(x,y) 

            for(var x = this.minX; x < this.maxX; x += stepX){      // looping que percorre as linha
                for(var y = this.minY; y < this.maxY; y += stepY){  // looping que percorre as coluna
                    //this.func  = this.globalFunction({x:x,y:y},qt)()
                    //console.log(this.globalFunction( { x:x,y:y },qt ));
                    var z1 = 10+this.globalFunction( { x:x,y:y },qt );				// canto inferior esquerdo
                    var z2 = 10+this.globalFunction( { x:x + stepX, y:y },qt );			// canto inferior direito
                    var z4 = 10+this.globalFunction( { x:x + stepX, y:y + stepY },qt );	// canto superior direito
                    var z8 = 10+this.globalFunction( { x:x, y:y + stepY },qt );			// canto superior esquerdo
                    
                    //var z1 = this.func( x,y);				// canto inferior esquerdo
                    //var z2 = this.func( x + stepX, y );	    // canto inferior direito
                    //var z4 = this.func( x + stepX, y + stepY ); 	// canto superior direito
                    //var z8 = this.func( x, y + stepY );		// canto superior esquerdo

                    var n = 0; // variável auxiliar para calcular cantos positivos e negativos
                    if (z1 > c) n += 1; // +1 para canto esquedo inferior positivo
                    if (z2 > c) n += 2; // +2 para canto direito inferior positivo
                    if (z4 > c) n += 4; // +4 para canto direito superior positivo
                    if (z8 > c) n += 8; // +8 para canto esquedo superior positivo
                    
                    // calcula posição mediana de cada lado de acordo com o stepX e stepY
                    var bottomInterp 	= (c - z1) / (z2 - z1) * stepX;
                    var topInterp 		= (c - z8) / (z4 - z8) * stepX;
                    var leftInterp 		= (c - z1) / (z8 - z1) * stepY;
                    var rightInterp 	= (c - z2) / (z4 - z2) * stepY;
                    
                    // diagramas retirados de: https://en.wikipedia.org/wiki/Marching_squares
                    if (n == 1 || n == 14) // canto inferior esquerdo
                        points.push( new Point( x , y+leftInterp , c ), new Point( x+bottomInterp, y, c ));

                    else if (n == 2 || n == 13) // canto inferior direito
                        points.push( new Point( x+bottomInterp, y, c ), new Point( x+stepX, y+rightInterp, c ));

                    else if (n == 4 || n == 11) // canto superior direito
                        points.push( new Point( x+topInterp, y+stepY, c ), new Point( x+stepX, y+rightInterp, c ));
                        
                    else if (n == 8 || n == 7) // canto superior esquerdo
                        points.push( new Point( x, y+leftInterp, c ), new Point( x+topInterp, y+stepY, c ));
                        
                    else if (n == 3 || n == 12) // horizontal
                        points.push( new Point( x, y+leftInterp, c ), new Point( x+stepX, y+rightInterp, c ));

                    else if (n == 6 || n == 9) // vertical
                        points.push( new Point( x+bottomInterp, y, c ), new Point( x+topInterp, y+stepY, c ));
                        
                    else if (n == 5) // should do subcase // lower left & upper right
                        points.push( new Point( x, y+leftInterp, c ), new Point( x+bottomInterp, y, c ), new Point( x+topInterp, y+stepY, c ), new Point( x+stepX, y+rightInterp, c ));
                        
                    else if (n == 10) // should do subcase // lower right & upper left
                        points.push( new Point( x+bottomInterp, y, c ), new Point( x+stepX, y+rightInterp, c ), new Point( x, y+stepY/2, c ), new Point( x, y+leftInterp, c ), new Point( x+topInterp, y+stepY, c ));
                    
                    else if (n == 0 || n == 15) // sem linhas no grid.
                        points.push();
                    
                }
            }
            for (var n = 0; n < points.length; n += 2 ){
                //edgeArray.push( points[n], points[n+1] );
            }
            return points;
        }    
    }
    return {
        MarchingSquare: MarchingSquare
        
    };
}));