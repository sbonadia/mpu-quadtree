(function(root, factory){
    if(typeof define === 'function' && define.amd){
        define([], function(){
            return factory.call(root);
        });
    } else {
        root.qtree = factory.call(root);
    }
}(this, function(){
    "use script";
    class Point{ // pontos com propriedades x e y
        constructor(x,y,z){
            this.x = x;
            this.y = y;
            this.peso;
            this.z = z;
            this.w = 1.0;
        }
        calcularPeso(){

        }
    }
    class Rectangle{ // retângulo que delimita a divisão dos subdomínio
        constructor(x,y,w,h,R,_support,level){
            this.x = x; 
            this.y = y;
            this.w = w;
            this.h = h;
        }
        contains(point){ // verifica se ponto está contido em quadrante
            return(point.x >= this.x &&
                point.x <= this.x+this.w &&
                point.y >= this.y &&
                point.y <= this.y+this.h);
        }
    }
    

    class QuadTree {
        constructor(boundary, n, level, error){
            this.boundary = boundary;   // limites do quadrante
            this.capacity = n;          // capacidade de pontos no nó
            this.points = [];           // pontos dentro do nó
            this.level = level;         // nível do nó na árvore
            this.leaf = true;           // flag para identificar nó folha
            this._Nmin = 15;            // quantidade mínima de pontos no nó
            this._lambda = 0.1;         // fator de incremento para englobar mais pontos
            this._support = 0.75;       // tamanho do raio do circulo de suporte. 75% da diagonal do nó
            this.R = (Math.sqrt(Math.pow(this.boundary.w,2) + Math.pow(this.boundary.h,2))) * this._support; // raio d círculo de suporte = diagonal do nó
            this.R1 = this.R;           // raio do círculo de incremento
            this.error = error || 0.005; // taxa de erro. default = 0.005
        }
        collectPoints (){
            /* método para coletar pontos do nó e calcular erro */
            if(this.points.length == 0) {
                return;
            }
            /* ############### Esse bloco não está em uso ################ */ 
            // var n = this.points.length; // quantidade de pontos nó nó;
            // var _cx = 0;    // somatório de x
            // var _cy = 0;    // somatório de y
            // var _cxy = 0;   // somatório de x*y
            // var _cxx = 0;   // somatório de x*x
            
            // for( var p in this.points) { // laço para calcular os somatórios
            //     _cx += this.points[p].x*1;
            //     _cy += this.points[p].y*1;
            //     _cxy += this.points[p].x*1 * this.points[p].y*1;
            //     _cxx += this.points[p].x*1 * this.points[p].x*1;
            // }
            // _cx /= n; // calculo das médias
            // _cy /= n;
            // _cxy /= n;
            // _cxx /= n;
            /* ########################## até aqui ######################### */

            //console.log(" n: " , n , "\n _cx: " , _cx ,"\n _cy: " , _cy , "\n _cxx: " ,_cxx ,"\n _cxy: " , _cxy)
            var _error = 0
            if(this.points.length > this._Nmin){
                _error = this.calcula_mmq();
            } 
            //this.evaluateError(n, _cx,_cy,_cxx,_cxy); // chama método de calculo do mmq
            //console.log("Quantidade de pontos  no recipiente: ", this.points.length );
            /*  Condição de Parada da Recursão  
                Se o erro calculado for menos que limite e a quantidade de pontos
                no nó for maior que o mínimo, a regressão é calculada

                Caso contrário, a árvore se divide
            */
           
            if( _error > this.error) {
                //console.log("Erro calculado ", _error , " # Erro limite: ", this.error);
                this.leaf = false; // se tem subdivisão, não é folha
               this.subdivide();
            } else {
                //this.calcula_mmq();
                //this.leaf = true;
                /* aqui preciso fazer um método de regressão dos pontos em uma linha (dois pontos) */
                console.log(" Nó folha com ",this.points.length, " com erro de  >> ", _error);
                //console.log(_error ,">", this.error);
            }
        }
        // metodo para calcular a reta e retornar os pontos
        evaluateLine ( n, _cx, _cy, _cxx, _cxy ){
          // ############ TODO   
        }
        // metodo que calcula e retorna o erro máximo da regressão
        calcula_mmq(){
            //console.log("################");
            var A = math.zeros(this.points.length, 3);
            var L = math.zeros(this.points.length, 1);
            for(var p =0; p<  this.points.length; p++){
                var x = this.points[p].x;
                var y = this.points[p].y;
                A.subset(math.index(p, [0,1,2]), [1, x*1, x*x]);  
                L.subset(math.index(p, 0), y);  
            }
            var At = math.transpose(A);
            //console.log("At: ", At);
            var Ii = math.multiply(At,A);
            //console.log("Ii: ", Ii);
            var I = math.inv(Ii);
            var E = math.multiply(I,At);
            var a = math.multiply(E,L);
            //console.log(a);
            var result = [];
            for(var p in this.points){
                let x = this.points[p].x; 
                let r = a.subset(math.index(0,0)) + 
                        a.subset(math.index(1,0))*x +
                        a.subset(math.index(2,0))*x*x;
                result.push(r);
            }
            var _maxerror = 0;
            for(var p in this.points){
                let y = this.points[p].y; 
                let e = result[p] - y;
                _maxerror = (_maxerror < e ) ? _maxerror : e;
            }
            //console.log(_maxerror);
            return Math.abs(_maxerror);

        }
        evaluateError ( n, _cx, _cy, _cxx, _cxy ){ // Método não utilizado
            var a = _cx * _cy - _cx / _cx*_cx - _cxx;
            var b = _cy - a*_cx;
            var _error = 0;
            for( var p in this.points) {
                var e = Math.abs((a*this.points[p].x + b) - this.points[p].y);
                if(_error < e){
                    _error = e;
                }
            }
            //console.log("a: ", a, " # b: ", b, " # _error: ", _error);
            return _error;
        }
        subdivide(){
            console.log("_______subdivide_______", this.level)
            let x = this.boundary.x;
            let y = this.boundary.y;
            let w = this.boundary.w/2;
            let h = this.boundary.h/2;
            
            this.level = this.level + 1;

            let ne = new Rectangle(x + w, y + h, w, h);
            this.northeast = new QuadTree(ne, this.capacity,this.level);
            
            let nw = new Rectangle(x, y + h, w, h);
            this.northwest = new QuadTree(nw, this.capacity,this.level);
            
            let se = new Rectangle(x + w, y, w, h);
            this.southeast = new QuadTree(se, this.capacity,this.level);
            
            let sw = new Rectangle(x, y, w, h);
            this.southwest = new QuadTree(sw, this.capacity,this.level);

            //loop para distribuir os pontos nos respectivos nós
            var t = this.points.length;
            while ( t > 0 ) {
                t--;
                //let n = this.points.pop();
                var n = this.points[t];
                if(this.northeast.boundary.contains(n)){
                    this.northeast.points.push(n);
                } else if(this.northwest.boundary.contains(n)){
                    this.northwest.points.push(n);
                } else if(this.southeast.boundary.contains(n)){
                    this.southeast.points.push(n);
                } else if(this.southwest.boundary.contains(n)){
                    this.southwest.points.push(n);

                }
                
            }
            // chama método de calculo de erro para cada nó filho
            this.northeast.collectPoints();
            this.northwest.collectPoints();
            this.southeast.collectPoints();
            this.southwest.collectPoints();
            
            this.divided = true;

        }
        insert(point){ 
            if(!this.boundary.contains(point)){
                return;
            };
            if (this.points.length < this.capacity){
                this.points.push(point);
                return true;
            } else {
                if(!this.divided) {
                    this.subdivide();
                    
                }
                if(this.northeast.insert(point)){
                    return true;
                } else if(this.northwest.insert(point)){
                    return true;
                } else if(this.southeast.insert(point)){
                    return true;
                } else if (this.southwest.insert(point)) {
                    return true;
                }
            
            }
        }
        drawline(){
            // ####### TODO    
        }
        
    }
    return {
        QuadTree: QuadTree,
        Rectangle: Rectangle,
        Point: Point
        
    };
}));