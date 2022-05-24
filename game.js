const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 3000;

let arrRoom = ["room-1"],
  obRoom = {},
  numRoom = arrRoom[arrRoom.length - 1],
  boardLength = 15;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/game.html");
});

function checkPoints(arrBoard, a, b, X) {
  let points = 1,
    a1 = a - 1,
    a2 = a + 1,
    b1 = b,
    b2 = b,
    length = 4;
  // Chieu doc
  for (let i = 0; i < length; i++) {
    if (a1 >= 0 && arrBoard[a1][b1] === X) {
      points++;
      a1--;
    }

    if (a2 <= boardLength - 1 && arrBoard[a2][b2] === X) {
      points++;
      a2++;
    }
    if (points >= 5) {
      return points;
    }
  }
  // Chieu ngang
  points = 1;
  a1 = a;
  a2 = a;
  b1 = b - 1;
  b2 = b + 1;
  for (let i = 0; i < length; i++) {
    if (b1 >= 0 && arrBoard[a1][b1] === X) {
      points++;
      b1--;
    }

    if (b2 <= boardLength - 1 && arrBoard[a2][b2] === X) {
      points++;
      b2++;
    }
    if (points >= 5) {
      return points;
    }
  }
  // Chieu xeo len
  points = 1;
  a1 = a + 1;
  a2 = a - 1;
  b1 = b - 1;
  b2 = b + 1;
  for (let i = 0; i < length; i++) {
    if (a1 <= boardLength - 1 && b1 >= 0 && arrBoard[a1][b1] === X) {
      points++;
      a1++;
      b1--;
    }

    if (a2 >= 0 && b2 <= boardLength - 1 && arrBoard[a2][b2] === X) {
      points++;
      a2--;
      b2++;
    }
    if (points >= 5) {
      return points;
    }
  }
  // Chieu xeo xuong
  points = 1;
  a1 = a - 1;
  a2 = a + 1;
  b1 = b - 1;
  b2 = b + 1;
  for (let i = 0; i < length; i++) {
    if (a1 >= 0 && b1 >= 0 && arrBoard[a1][b1] === X) {
      points++;
      a1--;
      b1--;
    }

    if (
      a2 <= boardLength - 1 &&
      b2 <= boardLength - 1 &&
      arrBoard[a2][b2] === X
    ) {
      points++;
      a2++;
      b2++;
    }
    if (points >= 5) {
      return points;
    }
  }

  return points;
}

io.on("connection", (socket) => {
  socket.join(numRoom);
  if (obRoom[numRoom] === undefined) {
    obRoom[numRoom] = {
      arrSocketId: [],
      arrTurn: [1],
      arrNamePlayer: [],
      arrBoard: Array(boardLength)
        .fill(null)
        .map(() => Array(boardLength).fill(0)),
      statusGame: false,
    };
  }
  obRoom[numRoom].arrSocketId.push(socket.id);

  io.sockets.in(numRoom).emit("connectToRoom", { room: numRoom });

  let arrSocket = [...socket.rooms];
  if (obRoom[numRoom].arrSocketId.length >= 2) {
    io.sockets.in(numRoom).emit("status-turn", "Đến lượt của bạn");
    socket.emit("status-turn", "Đến lượt của đối thủ");
    arrRoom.push(`room-${Number(arrRoom[arrRoom.length - 1].slice(-1)) + 1}`);
    numRoom = arrRoom[arrRoom.length - 1];
    io.sockets.in(arrSocket[1]).emit("fine-player", "");
  }
  socket.on("click", (data) => {
    if (
      obRoom[data.room].arrSocketId.length === 2 &&
      obRoom[data.room].arrSocketId.indexOf(socket.id) === 0 &&
      obRoom[data.room].arrTurn[obRoom[data.room].arrTurn.length - 1] === 1 &&
      obRoom[data.room].statusGame === false
    ) {
      obRoom[data.room].arrTurn.push(2);
      obRoom[data.room].arrBoard[data.i][data.j] = 1;
      io.sockets
        .in(data.room)
        .emit("show", { i: data.i, j: data.j, point: "O" });
      io.sockets.in(data.room).emit("status-turn", "Đến lượt của bạn");
      socket.emit("status-turn", "Đến lượt của đối thủ");
      if (checkPoints(obRoom[data.room].arrBoard, data.i, data.j, 1) >= 5) {
        obRoom[data.room].statusGame = true;
        io.sockets.in(data.room).emit("notify", "Bạn đã thua");
        socket.emit("notify", "Bạn đã thắng");
        io.sockets.in(data.room).emit("status-turn", "");
      }
      if (obRoom[data.room].arrTurn.length - 1 === boardLength * boardLength) {
        obRoom[data.room].statusGame = true;
        io.sockets.in(data.room).emit("notify", "Bạn đã hòa");
        io.sockets.in(data.room).emit("status-turn", "");
      }
    } else if (
      obRoom[data.room].arrSocketId.length === 2 &&
      obRoom[data.room].arrSocketId.indexOf(socket.id) === 1 &&
      obRoom[data.room].arrTurn[obRoom[data.room].arrTurn.length - 1] === 2 &&
      obRoom[data.room].statusGame === false
    ) {
      obRoom[data.room].arrTurn.push(1);
      obRoom[data.room].arrBoard[data.i][data.j] = 2;
      io.sockets
        .in(data.room)
        .emit("show", { i: data.i, j: data.j, point: "X" });
      io.sockets.in(data.room).emit("status-turn", "Đến lượt của bạn");
      socket.emit("status-turn", "Đến lượt của đối thủ");
      if (checkPoints(obRoom[data.room].arrBoard, data.i, data.j, 2) >= 5) {
        obRoom[data.room].statusGame = true;
        io.sockets.in(data.room).emit("notify", "Bạn đã thua");
        socket.emit("notify", "Bạn đã thắng");
        io.sockets.in(data.room).emit("status-turn", "");
      }
      if (obRoom[data.room].arrTurn.length - 1 === boardLength * boardLength) {
        obRoom[data.room].statusGame = true;
        io.sockets.in(data.room).emit("notify", "Bạn đã hòa");
        io.sockets.in(data.room).emit("status-turn", "");
      }
    } else if (
      obRoom[data.room].arrSocketId.length === 2 &&
      obRoom[data.room].statusGame === false
    ) {
      socket.emit("not-your-turn");
    }
  });
  socket.on("name", (data) => {
    obRoom[arrSocket[1]].arrNamePlayer.push(data);
    io.sockets
      .in(arrSocket[1])
      .emit("show-name", obRoom[arrSocket[1]].arrNamePlayer);
  });

  socket.on("disconnect", () => {
    obRoom[arrSocket[1]].statusGame = true;
    if (arrRoom.indexOf(arrSocket[1]) !== -1) {
      if (arrSocket[1] === arrRoom[arrRoom.length - 1]) {
        arrRoom.push(
          `room-${Number(arrRoom[arrRoom.length - 1].slice(-1)) + 1}`
        );
        numRoom = arrRoom[arrRoom.length - 1];
      }
      arrRoom.splice(arrRoom.indexOf(arrSocket[1]), 1);
    }
    if (obRoom[arrSocket[1]].arrSocketId.length <= 1) {
      delete obRoom[arrSocket[1]];
    }
    io.sockets.in(arrSocket[1]).emit("notify", "Đối thủ đã thoát");
    io.sockets.in(arrSocket[1]).emit("status-turn", "");
  });
});

server.listen(PORT, () => {
  console.log("hello");
});
