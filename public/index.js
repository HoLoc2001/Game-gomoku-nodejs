const socket = io();
const board = document.querySelector("#board");
const roomId = document.querySelector("#room");
const player1 = document.querySelector("#p1");
const player2 = document.querySelector("#p2");
const notify = document.querySelector(".notify");
const notify_status = document.querySelector("#notify_status");
const statusTurn = document.querySelector("#status");
const replay = document.querySelector("#replay");
let isActive = true;

let namePlayer;
if (localStorage.getItem("name") === null) {
  namePlayer = prompt("Nhập tên của bạn");
} else {
  namePlayer = localStorage.getItem("name");
  localStorage.clear();
}

console.log(namePlayer);
namePlayer =
  namePlayer === null || namePlayer === ""
    ? "PLAYER"
    : namePlayer.toUpperCase();

for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    const childBoard = document.createElement("div");
    childBoard.classList.add("square");
    childBoard.setAttribute("id", `${i}-${j}`);
    board.appendChild(childBoard);
  }
}

socket.on("connectToRoom", (data) => {
  roomId.textContent = data.room;
  if (isActive) {
    a(data);
    isActive = false;
  }
});
socket.emit("name", namePlayer);
socket.on("show-name", (data) => {
  player1.textContent = data[0];
  console.log(data[1]);
  player2.textContent =
    data[1] === undefined ? "Đang tìm đối thủ ..." : data[1];
});

socket.on("status-turn", (data) => {
  statusTurn.textContent = data;
});
socket.on("not-your-turn", () => {
  alert("Chưa đến lượt của bạn");
});
socket.on("notify", (data) => {
  notify.classList.add("open");
  notify_status.textContent = data;
});

function click_board(i, j, room) {
  if (
    document
      .querySelector(`[id='${i}-${j}']`)
      .style.background.search("url") === -1
  ) {
    socket.emit("click", { i: i, j: j, room: room });
  }
  document
    .querySelector(`[id='${i}-${j}']`)
    .removeEventListener("click", click_board, false);
}
const a = (data) => {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      document
        .querySelector(`[id='${i}-${j}']`)
        .addEventListener("click", function click_board() {
          if (
            document
              .querySelector(`[id='${i}-${j}']`)
              .style.background.search("url") === -1
          ) {
            socket.emit("click", { i: i, j: j, room: data.room });
          }
          this.removeEventListener("click", click_board, false);
        });
    }
  }
};

socket.on("show", (data) => {
  document.querySelector(`[id='${data.i}-${data.j}']`);
  document.querySelector(
    `[id='${data.i}-${data.j}']`
  ).style.background = `no-repeat center/80% url(./img/${data.point}.png)`;
  console.log(`${data.i}-${data.j}`);
});

replay.addEventListener("click", () => {
  // while (board.firstChild) {
  //   board.firstChild.remove();
  // }
  // for (let i = 0; i < 10; i++) {
  //   for (let j = 0; j < 10; j++) {
  //     const childBoard = document.createElement("div");
  //     childBoard.classList.add("square");
  //     childBoard.setAttribute("id", `${i}-${j}`);
  //     board.appendChild(childBoard);
  //   }
  // }
  localStorage.setItem("name", namePlayer);
  location.reload();
});
