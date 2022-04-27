const express = require("express");
const app = express();
app.use(express.static("public"));
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let arrRoom = ["room-1"],
  obRoom = {},
  numRoom = arrRoom[arrRoom.length - 1];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/game.html");
});

io.on("connection", (socket) => {
  socket.join(numRoom);
  if (obRoom[numRoom] === undefined) {
    obRoom[numRoom] = {
      arrSocketId: [],
      arrTurn: [1],
      arrNamePlayer: [],
    };
  }
  obRoom[numRoom].arrSocketId.push(socket.id);
  // console.log(obRoom);
  io.sockets.in(numRoom).emit("connectToRoom", { room: numRoom });
  // console.log(numRoom);

  // console.log(arrUser.length % 2 === 0);
  if (obRoom[numRoom].arrSocketId.length === 2) {
    arrRoom.push(`room-${Number(arrRoom[arrRoom.length - 1].slice(-1)) + 1}`);
    numRoom = arrRoom[arrRoom.length - 1];
  }

  let arrSocket = [...socket.rooms];
  socket.on("click", (data) => {
    if (
      obRoom[data.room].arrSocketId.indexOf(socket.id) === 0 &&
      obRoom[data.room].arrTurn[obRoom[data.room].arrTurn.length - 1] === 1
    ) {
      obRoom[data.room].arrTurn.push(2);
      io.sockets
        .in(data.room)
        .emit("show", { i: data.i, j: data.j, point: "O" });
    } else if (
      obRoom[data.room].arrSocketId.indexOf(socket.id) === 1 &&
      obRoom[data.room].arrTurn[obRoom[data.room].arrTurn.length - 1] === 2
    ) {
      obRoom[data.room].arrTurn.push(1);
      io.sockets
        .in(data.room)
        .emit("show", { i: data.i, j: data.j, point: "X" });
    } else {
      socket.emit("not-your-turn");
    }
    // console.log(arrUser.indexOf(socket.id));
    // console.log(arr[0]);
  });
  socket.on("name", (data) => {
    obRoom[arrSocket[1]].arrNamePlayer.push(data);
    console.log(obRoom[arrSocket[1]].arrNamePlayer);
    io.sockets
      .in(arrSocket[1])
      .emit("show-name", obRoom[arrSocket[1]].arrNamePlayer);
  });

  socket.on("disconnect", () => {
    if (arrRoom.indexOf(arrSocket[1]) !== -1) {
      arrRoom.splice(arrRoom.indexOf(arrSocket[1]), 1);
    }
    io.sockets.in(arrSocket[1]).emit("exit", "Đối thủ đã thoát");
    console.log(arrRoom);
  });
});

server.listen(3000, () => {
  console.log("hello");
});
