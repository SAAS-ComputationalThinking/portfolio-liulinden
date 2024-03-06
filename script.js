const canvas = document.getElementById('cvs')
const txt = document.getElementById('text')
document.addEventListener("keydown", keyDown)
document.addEventListener("keyup", keyUp)

const dpr = Math.ceil(window.devicePixelRatio || 1);
canvas.width=canvas.clientWidth*dpr;
canvas.height=canvas.clientHeight*dpr;

const ctx=canvas.getContext('2d')

function gameloop(){
    player.tick(upArrow,downArrow,leftArrow,rightArrow);
    updateScreenDim()
    drawFrame()
    requestAnimationFrame(gameloop)
}

function keyDown(event){
    switch (event.key){
        case ('ArrowDown'):
            downArrow=true;
            break;
        case ('ArrowLeft'):
            leftArrow=true;
            break;
        case ('ArrowRight'):
            rightArrow=true;
            break;
        case ('ArrowUp'):
            upArrow=true;
            break;
    }
}

function keyUp(event){
    switch (event.key){
        case ('ArrowDown'):
            downArrow=false;
            break;
        case ('ArrowLeft'):
            leftArrow=false;
            break;
        case ('ArrowRight'):
            rightArrow=false;
            break;
        case ('ArrowUp'):
            upArrow=false;
            break;
    }
}

function drawFrame(){
    player.draw()
    for (let i=0;i<objects.length;i++){
        if (activated.length>0){
            if(objects[i] ==activated[0]) objects[i].activate()
            else objects[i].deactivate()
        }
        objects[i].draw()
    }
    ctx.fillStyle="black";
    ctx.fillRect(0,Math.max(0,floorHeight),canvas.width,canvas.height)
}

function updateScreenDim(){
    canvas.width=canvas.clientWidth*dpr;
    canvas.height=canvas.clientHeight*dpr;
}

class Player{
    constructor(startx,starty,width=70,height=90){
        this.x=startx
        this.y=starty
        this.checkX=startx
        this.checkY=starty
        this.width=width
        this.height=height
        this.xSpeed=0
        this.ySpeed=0
        this.onGround=false;
    }
    tick(up=false,down=false,left=false,right=false){
        activated=[]
        this.ySpeed+=2
        if (this.onGround) this.xSpeed*=0.6;
        else this.xSpeed*=0.9
        if (this.onGround && up){
            this.ySpeed-=35;
        }
        if (right){
            if (this.onGround) this.xSpeed+=6;
            else this.xSpeed+=1
        }
        if (left){
            if (this.onGround) this.xSpeed-=6;
            else this.xSpeed-=1
        }
        let falling=this.ySpeed>0
        this.moveX();
        this.onGround= this.moveY() && falling;
        if (this.y>1500) {
            this.x=this.checkX
            this.y=this.checkY
            this.xSpeed=0
            this.ySpeed=0
            activated=[new Empty()]
        }
        if (this.xSpeed>13) direction="right";
        else if (this.xSpeed<-13) direction="left";
        if (direction=="right") scrollXGoal=this.x-700
        else scrollXGoal=this.x-1400;
        scrollXGoal=Math.max(0,scrollXGoal)
        scrollX+=(scrollXGoal-scrollX)/20
    }
    moveY(){ //returns whether or not it collided
        if (this.isSolidColliding()){
            console.log("stuck in wall");
            return true;
        }
        this.y+=this.ySpeed;
        if (this.isSolidColliding()){
            if (this.ySpeed>0){
                while (this.isSolidColliding()) this.y-=5;
                while (!this.isSolidColliding()) this.y+=1;
                this.y-=1;
            } else{
                while (this.isSolidColliding()) this.y+=5;
                while (!this.isSolidColliding()) this.y-=1;
                this.y+=1;
            }
            this.ySpeed=0
            return true;
        }
        return false;
    }
    moveX(){
        if (this.isSolidColliding()){
            console.log("stuck in wall");
            return true;
        }
        this.x+=this.xSpeed;
        if (this.isSolidColliding()){
            if (this.xSpeed>0){
                while (this.isSolidColliding()) this.x-=5;
                while (!this.isSolidColliding()) this.x+=1;
                this.x-=1;
            } else{
                while (this.isSolidColliding()) this.x+=5;
                while (!this.isSolidColliding()) this.x-=1;
                this.x+=1;
            }
            this.xSpeed=0;
            return true;
        }
        return false;
    }

