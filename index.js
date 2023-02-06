/* DEFININDO CONSTANTES */

const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});

const port = 3000;

const public = __dirname + "/public/";

/* ---DEFININDO CONSTANTES--- */


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

/* REDIRECIONAMENTO */

app.get('/', (req, res) => {
    res.sendFile(public + "html/Home.html");
});
app.post("/Quadro", (req, res) => {
    
    //get room name form
    var roomName = req.body.inputName;

    //clear old room cookies
    res.clearCookie(roomName);

    //Definindo Cookies
    res.cookie("roomName",roomName);

    //redirect to Quadro.html
    res.sendFile(public + "html/Quadro.html");
});

//página não encontrada
app.use((req, res) => {
    res.status(404).sendFile(public + "html/404.html");
});

/* ---REDIRECIONAMENTO--- */
    
let desenhosAntigos = [];

/* SOCKET.IO */
io.on("connection", (socket) => {
    console.log("Usuário conectado!");
    
    console.log(desenhosAntigos);
    var roomName; 
       
    
    //socket join room, room connection
    socket.on("setup", (name) => {
        //Clear old room name
        socket.leave();
        
        //Define Socket RoomName
        roomName = name;
        
        //Join Room
        socket.join(name);
        
        //Return room Connection
        socket.in(name).emit("conn.Room",'Alguém se conectou à sala');
        
        console.log("Conn. Sala " + roomName);

        io.emit('desenhosAntigos', desenhosAntigos);
    });
    
    
    //Receber desenhos
    socket.on('desenhar', (desenho) => {
        desenhosAntigos.push(desenho);
        console.log(desenho);
        //send drawns
        io.in(roomName).emit('desenho', desenho);
    });

    socket.on("disconnect", () => {
        console.log("Usuário desconectado!");
    });
});
/* ---SOCKET.IO--- */



httpServer.listen(port);
