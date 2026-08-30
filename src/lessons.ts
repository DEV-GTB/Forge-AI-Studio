export interface ProgrammingLesson {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  description: string;
  codeTemplate: string;
  targetFile: string;
  instructions: string[];
}

export const PROGRAMMING_LESSONS: ProgrammingLesson[] = [
  {
    id: "html-basics",
    title: "1. Mastering Responsive Flexbox grids",
    category: "HTML & CSS",
    difficulty: "Beginner",
    estimatedTime: "10 mins",
    description: "Learn how to structure multi-column cards that snap perfectly from mobile columns to multi-row desktop layouts without overflowing screens.",
    targetFile: "index.html",
    codeTemplate: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Flexbox Grid Layout Challenge</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white p-8">

  <h1 class="text-3xl font-bold mb-6 text-center text-teal-400">Flexbox Bento Grid Challenge</h1>

  <!-- CHALLENGE: Modify the div below to be a responsive grid. 
       Use Tailwind's flex/grid classes so that cards display 
       in a single column on mobile, and expand to 3 columns on desktop. -->
  <div class="space-y-4">
    
    <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h2 class="text-xl font-bold text-teal-300">Card 1</h2>
      <p class="text-slate-400 text-sm mt-2">This is the first grid block element.</p>
    </div>

    <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h2 class="text-xl font-bold text-teal-300">Card 2</h2>
      <p class="text-slate-400 text-sm mt-2">This is the second grid block element.</p>
    </div>

    <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h2 class="text-xl font-bold text-teal-300">Card 3</h2>
      <p class="text-slate-400 text-sm mt-2">This is the third grid block element.</p>
    </div>

  </div>

</body>
</html>`,
    instructions: [
      "Find the container <div> that wraps our three card elements.",
      "Replace the simple layout class 'space-y-4' with a responsive flex or grid framework.",
      "Recommended: Use Tailwind's grid class: 'grid grid-cols-1 md:grid-cols-3 gap-6 space-y-0'.",
      "Check the interactive Project Preview to watch the layout morph responsive-style!"
    ]
  },
  {
    id: "game-loop",
    title: "2. Structuring Game Loops & Physics",
    category: "Game Development",
    difficulty: "Intermediate",
    estimatedTime: "15 mins",
    description: "Explore the mathematics of game frames, gravity formulas, velocity dampening, and boundary checks using Canvas API.",
    targetFile: "game.js",
    codeTemplate: `// Basic Canvas physics setup
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 400;

let ball = {
  x: 300,
  y: 50,
  vx: 2,
  vy: 0,
  radius: 15,
  gravity: 0.25,
  bounce: 0.75 // Energy retention ratio
};

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. CHALLENGE: Apply gravity acceleration to the ball's vertical velocity (vy)
  // ball.vy += ball.gravity;

  // 2. Update ball coordinates
  ball.x += ball.vx;
  ball.y += ball.vy;

  // 3. Bounce mechanics off floor
  if (ball.y + ball.radius > canvas.height) {
    ball.y = canvas.height - ball.radius;
    ball.vy = -ball.vy * ball.bounce;
  }

  // Draw ball
  ctx.fillStyle = "#14b8a6";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(loop);
}

loop();`,
    instructions: [
      "Load this code block into your project workspace.",
      "Uncomment the gravity acceleration step 'ball.vy += ball.gravity;' inside the main update cycle.",
      "Adjust the gravity value to 0.5 and observe how the downward drag behaves.",
      "Add a boundary wrap check to make the ball teleport back when leaving the left/right screen margins!"
    ]
  },
  {
    id: "async-fetching",
    title: "3. Asynchronous JavaScript & API handlers",
    category: "Fullstack JS",
    difficulty: "Advanced",
    estimatedTime: "20 mins",
    description: "Master error catch boundaries, loading states, and HTTP JSON data streaming with fetch pipelines in JavaScript.",
    targetFile: "script.js",
    codeTemplate: `// High quality fetching framework
async function loadServerData() {
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";
  
  // CHALLENGE: Implement a robust loading tracker and try-catch boundary.
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Server returned non-ok status");
    const data = await res.json();
    console.log("Bitcoin active price: $" + data.bitcoin.usd);
  } catch(err) {
    console.error("Failed to extract currency metrics:", err);
  }
}

