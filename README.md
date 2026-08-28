# DrawBoard

Live: https://drawboard-alexa-task-tan.vercel.app

Hey everyone, this is my submission for the Alexa Developers SRM technical task. I chose Task 2 which is the Live Drawing and Voice Canvas project. I wanted to build something that actually felt smooth to use so I spent a lot of time getting the canvas to feel right.

### What it does
You can create a room and share the code with friends to draw together in real time. It uses web sockets to sync everything instantly. I also added a voice chat feature so you can talk while drawing. Since the club focuses on voice tech, I built a voice command system too. You can say things like "color red" or "clear the board" and it will actually do it on the canvas hands free.

### Tech Stack
I used React for the frontend and Node with Express for the backend. Socket io handles all the real time drawing data. For the voice chat I used native WebRTC so it connects peer to peer without needing any external servers. The voice commands use the browser Speech API. I also used a library to make the strokes look like a real pen instead of a digital line.

### How to run it locally
First clone the repo to your computer.

Open a terminal in the server folder:
npm install
npm start

Open another terminal in the client folder:
npm install
npm run dev

It will start up on localhost 5173. 