    isSolidColliding(floor=true){ //platform specific
        return this.collidesWithTypes(["platform","popup"],floor)
    }

    collidesWithTypes(types,floor=true){ //platform specific
        if (floor){
            if (this.y+this.height>floorHeight) return true;
        }
        for (let i=0;i<objects.length;i++){
            let inTypes=false
            for (let j=0;j<types.length;j++){
                if (objects[i].type==types[j]) {
                    inTypes=true
                    break
                }
            }
            if (!inTypes) continue
            if (this.collidesWith(objects[i])) {
                if (objects[i].type=="popup") activated.push(objects[i])
                return true;
            }
        }
        return false;
    }


    collidesWith(object){
        if (this.x<object.x+object.width && this.x+this.width>object.x && this.y<object.y+object.height && this.y+this.height>object.y) return true;
        else return false;
    }
    draw(){
        ctx.fillStyle='black'
        ctx.fillRect(Math.round(this.x-0.5-scrollX),Math.round(this.y-0.5),Math.round(this.width+1),Math.round(this.height+1))
        console.log()
    }
}

class Platform{
    constructor(x,y,width,height){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
        this.type="platform";
        this.color="black"
    }
    draw(){
        ctx.fillStyle=this.color;
        ctx.fillRect(Math.round(this.x-scrollX),Math.round(this.y),Math.round(this.width),Math.round(this.height))
    }
    activate(){

    }
    deactivate(){}
    print(){
        console.log(this.x,this.y,this.width,this.height)
    }
}

class PopUp{
    constructor(text,link,x,y){
        this.x=x;
        this.y=y;
        this.width=80;
        this.height=80;
        this.type="popup"
        this.color = "red"
        this.yOffset = 0;
        this.text=text;
        this.link=link
    }
    draw(){
        ctx.fillStyle=this.color;
        ctx.fillRect(Math.round(this.x-scrollX),Math.round(this.y+this.yOffset),Math.round(this.width),Math.round(this.height))
    }
    activate(){
        if (this.color=="red"){
            this.color="lime"
            txt.setAttribute("href",this.link)
            txt.innerHTML=this.text;
        }
    }
    deactivate(){
        if (this.color=="lime"){
            this.color="red"
        }
    }
    print(){
        console.log(this.x,this.y,this.width,this.height)
    }
}

class Empty{
    constructor(){

    }
    activate(){

    }
    deactivate(){}
}


var scrollX=0;
var scrollY=0;
var scrollXGoal=0;
var direction = "right";
var upArrow=false;
var downArrow=false;
var rightArrow=false;
var leftArrow=false;
var objects=[
    new Platform(0,500,300,1000),
    new Platform(800,400,300,50),
    new Platform(1865,0,50,600),
    new Platform(1800,800,400,50),
    new Platform(1900,800,200,1000),
    new Platform(2400,700,80,1000),
    new Platform(1865,550,300,50),
    new Platform(2720,650,250,1000),
    new PopUp("Guessing Game / Input Output","https://liulinden.github.io/software-dev-for-web/guessing%20game",600,500),
    new PopUp("Mood Board","https://liulinden.github.io/mood-board/",1400,700),
    new PopUp("Pattern Machine","https://maxshurst.github.io/pattern-machine/",1700,450),
    new PopUp("Flappy Bird","https://saas-computationalthinking.github.io/project-managing-genai-lauren-linden/",2000,300),
    new PopUp("Tetris","https://liulinden.github.io/tetris/",2800,500)
]
const floorHeight=2000
const player=new Player(100,100);
var activated = []
gameloop();