loadServerData();`,
    instructions: [
      "Review the asynchronous sequence in loadServerData.",
      "Incorporate a visual 'isLoading' variable to handle UX spinner rendering.",
      "Add retry logic that repeats the fetch request up to 3 times if an HTTP network error occurs.",
      "Verify the output logs inside your interactive Workspace terminal!"
    ]
  },
  {
    id: "canvas-collisions",
    title: "4. AABB Box Collision Detection",
    category: "Game Development",
    difficulty: "Beginner",
    estimatedTime: "10 mins",
    description: "Learn how Axis-Aligned Bounding Box (AABB) works for checking if two blocks or characters intersect.",
    targetFile: "collision.js",
    codeTemplate: `// AABB Collision Detection Rule
function checkCollision(rect1, rect2) {
  // CHALLENGE: Complete this boolean logic to return true if rect1 intersects rect2
  return false;
}

// Example boxes
const player = { x: 50, y: 50, width: 30, height: 30 };
const enemy = { x: 60, y: 55, width: 20, height: 20 };

console.log("Collision Status:", checkCollision(player, enemy));`,
    instructions: [
      "Analyse the collision parameters (x, y, width, height).",
      "Implement the classic condition: rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y.",
      "Run the script and check that the example evaluates to 'true'."
    ]
  },
  {
    id: "websocket-chats",
    title: "5. Real-Time WebSocket Communication",
    category: "Fullstack JS",
    difficulty: "Advanced",
    estimatedTime: "20 mins",
    description: "Set up WebSockets client-server handshakes, message broadcasting, and reconnection mechanisms.",
    targetFile: "ws_client.js",
    codeTemplate: `// WebSocket client framework
const socket = new WebSocket("ws://localhost:3000");

socket.addEventListener("open", (event) => {
  console.log("[WS Connected] Client handshaked stably.");
  // CHALLENGE: Send a JSON packet identifying this peer
});

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  console.log("Broadcasting peer message:", data.content);
});`,
    instructions: [
      "Implement client-side socket.send() in JSON string format.",
      "Implement onclose event handler to trigger auto-reconnection after a 3000ms delay.",
      "Test this with the local ForgeAI Express voice and text ports!"
    ]
  },
  {
    id: "react-state-hooks",
    title: "6. State Management & Lifecycle Hooks",
    category: "React Development",
    difficulty: "Intermediate",
    estimatedTime: "15 mins",
    description: "Deep dive into React state propagation, stable dependencies, and clean unmounting of subscribers.",
    targetFile: "src/Counter.tsx",
    codeTemplate: `import React, { useState, useEffect } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  // CHALLENGE: Setup an interval subscription that increments count every second.
  // Make sure to clean up the interval when the component unmounts!
  useEffect(() => {
    // interval setup goes here
  }, []);

  return <div className="text-xl">Ticks: {count}</div>;
}`,
    instructions: [
      "Create a setInterval inside the useEffect callback.",
      "Return a cleanup function calling clearInterval to avoid memory leaks.",
      "Use functional state update setCount(prev => prev + 1) to keep the dependency array empty."
    ]
  },
  {
    id: "sql-joins",
    title: "7. Relational Queries and Inner Joins",
    category: "Database Logic",
    difficulty: "Intermediate",
    estimatedTime: "12 mins",
    description: "Write structural SQL queries to pull corresponding user records and order statuses with JOIN constraints.",
    targetFile: "query.sql",
    codeTemplate: `-- Relational database fetch challenge
SELECT 
  users.id, 
  users.username, 
  orders.amount
