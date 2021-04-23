const chatform = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

//Get Username n rom from URL

const { username , room } =Qs.parse(location.search , {
    ignoreQueryPrefix: true
});

const socket = io();


// join Chatroom
socket.emit("joinRoom", {username , room });

//Get Rooms and USers
socket.on("roomUsers",({room,users }) => {
    outputRoomName(room);
    outputUsers(users);

});

socket.on("message", message => {
    console.log(message);
    outputmessage(message);

    //Scrool down
    chatMessages.scrollTop  = chatMessages.scrollHeight;

});

//MEssager submit

chatform.addEventListener("submit" , (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;
    //emiting message to servere
    socket.emit("chatMessage",msg);

    //clear inputs
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
});

//output message to DOm 
function outputmessage(message)
{
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${message.username}<span>      ${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;

    document.querySelector(".chat-messages").appendChild(div);
}


//Add roomname to dom
function outputRoomName(room) {
    roomName.innerText = room;
}

//add users to dom
function outputUsers(users){
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join("")}`;
}