const socket = io("http://localhost:3000");
const board = document.querySelector("#board");
const roomId = document.querySelector("#room");
const player1 = document.querySelector("#P1");
const player2 = document.querySelector("#P2");
const finePlayer = document.querySelector("#fine-player");
const statusTurn = document.querySelector("#status");
let isActive = true;
let namePlayer = prompt("Nhập tên của bạn");
console.log(namePlayer);
namePlayer =
  namePlayer === null || namePlayer === ""
    ? "PLAYER"
    : namePlayer.toUpperCase();
console.log(namePlayer);

console.log(namePlayer);
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
  player2.textContent = data[1];
});
socket.on("fine-player", (data) => {
  finePlayer.textContent = data;
  // finePlayer.style.display = data;
});
socket.on("status-turn", (data) => {
  statusTurn.textContent = data;
});
socket.on("not-your-turn", () => {
  alert("Chưa đến lượt của bạn");
});
const a = (data) => {
  var b = data;
  console.log("copy" + b);
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      document
        .querySelector(`[id='${i}-${j}']`)
        .addEventListener("click", function a1() {
          if (
            document
              .querySelector(`[id='${i}-${j}']`)
              .style.background.search("url") === -1
          ) {
            socket.emit("click", { i: i, j: j, room: data.room });
          }
          this.removeEventListener("click", a1, false);
        });
    }
  }
};

socket.on("show", (data) => {
  // .addEventListener("click", () => {
  //   document.querySelector(`[id='${data.i}-${data.j}']`).style.cursor =
  //     "not-allowed";
  //   alert("Ô cờ đã được đánh");
  // });
  document.querySelector(`[id='${data.i}-${data.j}']`);
  document.querySelector(
    `[id='${data.i}-${data.j}']`
  ).style.background = `no-repeat center/80% url(./img/${data.point}.png)`;
  console.log(`${data.i}-${data.j}`);
});

socket.on("exit", (data) => {
  document.write(data);
});
