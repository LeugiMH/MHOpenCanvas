/* SOCKET IO */

//Socket Conn
const socket = io();

//get roomName
const cookie = document.cookie.split("; ").find((row) => row.startsWith("roomName="));
var roomName = cookie.split("=")[1];

function start(){
    //Emit join Requisition 
    socket.emit("setup", roomName);
    console.log(`Conectado à sala: ${roomName}`);

    alert("Usar orientação paisagem em tela cheia para melhor experiência");

    //Start Game Area
    myGameArea.start();
}

socket.on("teste", (teste) => {
    console.log(teste);
});
//Return room Connection
socket.on("conn.Room", (mensagem) => {
    console.log("Alguém se conectou à sala");
});

/* -- SOCKET IO -- */

/* CANVAS */

//Toggle FullScreen
function fullScreen()
{
    
    var body = document.getElementById("body");

    //chamando tela cheia
    if(!document.fullscreenElement){
        body.requestFullscreen();
    }
    else
    {
        document.exitFullscreen();
    }
    
}

const sombraMouse = document.querySelector(".cursor");
var mouseDown = false;
var brush;

//Definindo a gamearea 
var myGameArea = {
    canvas: document.getElementById("canvas"),
    start: function()
    {
        this.canvas.width = 1600;
        this.canvas.height = 600;
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(updateGameArea, 10);
    }
}


//Atualizando a gamearea
function updateGameArea() {

    //Definindo chamando a função 'desenhar' baseado na movimentação do mouse quando o mouse está pressionado
    if(mouseDown == true){
        myGameArea.canvas.addEventListener("mousemove", desenhar);
    }
    //Retirando a chamada da função desenhar
    else{
        myGameArea.canvas.removeEventListener("mousemove", desenhar);
    }
    /* sombra pincel
    window.addEventListener("mousemove", sombra);
    */
    
    //Para Touch Screen
    myGameArea.canvas.addEventListener("touchmove", desenhar); 
    
}

//Definindo o mouse como pressionado ou não 
addEventListener("mousedown", function(){mouseDown = true;},false);
addEventListener("mouseup", function(){mouseDown = false;},false);

function desenhar (move){
    
    //definindo borracha, cor e tamanho.
    const borracha = document.getElementById("borracha");
    const cor = document.getElementById("cor").value;
    const tamanho = document.getElementById("tamanho").value;

    //Decidindo se é touch ou mouse
    if(move.type == "touchmove")
    {
        var objDesenho = {
            x: move.touches[0].pageX * (myGameArea.canvas.width / document.documentElement.clientWidth),
            y: move.touches[0].pageY * (myGameArea.canvas.width / document.documentElement.clientWidth),
            cor: cor,
            tamanho: tamanho,
            borracha: borracha.checked,
            radius: move.touches[0].radiusX,
            roomName: roomName
        }
    }
    else{
        var objDesenho = {
            x: move.pageX * (myGameArea.canvas.width / document.documentElement.clientWidth),
            y: move.pageY * (myGameArea.canvas.width / document.documentElement.clientWidth),
            cor: cor,
            tamanho: tamanho,
            borracha: borracha.checked,
            roomName: roomName
        }
        
    }
    
    /*Debug Desenho
    *console.log(objDesenho);
    */
    //Emit Drawn info
    socket.emit('desenhar', objDesenho);

    //test mode mode 
    /*
    if(objDesenho.borracha.checked)
    {
        brush = new desenho(objDesenho.x, objDesenho.y, objDesenho.cor, objDesenho.tamanho, objDesenho.radius);
        brush.apagar();
    }
    else
    {
        brush = new desenho(objDesenho.x, objDesenho.y, objDesenho.cor, objDesenho.tamanho, objDesenho.radius);
        brush.update();
    }
    */
}

//Sombra do pincel Teste
/*
function sombra(mouse)
{
    console.log(sombraMouse);
    var mouseX = mouse.offsetX;
    var mouseY = mouse.offsetY - sombraMouse.offsetTop;
    var tamanho = document.getElementById("tamanho").value;

    sombraMouse.style = `display: block; width:${tamanho}px; height:${tamanho}px;`;
    sombraMouse.style.transform = `translate3d(${mouseX - (tamanho/2)}px, ${mouseY - (tamanho/2)}px, 0)`;
    
};*/

//Get older draws, and draws it again
socket.on('desenhosAntigos', function(obj) {
    for(pincelada of obj)
    {
        if(pincelada.roomName == roomName)
        {
            if(pincelada.borracha)
            {
                brush = new desenho(pincelada.x, pincelada.y, pincelada.cor, pincelada.tamanho, pincelada.radius);
                brush.apagar();
            }
            else
            {
                brush = new desenho(pincelada.x, pincelada.y, pincelada.cor, pincelada.tamanho, pincelada.radius);
                brush.update();
            }
        }
    }
});

//Draws emitting drawns
socket.on('desenho', function(obj) {
    if(obj.borracha)
    {
        brush = new desenho(obj.x, obj.y, obj.cor, obj.tamanho, obj.radius);
        brush.apagar();
    }
    else
    {
        brush = new desenho(obj.x, obj.y, obj.cor, obj.tamanho, obj.radius);
        brush.update();
    }
});

//Draws on canvas function
function desenho(x, y, color, size, radius) 
{
    if(radius)
    {

        this.x = x - (size/2) - (radius/2);
        this.y = y - (size/2) - (radius/2);
        this.color = color;
        this.size = size;
    }
    else
    {
        this.x = x - (size/2);
        this.y = y - (size/2);
        this.color = color;
        this.size = size;
    }
    this.update = function()
    {
        ctx = myGameArea.context;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    },
    this.apagar = function(){
        ctx = myGameArea.context;
        ctx.clearRect(this.x, this.y, this.size, this.size);
    }
}


/* -- CANVAS -- */