-- CHALLENGE: Complete this query to join orders table where users.id matches orders.user_id
FROM users
ORDER BY orders.amount DESC;`,
    instructions: [
      "Insert 'INNER JOIN orders ON users.id = orders.user_id' between FROM users and ORDER BY.",
      "Filter the results to only include orders greater than $100 using a WHERE statement.",
      "Execute the query in your Cloud SQL workspace to check the data mapping."
    ]
  },
  {
    id: "express-routes",
    title: "8. Express.js REST API Architecture",
    category: "Fullstack JS",
    difficulty: "Beginner",
    estimatedTime: "10 mins",
    description: "Construct robust HTTP GET/POST API endpoints with parameter validation and status codes inside Node.",
    targetFile: "server_route.js",
    codeTemplate: `const express = require("express");
const app = express();
app.use(express.json());

const users = [{ id: 1, name: "Norgt" }];

// CHALLENGE: Create a POST route to add a new user. Validate that name exists!
app.post("/api/users", (req, res) => {
  res.status(501).send("Not Implemented");
});`,
    instructions: [
      "Verify 'req.body.name' exists; if not, return a 400 Bad Request status with an error JSON.",
      "Push the new user object into the 'users' array and return a 210 Created status with the updated record.",
      "Verify the API using an active fetch helper on the frontend dashboard."
    ]
  },
  {
    id: "arcade-mechanics",
    title: "9. Retro Shooting Mechanics",
    category: "Game Development",
    difficulty: "Intermediate",
    estimatedTime: "18 mins",
    description: "Write bullet firing systems, alien projectile patterns, and boundary garbage collection cycles.",
    targetFile: "arcade.js",
    codeTemplate: `let bullets = [];

function fireBullet(x, y) {
  // CHALLENGE: Push a bullet with vertical velocity -8 to shoot up
}

function updateBullets() {
  // CHALLENGE: Loop, update y-coordinate, and remove bullets that go off-screen
}`,
    instructions: [
      "Construct a 'bullets.push({ x, y, vy: -8 })' inside fireBullet.",
      "Filter the bullets array: 'bullets = bullets.filter(b => b.y > 0)' to avoid infinite memory allocation.",
      "Observe the projectile physics inside the retro game loop simulator."
    ]
  },
  {
    id: "android-kotlin-ui",
    title: "10. Android Kotlin Jetpack Compose",
    category: "Mobile Apps",
    difficulty: "Advanced",
    estimatedTime: "25 mins",
    description: "Learn Kotlin declarative UI components, Modifier spacing attributes, and state variables on Android.",
    targetFile: "MainActivity.kt",
    codeTemplate: `package com.forgeai.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            // CHALLENGE: Add a styled welcoming greeting using Compose Text
        }
    }
}`,
    instructions: [
      "Review Compose declarative structures.",
      "Add a 'GreetingText(name = \"My Norgt\")' composable with custom color styling.",
      "Apply modifiers like 'Modifier.padding(16.dp)' to ensure adequate touch zones."
    ]
  },
  {
    id: "roblox-lua-loops",
    title: "11. Roblox Lua Event Listeners",
    category: "Game Development",
    difficulty: "Beginner",
    estimatedTime: "10 mins",
    description: "Structure game mechanics inside Roblox using Workspace Part Touch connections and player state modifications.",
    targetFile: "PartScript.lua",
    codeTemplate: `-- Lua Part trigger setup
local part = script.Parent

local function onTouch(otherPart)
	local character = otherPart.Parent
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if humanoid then
		-- CHALLENGE: Heal the character to full health or reduce speed!
	end
end

part.Touched:Connect(onTouch)`,
    instructions: [
      "Check that the 'humanoid' entity exists in the touch event.",
      "Modify player health: 'humanoid.Health = humanoid.MaxHealth' to create a healing pad.",
      "Test how characters interact with part triggers in your game engine workspace."
    ]
  },
  {
    id: "discord-bot-hooks",
    title: "12. Discord.js Bot Event Dispatcher",
    category: "Bots & Automation",
    difficulty: "Intermediate",
    estimatedTime: "15 mins",
    description: "Establish Discord client loops, gateway intent setups, and custom command keyword processing rules.",
    targetFile: "bot.js",
    codeTemplate: `const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  // CHALLENGE: Respond with 'Pong!' if the user typed '!ping'
});

