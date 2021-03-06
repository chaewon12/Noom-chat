const socket=io();
const welcome=document.getElementById("welcome");
const form=welcome.querySelector("form");
const room=document.getElementById("room");
room.hidden=true;

let roomName,nickName ;

function addMessage(msg){
    const ul=room.querySelector("ul");
    const li =document.createElement("li");
    li.innerText=msg;
    ul.appendChild(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", value,roomName,()=>{
        addMessage(`You: ${value}`);
    });
    input.value = "";
}

function showRoom() {
    welcome.hidden=true;
    room.hidden=false;
    const h3=room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgform=room.querySelector("#msg");
    msgform.addEventListener("submit",handleMessageSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const inputroom = form.querySelector("#roomname");
    const inputnickname = form.querySelector("#nickname");
    roomName=inputroom.value;
    nickName =inputnickname.value;

    socket.emit("enter_room",roomName ,nickName, showRoom);
    inputroom.value = "";
    inputnickname.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcom",(user,newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} joined!`);
})

socket.on("bye",(left,newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${left} left`);
})

socket.on("new_message", addMessage);

socket.on("room_change", (rooms)=>{
    const roomList=welcome.querySelector("ul");
    roomList.innerHTML="";
    
    rooms.forEach(room=>{
        const li=document.createElement("li");
        li.innerText=room;
        roomList.append(li);
    });
});