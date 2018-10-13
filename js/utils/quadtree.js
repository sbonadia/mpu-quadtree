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
        constructor(x,y){
            this.x = x;
            this.y = y;
            this.z = 0.0;
            this.w = 1.0;
        }
    }
    class Rectangle{ // retângulo que delimita a divisão dos subdomínio
        constructor(x,y,w,h, level){
            this.x = x; 
            this.y = y;
            this.w = w;
            this.h = h;
            this.cx = (w)/2;
            this.cy = (h)/2;
            this.level = level || null;
            this.leaf = true;
            this.Nmin = 15;
        }
        
        collectPoints(points, level){
            let count = 0;
            let ListN = [];
            let e = 0;
            if(points.lenght > this.Nmin){
                for(var i in points){
                    ListN.push(points[i]);
                    //console.log(level+' > '+ points[i].x + points[i].y+ this.cx + this.cy);
                    //count++;
                }
                //e = evaluateFunction(ListN, this.cx, this.cy);
            }
            
            //console.log(level+' > '+ this.x + this.y+ this.cx + this.cy);
            return ;
        }
        evaluateFunction(ListN, cx, cy){
            let count = 0;
            for(var i in ListN){
                let d = Math.sqrt((ListN[i].x-cx)*(ListN[i].x-cx) + (ListN[i].y-cy)*(ListN[i].y-cy))
                count ++;
                //ListN.push(points[i]);
                //console.log(ListN[i].level+' > '+ ListN[i].x + " : " + ListN[i].y+ " : " + this.cx + " : " + this.cy + " : " +  d);
                //count++;
            }
            console.log( d );
            return true;
            //return error;
            
        }
        contains(point){
            return(point.x >= this.x &&
                point.x <= this.w &&
                point.y >= this.y &&
                point.y <= this.h);
        }
    }
    

    class QuadTree {
        constructor(boundary, n, level){
            this.boundary = boundary;
            this.capacity = n;
            this.points = [];
            this.level = level;
            this._Nmin = n;
            this._lambda = 0.1;
            this._support = 0.75;
            this.R = (Math.sqrt(Math.pow(this.boundary.w,2) + Math.pow(this.boundary.h,2))) * this._support;
            this.R1 = this.R;
            
        }
        subdivide(){

            let x = this.boundary.x;
            let y = this.boundary.y;
            let w = this.boundary.w/2;
            let h = this.boundary.h/2;
            
            this.level = this.level + 1;

            let ne = new Rectangle(x + w, y - h, w, h);
            this.northeast = new QuadTree(ne, this.capacity,this.level);
            let nw = new Rectangle(x - w, y - h, w, h);
            this.northwest = new QuadTree(nw, this.capacity,this.level);
            let se = new Rectangle(x + w, y + h, w, h);
            this.southeast = new QuadTree(se, this.capacity,this.level);
            let sw = new Rectangle(x - w, y + h, w, h);
            this.southwest = new QuadTree(sw, this.capacity,this.level);

            //ne.collectPoints(this.points,this.level);
            //nw.collectPoints(this.points,this.level);
            //se.collectPoints(this.points,this.level);
            //sw.collectPoints(this.points,this.level);

            this.divided = true;

        }
         /*computeMaxError(points){
            for(var i in points){
                //console.log(points[i].x, points[i].y);
            }
        }
       (a, b) {
            let error = 0
            for (let i = 0; i < a.length; i++) {
                error += Math.pow((b[i] - a[i]), 2)
            }
            return error / a.length
        }*/
        
        insert(point){
            if(!this.boundary.contains(point)){
                return;
            };
            //var e = this.boundary.collectPoints(this.points,this.level);
            //let e = this.boundary.evaluateFunction(ListN,this.boundary.cx, this.boundary.cy);
            
           //if(e){
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
            //while(point!=null){
            // stroke(255);
            // noFill();
            // rectMode(CENTER);
            // strokeWeight(1);
            // rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2 );
            // if(this.divided){
            //     this.northeast.show();
            //     this.northwest.show();
            //     this.southeast.show();
            //     this.southwest.show();
            // }
            // for(let p of this.points){
            //     strokeWeight(4);
            //     point(p.x, p.y);
            // }
            // }
            return this.points;
            //console.log(this.points);    
        }
        
    }
    return {
        QuadTree: QuadTree,
        Rectangle: Rectangle,
        Point: Point
        
    };
}));