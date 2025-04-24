document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const username = document.getElementById("username").value.trim();
            if (username) {
                window.location.href = `/chat?username=${encodeURIComponent(username)}`;
            } else {
                alert("Please enter a valid username.");
            }
        });
    }

    const messages = document.getElementById("messages");
    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");

    if (messages && messageInput && sendBtn) {
        const socket = io();
        const username = window.username;

        // Emit user join event to server
        socket.emit("join", { username });

        // Show existing users to the newly joined user
        socket.on("existing_users", (users) => {
            users.forEach(existingUser => {
                const alert = document.createElement("div");
                alert.classList.add("system-message");
                alert.innerText = `🟢 ${existingUser} is already in the chat`;
                messages.appendChild(alert);
            });
        });

        // Show user join system messages
        socket.on("system_message", (msg) => {
            const alert = document.createElement("div");
            alert.classList.add("system-message");
            alert.innerText = `🟢 ${msg}`;
            messages.appendChild(alert);
            messages.scrollTop = messages.scrollHeight;
        });

        // ➡️ Show user left messages with red arrow and red text
        socket.on("user_left", (leftUsername) => {
            const alert = document.createElement("div");
            alert.classList.add("system-message", "left-user");
            alert.innerText = `🔴 ${leftUsername} has left the chat`;
            messages.appendChild(alert);
            messages.scrollTop = messages.scrollHeight;
        });

        // Show all connected users (optional)
        socket.on("user_list", (userList) => {
            console.log("Connected users:", userList);
        });

        function sendMessage() {
            const msg = messageInput.value.trim();
            if (msg) {
                socket.emit("message", { username, text: msg });
                messageInput.value = "";
                messageInput.focus();
            } else {
                alert("Message cannot be empty.");
            }
        }

        sendBtn.addEventListener("click", sendMessage);

        messageInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                sendMessage();
            }
        });

        socket.on("message", (data) => {
            const msgElement = document.createElement("p");
            msgElement.textContent = `${data.username}: ${data.text}`;
            messages.appendChild(msgElement);
            messages.scrollTop = messages.scrollHeight;
        });
    }
});
