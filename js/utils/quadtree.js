(function(root, factory){
    if(typeof define === 'function' && define.amd){
        define(["math","lalolib"], function(){
            math.import(numeric, { wrap: true, silent: true })
            return factory.call(root);
        });
    } else {
        root.qtree = factory.call(root);
    }     
}(this, function(){
    "use script";
    class Point{ // pontos com propriedades x e y
        constructor(x,y,z){
            this.x = Number(x);
            this.y = Number(y);
            this.peso = 0;
            this.z = Number(z);
            this.w = 1.0;
        }
        calcularPeso(){

        }
    }
    class Rectangle{ // retângulo que delimita a divisão dos subdomínio
        constructor(x,y,w,h,level,R,_support){
            this.x = x; 
            this.y = y;
            this.w = w;
            this.h = h;
            this._support = _support || .75;
            this.R = (Math.sqrt(Math.pow(this.w,2) + Math.pow(this.h,2))) * this._support; // raio d círculo de suporte = diagonal do nó;
            this.level = level;
        }
        contains(point, R=this.R){ // verifica se ponto está contido em quadrante
            var cx = this.x + this.w/2;
            var cy = this.y + this.h/2;

            var vx = point.x - cx;
            var vy = point.y - cy;

            var d = Math.sqrt(vx*vx + vy*vy)

            return ( d < R );

            // ############## Não usado
            // console.log(" >> testa pontos no Raio", this);
            
            // return(point.x >= this.x &&
            //     point.x <= this.x+this.w &&
            //     point.y >= this.y &&
            //     point.y <= this.y+this.h);
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
            this.cX = this.boundary.x  + (this.boundary.w)/2; // calcula o X do centro
            this.cY = this.boundary.y  + (this.boundary.h)/2; // calcula o Y do centro
            this._parent = {};          // registra o pai
            this.error = error || 0.1; // taxa de erro. default = 0.005
            this.coefs = [];
            this.weight = 0;

        }
        
        collectPoints (){  
            /* método para coletar pontos do nó e calcular erro */
            var _error = 0;
            var _coef = [];
            var f;
            // console.log(
            //     "this.points > ", this.points,
            //     "this.R > ", this.R,
            //     "this._parent > ", this._parent.points,                
            // );
            //for(var p in this.points){

            //}
            //console.log('### ', this);
            if(this.points.length == 0) {    
                return;
            }
            
            if(this.points.length < this._Nmin ){
                // procedimento para inclusão de novos pontos caso o 
                // número de pontos seja menos do que o número mínimo
                while( this.points.length < this._Nmin ){
                    for(var p1 in this._parent.points) {
                        if(this.boundary.contains( this._parent.points[p1], this.R1 )){
                            var exist = false;
                            for(var p0 in this.points) {
                                if(this._parent.points[p1] == this.points[p0]) {
                                    exist = true;
                                    break;
                                }
                            }
                            if(!exist) this.points.push(this._parent.points[p1]);
                        }
                    }
                    this.R1 = this.R1 + this._lambda;
                }
                
            }
            //if(this.level < 5){ // ### trava de segurança para evitar travamento
                f = this.calcula_mmq();
                _error = f._error;
                _coef = f._coef;
                //console.log('>> ', _coef)
            //}
            
            //console.log("Quantidade de pontos  no recipiente: ", this.points.length );
            /*  Condição de Parada da Recursão  
                Se o erro calculado for menos que limite e a quantidade de pontos
                no nó for maior que o mínimo, a regressão é calculada

                Caso contrário, a árvore se divide
            */
            //console.log(_error, " > " , this.error);
            if( _error > this.error && this.level < 5) {
                this.leaf = false; // se tem subdivisão, não é folha
               this.subdivide();
            } else {
                //console.log(    "_coef: ", _coef,
                //                 "R: ", this.R);
                this.coefs = _coef;
                
                //console.log(this.points);
                //this.calcula_mmq();
                //this.leaf = true;
                /* aqui preciso fazer um método de regressão dos pontos em uma linha (dois pontos) */
                //console.log(" Nó folha com ",this.points.length, " com erro de  >> ", _coef);
                //console.log(_error ,">", this.error);
                //return funcPeso //Retorna o vetor com peso e função
            }
        }
        // metodo para calcular a reta e retornar os pontos
        evaluateLine ( n, _cx, _cy, _cxx, _cxy ){
          // ############ TODO   
        }
        // metodo que calcula e retorna o erro máximo da regressão

        // Função que calcula curva da redução
        f_value( points, a0, a1 ,a2 ,a3 ,a4 ,a5 ){
            var result = [];
            for(var p in points){
                let x = points[p].x; 
                let y = points[p].y; 
                let r = a0 + 
                        a1*x +
                        a2*y +
                        a3*x*y +
                        a4*x*x +
                        a5*y*y;
                result.push(r);
                //console.log(r, " : ", y );
            }
            
            return result;
        }
        calcula_mmq(){
            //console.log("################");
            var A = math.zeros(this.points.length, 6); // define matriz de [n x 6]
            var L = math.zeros(this.points.length, 1); // define matriz de [n x 1]

            // Laço que percorre pontos para calcular os coeficientes
            for(var p =0; p<  this.points.length; p++){
                var x = this.points[p].x;
                var y = this.points[p].y;
                // preenche a matriz A com os valores [ 1 , x , y , x*y , x^2 , y^2 ] para cada linha
                A.subset(math.index(p, [0,1,2,3,4,5]), [1, x*1, y*1,x*y, x*x, y*y]);
                // preenche a matriz L com o valor [ 0 ] para cada linha
                L.subset(math.index(p, 0),0);
            }
            var At = math.transpose(A); // obtem a matriz transposta e armazena em At
            var S = math.multiply(At,A); // multiplica At x A em armazena em Ii
            var Sa = S._data;
            var Rv = ones(6,6)
            var count = 0;
            for(var i=0; i< Sa.length;i++){
                for(var j=0; j< Sa.length;j++){
                    Rv.val[count] = Sa[i][j];
                    count ++;
                }
            }
            var a = eigs(Rv,1,true);
            //var Id = math.identity(6); // cria matriz identidade [ 6 x 6 ]
            //var mId = math.multiply(Id,0); // multiplica Identidade por menor autovalor
            //var sAtA = math.subtract(S,mId); // subtrai At*A de identidade
            
            //var I = math.inv(sAtA); // inverte sAtA
            
            // como o valor de L é [0,0,0,0,0,0], o resultado da multiplicação a seguir é sempre [0,0,0,0,0,0]
            //var E = math.multiply(At,L); // multiplica a inversa pela transposta e armazena em E
            // como o valor de E é [0,0,0,0,0,0], o resultado da multiplicação a seguir é sempre [0,0,0,0,0,0]
            //var a = math.multiply(I,E); // multiplica E pela matriz com os valores de y e obtém a matriz de coeficientes
            // var _a = [  a.subset(math.index(0, 0)),
            //             a.subset(math.index(1, 0)),
            //             a.subset(math.index(2, 0)),
            //             a.subset(math.index(3, 0)),
            //             a.subset(math.index(4, 0)),
            //             a.subset(math.index(5, 0)),
            // 
            var _a = [a.u[0],a.u[1],a.u[2],a.u[3],a.u[4],a.u[5]];
            // após conhecer os coeficientes, calcula valor da f(x,y) como os valores de cada ponto
            // ao substituir com os valores de cada ponto do subdomínio
            var result = this.f_value( this.points, _a[0], _a[1], _a[2], _a[3], _a[4], _a[5] );
            // método para 
            var _maxerror = 0;
            for(var p in this.points){
                let r = result[p];
                let e = r;
                _maxerror = ( e > _maxerror ) ? e: Math.abs(_maxerror);
            }
            //retorna erro calculado e coeficientes da redução
            return {    
                        _error  : _maxerror,
                        _coef   : _a
                    }

        }
        subdivide(){
            //console.log("_______subdivide_______", this.level)
            let x = this.boundary.x;
            let y = this.boundary.y;
            let w = this.boundary.w/2;
            let h = this.boundary.h/2;
            
            this.level = this.level + 1;

            let ne = new Rectangle(x + w, y + h, w, h, this.level,this.R, this._support);
            this.northeast = new QuadTree(ne, this.capacity,this.level);
            
            let nw = new Rectangle(x, y + h, w, h, this.level, this.R, this._support);
            this.northwest = new QuadTree(nw, this.capacity,this.level);
            
            let se = new Rectangle(x + w, y, w, h, this.level, this.R, this._support);
            this.southeast = new QuadTree(se, this.capacity,this.level);
            
            let sw = new Rectangle(x, y, w, h, this.level, this.R, this._support);
            this.southwest = new QuadTree(sw, this.capacity,this.level);

            //loop para distribuir os pontos nos respectivos nós
            var t = this.points.length;
            while ( t > 0 ) {
                t--;
                //let n = this.points.pop();
                var n = this.points[t];
                if(this.northeast.boundary.contains(n)){
                    this.northeast._parent = this;
                    this.northeast.points.push(n);
                } 
                if(this.northwest.boundary.contains(n)){
                    this.northwest._parent = this;
                    this.northwest.points.push(n);
                } 
                if(this.southeast.boundary.contains(n)){
                    this.southeast._parent = this;
                    this.southeast.points.push(n);
                } 
                if(this.southwest.boundary.contains(n)){
                    this.southwest._parent = this;
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
        getGlobalFunction(){
            if (this.leaf){
                var a = this.coefs;
                 return a;
             } else {
                //smath.add(mId, Ii);
                //var sum = math.zeros(6, 1);
                var sum = [0,0,0,0,0,0];
                
                 var WNE = this.northeast.getGlobalFunction();
                 if(WNE.length < 6) WNE = [0,0,0,0,0,0];
                 var WNW = this.northwest.getGlobalFunction();
                 if(WNW.length < 6) WNW = [0,0,0,0,0,0];
                 var WSE = this.southeast.getGlobalFunction();
                 if(WSE.length < 6) WSE = [0,0,0,0,0,0];
                 var WSW = this.southwest.getGlobalFunction();
                 if(WSW.length < 6) WSW = [0,0,0,0,0,0];
                 for(var i=0; i<sum.length; i++){
                    sum[i] = WNE[i]+WNW[i]+WSE[i]+WSW[i]
                 }
                 //math.add(sum, WNE);
                 //math.add(WNE, WNW);
                 //math.add(WNW, WSE);
                 //smath.add(WSE, WSW);
                 return (sum);
             }
        }
        
        setLocalWeight(point) {
            var bspline = (15/16)*(1-this.R1*this.R1);
            return bspline*(3/2*this.R1)*(Math.pow(point.x - this.cX,2)+Math.pow(point.y - this.cY,2)); 
        }
        getLocalWeight(point){
            if(!this.boundary.contains(point)){
                return;
            }; 
            if (this.leaf){
                var w = this.setLocalWeight(point);
                return w;
                return "função do nó: " + this.nivel;
            } else {
                if(this.northeast.boundary.contains(point)){
                    return this.northeast.getLocalWeight(point);
                } 
                if(this.northwest.boundary.contains(point)){
                    return this.northwest.getLocalWeight(point);
                } 
                if(this.southeast.boundary.contains(point)){
                    return this.southeast.getLocalWeight(point);
                } 
                if(this.southwest.boundary.contains(point)){
                    return this.southwest.getLocalWeight(point);

                }
            
            }
        }
        getGlobalWeight(point){ 
            if (this.leaf){
               var w = this.setLocalWeight(point);
                return w;
            } else {
                var WNE = this.northeast.getGlobalWeight(point);
                var WNW = this.northwest.getGlobalWeight(point);
                var WSE = this.southeast.getGlobalWeight(point);
                var WSW = this.southwest.getGlobalWeight(point);
                return (WNE + WNW + WSE + WSW);
            }
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