client.login("YOUR_BOT_TOKEN");`,
    instructions: [
      "Review Discord client event handlers.",
      "Incorporate conditions to parse the command text: 'if (message.content === \"!ping\") message.reply(\"Pong!\");'.",
      "Avoid disclosing credentials in cleartext; bind variables safely in .env!"
    ]
  },
  {
    id: "fastapi-python-setup",
    title: "13. Python FastAPI Router",
    category: "Python Apps",
    difficulty: "Beginner",
    estimatedTime: "12 mins",
    description: "Write standard Python endpoints, typed parameters, and auto-generated Swagger metrics using FastAPI.",
    targetFile: "main.py",
    codeTemplate: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Project(BaseModel):
    name: str
    description: str

# CHALLENGE: Create a FastAPI endpoint that receives a Project model and returns success status
@app.post("/projects")
def create_project(project: Project):
    return {"status": "error"}`,
    instructions: [
      "Verify Pydantic model validations.",
      "Change the dictionary return structure to: 'return {\"status\": \"success\", \"project_name\": project.name}'.",
      "Utilize Python typings to auto-validate schemas."
    ]
  },
  {
    id: "svg-vectors-drawing",
    title: "14. SVG Vector Path Architectures",
    category: "Graphics & UI",
    difficulty: "Intermediate",
    estimatedTime: "15 mins",
    description: "Learn how to hand-craft vector coordinates, Bezier curve tags, and gradient definitions in SVG.",
    targetFile: "logo.svg",
    codeTemplate: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- CHALLENGE: Design a perfectly centered teal triangle with glowing dropshadow -->
  <polygon points="50,15 90,85 10,85" fill="#14b8a6" />
</svg>`,
    instructions: [
      "Analyze polygon corner coordinate mapping.",
      "Insert an SVG filter block containing 'feGaussianBlur' to produce a glow effect.",
      "Connect the glow filter ID directly onto your active polygon element."
    ]
  },
  {
    id: "binary-search-tree",
    title: "15. Binary Tree Pre-Order Traversal",
    category: "Computer Science",
    difficulty: "Advanced",
    estimatedTime: "22 mins",
    description: "Build recursion algorithms to trace hierarchical nodes in search trees efficiently.",
    targetFile: "bst.js",
    codeTemplate: `class Node {
  constructor(val) {
    this.value = val;
    this.left = null;
    this.right = null;
  }
}

function traverse(node) {
  if (!node) return;
  // CHALLENGE: Implement recursive pre-order (Node, Left, Right) printing
}`,
    instructions: [
      "Print the current node value: 'console.log(node.value)'.",
      "Recursively evaluate: 'traverse(node.left)' then 'traverse(node.right)'.",
      "Observe memory stack footprint compared to iterative traversal."
    ]
  },
  {
    id: "ai-prompt-engineering",
    title: "16. AI System Prompts and Fallbacks",
    category: "AI & LLMs",
    difficulty: "Advanced",
    estimatedTime: "20 mins",
    description: "Configure system contexts, instruction matrices, temperatures, and model failovers gracefully.",
    targetFile: "ai_prompter.js",
    codeTemplate: `// Emulated multi-model failover client
async function requestAI(prompt) {
  const models = ["forgeai-reasoning-node", "forgeai-code-router", "forgeai-ultrafast-node"];
  // CHALLENGE: Loop over models, fetch with catch-blocks to handle HTTP 503 errors!
}`,
    instructions: [
      "Construct a for-of loop traversing the models array sequentially.",
      "Trigger an API endpoint fetch; if successful, return the text immediately.",
      "If exceptions are raised, print a warning and fall back seamlessly to the next model in the registry!"
    ]
  }
];
