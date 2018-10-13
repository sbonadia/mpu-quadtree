let qtree;

function setup(){
    createCanvas(400,400);

    let boundary = new Rectangle(200, 200, 200, 200);
    qtree = new QuadTree(boundary, 4);

    console.log(qtree);

    // for(let i = 0; i< 50; i++ ){
    //     let p = new Point(random(width), random(height));
    //     qt.insert(p);
    // }
}
function draw(){
    if(mouseIsPressed){
        for(let i = 0; i<5; i++){
            let m = new Point(mouseX + random(-5,5), mouseY + random(-5,5));
            qtree.insert(m);
        }
    }
    background(0);
    qtree.show();
}