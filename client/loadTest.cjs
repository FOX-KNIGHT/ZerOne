const axios = require('axios');
const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:5000';
const TEAMS_TO_CREATE = 45;
let connectedClients = 0;

async function runLoadTest() {
  console.log(`Starting load test with ${TEAMS_TO_CREATE} teams (approx ${TEAMS_TO_CREATE * 3} players)...`);
  
  const startTime = Date.now();
  let successfulTeams = 0;
  
  for (let i = 0; i < TEAMS_TO_CREATE; i++) {
    try {
      // 1. Create a Team
      const teamName = `StressTestTeam_${i}_${Date.now()}`;
      const res = await axios.post(`${SERVER_URL}/api/auth/register`, {
        teamName,
        leadName: `Lead_${i}`,
        password: 'password123'
      });
      
      const { token, team } = res.data;
      
      // 2. Connect 3 sockets (simulating 3 computers per team)
      for (let j = 0; j < 3; j++) {
        const socket = io(SERVER_URL, {
          auth: { token },
          transports: ['websocket']
        });
        
        socket.on('connect', () => {
          connectedClients++;
          socket.emit('joinTeam', team._id);
        });
      }
      
      successfulTeams++;
    } catch (err) {
        console.log("Error creating team:", err.message);
    }
  }

  const duration = Date.now() - startTime;
  console.log(`Successfully created ${successfulTeams} teams in ${duration}ms.`);
  
  setTimeout(() => {
    console.log(`Total connected Socket.io clients after 3 seconds: ${connectedClients}`);
    process.exit(0);
  }, 3000);
}

runLoadTest();
