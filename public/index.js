const socket = io();
const board = document.querySelector("#board");
const roomId = document.querySelector("#room");
const player1 = document.querySelector("#p1");
const player2 = document.querySelector("#p2");
const notify = document.querySelector(".notify");
const notify_status = document.querySelector("#notify_status");
const statusTurn = document.querySelector("#status");
const replay = document.querySelector("#replay");
let boardLength = 15;
let isActive = true;

let namePlayer;
if (sessionStorage.getItem("name") === null) {
  namePlayer = prompt("Nhập tên của bạn");
} else {
  namePlayer = sessionStorage.getItem("name");
  sessionStorage.clear();
}

namePlayer =
  namePlayer === null || namePlayer === ""
    ? "PLAYER"
    : namePlayer.toUpperCase();

for (let i = 0; i < boardLength; i++) {
  for (let j = 0; j < boardLength; j++) {
    const childBoard = document.createElement("div");
    childBoard.classList.add("square");
    childBoard.setAttribute("id", `${i}-${j}`);
    board.appendChild(childBoard);
  }
}

socket.on("connectToRoom", (data) => {
  roomId.textContent = data.room;
  for (let i = 0; i < boardLength; i++) {
    for (let j = 0; j < boardLength; j++) {
      document.querySelector(`[id='${i}-${j}']`).onclick = function () {
        if (
          document
            .querySelector(`[id='${i}-${j}']`)
            .style.background.search("url") === -1
        ) {
          socket.emit("click", { i: i, j: j, room: data.room });
        }
      };
    }
  }
});
socket.emit("name", namePlayer);
socket.on("show-name", (data) => {
  player1.textContent = data[0];
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

socket.on("show", (data) => {
  document.querySelector(`[id='${data.i}-${data.j}']`);
  document.querySelector(
    `[id='${data.i}-${data.j}']`
  ).style.background = `no-repeat center/80% url(./img/${data.point}.png)`;
});

replay.addEventListener("click", () => {
  sessionStorage.setItem("name", namePlayer);
  location.reload();
});
