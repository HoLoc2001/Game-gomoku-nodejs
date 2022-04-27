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

const checkPoints = function (arrBoard, a, b, X) {
  let points = 1,
    a1 = a,
    a2 = a,
    b1 = b,
    b2 = b;
  // console.log(arrBoard);
  // console.log(a);
  // console.log(b);
  // console.log(arrBoard[--a1][b]);
  console.log(--a1 >= 0 && arrBoard[--a1][b] == X);
  console.log(arrBoard[++a2][b]);
  for (let i = 0; i < 10; i++) {
    if (--a1 >= 0 && arrBoard[--a1][b] == X) {
      a1--;
      points++;
    }
    if (++a2 <= 9 && arrBoard[++a2][b] == X) {
      a2++;
      points++;
    }
  }
  return points;
};

io.on("connection", (socket) => {
  socket.join(numRoom);
  if (obRoom[numRoom] === undefined) {
    obRoom[numRoom] = {
      arrSocketId: [],
      arrTurn: [1],
      arrNamePlayer: [],
      arrBoard: Array(10)
        .fill(null)
        .map(() => Array(10).fill(0)),
    };
  }
  obRoom[numRoom].arrSocketId.push(socket.id);
  // console.log(obRoom);
  io.sockets.in(numRoom).emit("connectToRoom", { room: numRoom });
  // console.log(numRoom);

  // console.log(arrUser.length % 2 === 0);
  let arrSocket = [...socket.rooms];
  if (obRoom[numRoom].arrSocketId.length >= 2) {
    arrRoom.push(`room-${Number(arrRoom[arrRoom.length - 1].slice(-1)) + 1}`);
    numRoom = arrRoom[arrRoom.length - 1];
    io.sockets.in(arrSocket[1]).emit("fine-player", "");
  } else {
    io.sockets.in(arrSocket[1]).emit("fine-player", "Đang tìm người chơi...");
  }
  // obRoom[arrSocket[1]].arrBoard[1][2] = 2;
  // console.log(obRoom[arrSocket[1]].arrBoard);
  socket.on("click", (data) => {
    if (
      obRoom[data.room].arrSocketId.indexOf(socket.id) === 0 &&
      obRoom[data.room].arrTurn[obRoom[data.room].arrTurn.length - 1] === 1 &&
      obRoom[data.room].arrSocketId.length === 2
    ) {
      obRoom[data.room].arrTurn.push(2);
      obRoom[data.room].arrBoard[data.i][data.j] = 1;
      io.sockets
        .in(data.room)
        .emit("show", { i: data.i, j: data.j, point: "O" });
      io.sockets.in(data.room).emit("status-turn", "Đến lượt của bạn");
      socket.emit("status-turn", "Đến lượt của đối thủ");
      // console.log(checkPoints(obRoom[data.room].arrBoard, data.i, data.j, 1));
    } else if (
      obRoom[data.room].arrSocketId.indexOf(socket.id) === 1 &&
      obRoom[data.room].arrTurn[obRoom[data.room].arrTurn.length - 1] === 2 &&
      obRoom[data.room].arrSocketId.length === 2
    ) {
      obRoom[data.room].arrTurn.push(1);
      obRoom[data.room].arrBoard[data.i][data.j] = 2;
      io.sockets
        .in(data.room)
        .emit("show", { i: data.i, j: data.j, point: "X" });
      io.sockets.in(data.room).emit("status-turn", "Đến lượt của bạn");
      socket.emit("status-turn", "Đến lượt của đối thủ");
    } else if (obRoom[data.room].arrSocketId.length === 2) {
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
    // obRoom[arrSocket[1]].arrBoard[9][0] = 7;
    // console.log(obRoom[arrSocket[1]].arrBoard);
    // console.log(arrSocket[1]);
    if (arrRoom.indexOf(arrSocket[1]) !== -1) {
      if (arrSocket[1] === arrRoom[arrRoom.length - 1]) {
        arrRoom.push(
          `room-${Number(arrRoom[arrRoom.length - 1].slice(-1)) + 1}`
        );
        numRoom = arrRoom[arrRoom.length - 1];
      }
      arrRoom.splice(arrRoom.indexOf(arrSocket[1]), 1);
      delete obRoom[arrSocket[1]];
    }
    io.sockets.in(arrSocket[1]).emit("exit", "Đối thủ đã thoát");
  });
});

server.listen(3000, () => {
  console.log("hello");
});
