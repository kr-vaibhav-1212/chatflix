from flask import Flask, render_template, request, redirect, url_for
from flask_socketio import SocketIO, emit, disconnect
import os
import eventlet

eventlet.monkey_patch()  # <- Required for eventlet to work properly

app = Flask(__name__)
app.secret_key = os.urandom(24)

socketio = SocketIO(app, async_mode='eventlet')  # <- Use eventlet async mode



connected_users = {}  # Maps sid to username

@app.route('/')
def login():
    return render_template('login.html')

@app.route('/chat')
def chat():
    username = request.args.get('username')
    if not username or username.strip() == "":
        return redirect(url_for('login'))
    return render_template('chat.html', username=username)

@socketio.on('join')
def handle_join(data):
    username = data.get('username')
    if username:
        connected_users[request.sid] = username
        existing_users = [user for sid, user in connected_users.items() if user != username]
        emit('existing_users', existing_users)
        emit('system_message', f"{username} has joined the chat", broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    username = connected_users.get(sid)
    if username:
        # Emit a specific "user_left" event for styling in JS
        emit('user_left', username, broadcast=True)
        del connected_users[sid]

@socketio.on('message')
def handle_message(data):
    emit('message', data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=10000)

