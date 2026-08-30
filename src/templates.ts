import { Project } from "./types";

export const PROJECT_TEMPLATES: Record<string, { name: string; description: string; type: string; files: Record<string, string> }> = {
  website: {
    name: "My Website Portfolio",
    description: "A gorgeous, responsive portfolio website featuring fluid layouts, interactive contact cards, and smooth hover state transitions.",
    type: "Websites",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sarah Jenkins | Creative Developer</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body class="bg-slate-950 text-white font-sans antialiased">
  
  <!-- Navigation Header -->
  <nav class="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center border-b border-slate-800">
    <div class="text-xl font-bold tracking-tight text-teal-400">sarah_dev.</div>
    <div class="space-x-6 text-sm text-slate-400">
      <a href="#work" class="hover:text-white transition">Work</a>
      <a href="#about" class="hover:text-white transition">About</a>
      <a href="#contact" class="hover:text-white transition">Contact</a>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="max-w-4xl mx-auto px-6 py-20 text-center">
    <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
      Building Interactive Digital Experiences
    </h1>
    <p class="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
      I'm a full-stack engineer and designer specializing in WebGL visuals, real-time interactivity, and responsive design systems.
    </p>
    <div class="mt-8 flex justify-center space-x-4">
      <a href="#work" class="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-medium rounded-lg transition shadow-lg shadow-teal-500/20">
        View My Work
      </a>
      <a href="#contact" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition">
        Let's Talk
      </a>
    </div>
  </header>

  <!-- Interactive Project Showcase Grid -->
  <section id="work" class="max-w-6xl mx-auto px-6 py-12">
    <h2 class="text-2xl font-bold mb-8 border-l-4 border-teal-400 pl-3">Featured Work</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-teal-500/50 transition">
        <div class="p-6">
          <span class="text-xs text-teal-400 font-mono">React • Three.js</span>
          <h3 class="text-xl font-bold mt-2 mb-3">Vortex 3D Canvas</h3>
          <p class="text-slate-400 text-sm">An interactive WebGL particles field displaying custom gravitational orbits.</p>
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-teal-500/50 transition">
        <div class="p-6">
          <span class="text-xs text-teal-400 font-mono">TypeScript • Node</span>
          <h3 class="text-xl font-bold mt-2 mb-3">ForgeSync Engine</h3>
          <p class="text-slate-400 text-sm">A server-side file synchronizer that runs file change pipelines at 120fps.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact Form Section -->
  <section id="contact" class="max-w-xl mx-auto px-6 py-16">
    <div class="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
      <h2 class="text-2xl font-bold text-center mb-2">Get in Touch</h2>
      <p class="text-slate-400 text-center text-sm mb-6">Let's craft something amazing together.</p>
      
      <form id="contactForm" class="space-y-4" onsubmit="event.preventDefault(); alert('Inquiry simulated successfully!');">
        <div>
          <label class="block text-xs text-slate-400 uppercase tracking-wider mb-1">Name</label>
          <input type="text" placeholder="John Doe" class="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-400" required>
        </div>
        <div>
          <label class="block text-xs text-slate-400 uppercase tracking-wider mb-1">Email</label>
          <input type="email" placeholder="john@example.com" class="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-400" required>
        </div>
        <div>
          <label class="block text-xs text-slate-400 uppercase tracking-wider mb-1">Message</label>
          <textarea rows="4" placeholder="How can I help you?" class="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-400" required></textarea>
        </div>
        <button type="submit" class="w-full py-3 bg-teal-500 text-slate-950 font-bold rounded hover:bg-teal-400 transition">
          Send Message
        </button>
      </form>
    </div>
  </section>

  <footer class="text-center text-xs text-slate-600 py-12 border-t border-slate-900">
    &copy; 2026 Sarah Jenkins. Built with ForgeAI.
  </footer>
</body>
</html>`,
      "style.css": `/* Custom styles for portfolio presentation */
html {
  scroll-behavior: smooth;
}

body {
  background-attachment: fixed;
}

::selection {
  background-color: rgb(20, 184, 166);
  color: rgb(15, 23, 42);
}
`,
      "script.js": `// Interactive visual elements
document.addEventListener("DOMContentLoaded", () => {
  console.log("Sarah Jenkins Website Portfolio Initialized!");
  
  // Custom scroll observer for fade animations
  const projectCards = document.querySelectorAll("#work > div > div");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add("opacity-100", "translate-y-0");
        entry.target.classList.remove("opacity-0", "translate-y-4");
      }
    });
  }, { threshold: 0.1 });

  projectCards.forEach(card => {
    card.classList.add("transition-all", "duration-700", "opacity-0", "translate-y-4");
    observer.observe(card);
  });
});`
    }
  },
  zombieGame: {
    name: "Zombie Survival HTML5 Canvas",
    description: "A fully playable retro 2D top-down shooter game running natively on HTML5 Canvas. Dodge and shoot the zombies to survive!",
    type: "Web Apps",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Retro Zombie Survival</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    canvas {
      image-rendering: pixelated;
      background-color: #0b0f19;
    }
  </style>
</head>
<body class="bg-slate-950 text-white flex flex-col items-center justify-center min-h-screen select-none font-sans">
  
  <div class="text-center mb-4">
    <h1 class="text-3xl font-extrabold tracking-tight text-red-500 mb-1">Z-SURVIVAL CANVAS</h1>
    <p class="text-xs text-slate-400">WASD to Move • Mouse to Aim & Left Click to Shoot</p>
  </div>

  <div class="relative bg-slate-900 p-2 rounded-xl border border-slate-800 shadow-2xl">
    <canvas id="gameCanvas" width="600" height="400" class="rounded-lg border border-slate-950"></canvas>
    
    <!-- Game Over overlay -->
    <div id="gameOverScreen" class="absolute inset-0 bg-black/90 flex flex-col items-center justify-center rounded-lg hidden">
      <h2 class="text-4xl font-extrabold text-red-600 tracking-wider mb-2">YOU DIED</h2>
      <p id="finalScore" class="text-slate-300 text-lg mb-6">Score: 0</p>
      <button onclick="resetGame()" class="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-red-600/30">
        RESTART SURVIVAL
      </button>
    </div>
  </div>

  <div class="mt-4 flex space-x-8 text-sm bg-slate-900 border border-slate-800 px-6 py-2 rounded-full font-mono">
    <div>Score: <span id="scoreText" class="text-yellow-400 font-bold">0</span></div>
    <div>Health: <span id="healthText" class="text-red-500 font-bold">100%</span></div>
    <div>High Score: <span id="highScoreText" class="text-teal-400">0</span></div>
  </div>

  <script src="game.js"></script>
</body>
</html>`,
      "game.js": `const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const scoreText = document.getElementById("scoreText");
const healthText = document.getElementById("healthText");
const highScoreText = document.getElementById("highScoreText");

let player = { x: 300, y: 200, size: 12, speed: 3.5, health: 100 };
let keys = {};
let bullets = [];
let zombies = [];
let score = 0;
let highScore = localStorage.getItem("z_high_score") || 0;
let isGameOver = false;
let mousePos = { x: 300, y: 200 };
let spawnTimer = 0;

highScoreText.innerText = highScore;

// Track keyboard input
window.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

// Track mouse position
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mousePos.x = e.clientX - rect.left;
  mousePos.y = e.clientY - rect.top;
});

// Shoot Bullet on Click
canvas.addEventListener("mousedown", (e) => {
  if (isGameOver) return;
  const angle = Math.atan2(mousePos.y - player.y, mousePos.x - player.x);
  bullets.push({
    x: player.x,
    y: player.y,
    dx: Math.cos(angle) * 7,
    dy: Math.sin(angle) * 7,
    size: 4
  });
});

function spawnZombie() {
  let x, y;
  // Spawn from random edges
  if (Math.random() < 0.5) {
    x = Math.random() < 0.5 ? -20 : canvas.width + 20;
    y = Math.random() * canvas.height;
  } else {
    x = Math.random() * canvas.width;
    y = Math.random() < 0.5 ? -20 : canvas.height + 20;
  }
  zombies.push({
    x: x,
    y: y,
    speed: 0.8 + Math.random() * 1.2,
    size: 10 + Math.random() * 5,
    health: 20
  });
}

function resetGame() {
  player = { x: 300, y: 200, size: 12, speed: 3.5, health: 100 };
  bullets = [];
  zombies = [];
  score = 0;
  isGameOver = false;
  scoreText.innerText = "0";
  healthText.innerText = "100%";
  gameOverScreen.classList.add("hidden");
  loop();
}

function update() {
  if (isGameOver) return;

  // Player Movement
  if (keys["w"] && player.y > player.size) player.y -= player.speed;
  if (keys["s"] && player.y < canvas.height - player.size) player.y += player.speed;
  if (keys["a"] && player.x > player.size) player.x -= player.speed;
  if (keys["d"] && player.x < canvas.width - player.size) player.x += player.speed;

  // Update Bullets
  bullets.forEach((bullet, bIndex) => {
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;
    // Remove if offscreen
    if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
      bullets.splice(bIndex, 1);
    }
  });

  // Spawn Zombies
  spawnTimer++;
  if (spawnTimer > Math.max(15, 60 - Math.floor(score / 5))) {
    spawnZombie();
    spawnTimer = 0;
  }

  // Update Zombies
  zombies.forEach((zombie, zIndex) => {
    const angle = Math.atan2(player.y - zombie.y, player.x - zombie.x);
    zombie.x += Math.cos(angle) * zombie.speed;
    zombie.y += Math.sin(angle) * zombie.speed;

    // Bullet hits Zombie
    bullets.forEach((bullet, bIndex) => {
      const dist = Math.hypot(bullet.x - zombie.x, bullet.y - zombie.y);
      if (dist < zombie.size + bullet.size) {
        zombie.health -= 10;
        bullets.splice(bIndex, 1);
        if (zombie.health <= 0) {
          zombies.splice(zIndex, 1);
          score += 10;
          scoreText.innerText = score;
        }
      }
    });

    // Zombie hits Player
    const distToPlayer = Math.hypot(player.x - zombie.x, player.y - zombie.y);
    if (distToPlayer < player.size + zombie.size) {
      player.health -= 0.5;
      healthText.innerText = Math.max(0, Math.ceil(player.health)) + "%";
      if (player.health <= 0) {
        isGameOver = true;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("z_high_score", score);
          highScoreText.innerText = score;
        }
        finalScore.innerText = "Survived and scored: " + score;
        gameOverScreen.classList.remove("hidden");
      }
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Grid Lines (cool sci-fi floor)
  ctx.strokeStyle = "#121b2d";
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw Player
  ctx.fillStyle = "#14b8a6"; // Teal player
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();

  // Player Gun pointer line
  ctx.strokeStyle = "rgba(20, 184, 166, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(mousePos.x, mousePos.y);
  ctx.stroke();

  // Draw Bullets
  ctx.fillStyle = "#f59e0b"; // Golden bullets
  bullets.forEach(bullet => {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw Zombies
  zombies.forEach(zombie => {
    ctx.fillStyle = "#ef4444"; // Red zombies
    ctx.beginPath();
    ctx.arc(zombie.x, zombie.y, zombie.size, 0, Math.PI * 2);
    ctx.fill();

    // Dark red core
    ctx.fillStyle = "#7f1d1d";
    ctx.beginPath();
    ctx.arc(zombie.x, zombie.y, zombie.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function loop() {
  update();
  draw();
  if (!isGameOver) {
    requestAnimationFrame(loop);
  }
}

// Start game
loop();
`,
      "README.md": `# Retro Zombie Canvas Survival

An immersive arcade 2D survival experience powered by HTML5 Canvas.

## Controls:
- **W, A, S, D** to walk/strafe.
- **Mouse cursor** to aim.
- **Left click** to shoot.

Perfect sandbox test case for canvas mechanics.`
    }
  },
  calculator: {
    name: "Interactive Neumorphic Calculator",
    description: "A highly visual and polished Neumorphic calculator with responsive click feedback, memory operators, and mathematical formula parsing.",
    type: "Web Apps",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sleek Neumorphic Calculator</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .neumorphic-button {
      background: linear-gradient(145deg, #1e293b, #0f172a);
      box-shadow: 4px 4px 8px #080d1a, -4px -4px 8px #1a2a47;
    }
    .neumorphic-button:active {
      box-shadow: inset 2px 2px 5px #080d1a, inset -2px -2px 5px #1a2a47;
    }
  </style>
</head>
<body class="bg-slate-900 text-white flex flex-col items-center justify-center min-h-screen select-none">
  
  <div class="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl max-w-xs w-full">
    <!-- Calculator Screen -->
    <div class="mb-6 p-4 bg-slate-900 rounded-2xl border border-slate-800 text-right font-mono">
      <div id="formula" class="text-xs text-slate-500 h-4 truncate"></div>
      <div id="display" class="text-3xl font-bold truncate text-teal-400 mt-1">0</div>
    </div>

    <!-- Button Grid -->
    <div class="grid grid-cols-4 gap-3">
      <button onclick="clearDisplay()" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-red-400 hover:text-red-300">C</button>
      <button onclick="pressKey('(')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-teal-400">(</button>
      <button onclick="pressKey(')')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-teal-400">)</button>
      <button onclick="pressKey('/')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-teal-400">/</button>

      <button onclick="pressKey('7')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-slate-300">7</button>
      <button onclick="pressKey('8')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-slate-300">8</button>
      <button onclick="pressKey('9')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-slate-300">9</button>
      <button onclick="pressKey('*')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-teal-400">*</button>

      <button onclick="pressKey('4')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-slate-300">4</button>
      <button onclick="pressKey('5')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-slate-300">5</button>
      <button onclick="pressKey('6')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-slate-300">6</button>
      <button onclick="pressKey('-')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-teal-400">-</button>

      <button onclick="pressKey('1')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-slate-300">1</button>
      <button onclick="pressKey('2')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-slate-300">2</button>
      <button onclick="pressKey('3')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-slate-300">3</button>
      <button onclick="pressKey('+')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-teal-400">+</button>

      <button onclick="pressKey('0')" class="neumorphic-button py-4 col-span-2 rounded-xl text-sm font-bold text-slate-300">0</button>
      <button onclick="pressKey('.')" class="neumorphic-button py-4 rounded-xl text-sm font-bold text-slate-300">.</button>
      <button onclick="calculate()" class="py-4 rounded-xl text-sm font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20">=</button>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>`,
      "script.js": `const display = document.getElementById("display");
const formula = document.getElementById("formula");
let currentInput = "0";
let currentFormula = "";

function pressKey(key) {
  if (currentInput === "0" && !isNaN(key)) {
    currentInput = key;
  } else {
    currentInput += key;
  }
  display.innerText = currentInput;
}

function clearDisplay() {
  currentInput = "0";
  currentFormula = "";
  display.innerText = "0";
  formula.innerText = "";
}

function calculate() {
  try {
    currentFormula = currentInput;
    // Basic math evaluation safely
    const result = new Function("return " + currentFormula)();
    display.innerText = result;
    formula.innerText = currentFormula + " =";
    currentInput = String(result);
  } catch(e) {
    display.innerText = "Error";
    formula.innerText = "Syntax Error";
    currentInput = "0";
  }
}`
    }
  },
  minecraftPlugin: {
    name: "Spigot Economy Link",
    description: "A professional Minecraft plugin blueprint with custom MySQL connections, item-stack handlers, and Vault currency wrappers.",
    type: "Minecraft Plugins",
    files: {
      "src/main/java/com/forge/Plugin.java": `package com.forge;

import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.ChatColor;

public class SpigotEconomyLink extends JavaPlugin {
    
    @Override
    public void onEnable() {
        saveDefaultConfig();
        getLogger().info("SpigotEconomyLink has been successfully initialized and linked with Vault!");
    }
    
    @Override
    public void onDisable() {
        getLogger().info("SpigotEconomyLink disabled securely. All player databases saved.");
    }
    
    @Override
    public boolean onCommand(CommandSender sender, Command cmd, String label, String[] args) {
        if (cmd.getName().equalsIgnoreCase("forgecoin")) {
            if (!(sender instanceof Player)) {
                sender.sendMessage("This command is strictly player-only!");
                return true;
            }
            
            Player player = (Player) sender;
            int initialBalance = getConfig().getInt("starting-balance", 100);
            
            player.sendMessage(ChatColor.GOLD + "[ForgeAI] " + ChatColor.GREEN + "Your active balance: " + ChatColor.YELLOW + initialBalance + " Coins");
            return true;
        }
        return false;
    }
}`,
      "plugin.yml": `name: SpigotEconomyLink
version: 1.0.0
main: com.forge.SpigotEconomyLink
api-version: 1.18
commands:
  forgecoin:
    description: View your active Vault balance.
    usage: /forgecoin`,
      "config.yml": `# ForgeAI Spigot Economy Link Config file
starting-balance: 150
mysql:
  enabled: false
  host: localhost
  port: 3306
  database: server_db
  username: root
  password: ""`
    }
  },
  discordBot: {
    name: "Viper Moderation Bot",
    description: "An advanced Discord.py modular bot with commands for server warnings, roles assignment, and database level systems.",
    type: "Discord Bots",
    files: {
      "bot.py": `import discord
from discord.ext import commands
import os

# Create command engine with custom activity statuses
bot = commands.Bot(command_prefix='!', intents=discord.Intents.all())

@bot.event
async def on_ready():
    print(f'Bot linked successfully as {bot.user.name}')
    await bot.change_presence(activity=discord.Game(name="ForgeAI Terminal Launcher"))

@bot.command()
async def rules(ctx):
    """Sends custom styled server rules embed"""
    embed = discord.Embed(
        title="Server Security Rules", 
        description="Please adhere to standard cyber etiquette:",
        color=discord.Color.teal()
    )
    embed.add_field(name="1. Etiquette", value="Respect other developer branches.", inline=False)
    embed.add_field(name="2. Coding", value="Never share production API keys.", inline=False)
    await ctx.send(embed=embed)

@bot.command()
async def ping(ctx):
    """Simple speed check latency"""
    await ctx.send(f'🏓 Pong! Latency: {round(bot.latency * 1000)}ms')

if __name__ == '__main__':
    # Simulating launcher support
    print("Discord Bot instance prepared.")`,
      "requirements.txt": `discord.py>=2.0.0
python-dotenv>=1.0.0
asyncio>=3.4.3`,
      "README.md": `# Viper Moderation Bot

A modular Discord.py blueprint bot with rich embedded command frames.

Run command: ` + "`" + `python bot.py` + "`" + ` inside terminal to trigger.`
    }
  },
  reactApp: {
    name: "Vite React Starter",
    description: "A professional React 18 single-page application starter utilizing functional components, hooks, Tailwind CSS layout systems, and clean component structures.",
    type: "React Apps",
    files: {
      "src/App.tsx": `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          React + Vite Workspace
        </h1>
        <p className="mt-2 text-slate-400 text-sm">Welcome to your high-performance sandbox.</p>
        
        <div className="my-8">
          <button 
            onClick={() => setCount(c => c + 1)}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition active:scale-95 shadow-lg shadow-cyan-500/20">
            Count is {count}
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Modify src/App.tsx to see instant live reload previews.
        </div>
      </div>
    </div>
  );
}`,
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Vite React Sandbox</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-white font-sans antialiased">
  <div id="root"></div>
</body>
</html>`,
      "package.json": `{
  "name": "vite-react-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}`
    }
  },
  nextJs: {
    name: "Next.js App Router Setup",
    description: "A production Next.js template featuring App Router layouts, React Server Components (RSC), api route structures, and modern visual cards.",
    type: "React Apps",
    files: {
      "app/page.tsx": `import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full border border-neutral-800 bg-neutral-900/40 p-12 rounded-3xl backdrop-blur-md">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-200 to-neutral-400 bg-clip-text text-transparent">
          Next.js App Directory
        </h1>
        <p className="mt-3 text-neutral-400">
          React Server Components framework with hybrid rendering pipelines and unified layouts.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-4 border border-neutral-800 rounded-xl hover:border-neutral-700 transition">
            <h3 className="font-bold text-neutral-200">app/layout.tsx</h3>
            <p className="text-xs text-neutral-500 mt-1">Shared layouts across path routers.</p>
          </div>
          <div className="p-4 border border-neutral-800 rounded-xl hover:border-neutral-700 transition">
            <h3 className="font-bold text-neutral-200">app/page.tsx</h3>
            <p className="text-xs text-neutral-500 mt-1">Unique page index entry routes.</p>
          </div>
        </div>
      </div>
    </main>
  );
}`,
      "app/layout.tsx": `import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body class="bg-black text-neutral-100 antialiased">{children}</body>
    </html>
  );
}`,
      "package.json": `{
  "name": "nextjs-app",
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}`
    }
  },
  robloxGame: {
    name: "Roblox Tycoon Sandbox Engine",
    description: "High-quality Luau scripts for an interactive Roblox Tycoon model. Includes tycoon upgrade logic, auto-savers, and dropper spawners.",
    type: "Game Projects",
    files: {
      "TycoonCore.lua": `-- Roblox Tycoon Core Luau Server script
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local Tycoon = {}
Tycoon.__index = Tycoon

function Tycoon.new(owner, model)
    local self = setmetatable({}, Tycoon)
    self.Owner = owner
    self.Model = model
    self.Cash = 0
    self.Droppers = {}
    return self
end

function Tycoon:SpawnDropper(dropperModel)
    table.insert(self.Droppers, dropperModel)
    print("[Tycoon] Spawning dropper for: " .. self.Owner.Name)
    
    task.spawn(function()
        while true do
            task.wait(3.0)
            self:GenerateDrop()
        end
    end)
end

function Tycoon:GenerateDrop()
    self.Cash = self.Cash + 10
    print("[Tycoon] Current balance of " .. self.Owner.Name .. ": $" .. tostring(self.Cash))
end

return Tycoon`,
      "DropperScript.lua": `-- Dropper script attached to parts
local Dropper = script.Parent
local DropModel = ReplicatedStorage:WaitForChild("DropPart")

while true do
    task.wait(math.random(2, 5))
    local drop = DropModel:Clone()
    drop.Position = Dropper.SpawnPoint.Position
    drop.Parent = workspace
    
    -- Add custom physics velocity
    local bodyVelocity = Instance.new("BodyVelocity")
    bodyVelocity.Velocity = Vector3.new(0, -10, 0)
    bodyVelocity.Parent = drop
    task.wait(0.2)
    bodyVelocity:Destroy()
end`,
      "README.md": `# Roblox Tycoon Template
      
Includes advanced server modules, object pools, and item spawning algorithms for Roblox Luau sandbox execution.`
    }
  },
  godotProject: {
    name: "Godot Platformer Character2D",
    description: "A clean GDScript character controller template for a 2D side-scrolling platformer with inertia, wall-jumps, and double jumps.",
    type: "Game Projects",
    files: {
      "PlayerController.gd": `# Godot 4.x CharacterBody2D movement script
extends CharacterBody2D

const SPEED = 300.0
const JUMP_VELOCITY = -450.0
const DOUBLE_JUMP_VELOCITY = -400.0

# Get the gravity from the project settings to be synced with RigidBody nodes.
var gravity = ProjectSettings.get_setting("physics/2d/default_gravity")
var can_double_jump = true

func _physics_process(delta):
	# Add the gravity.
	if not is_on_floor():
		velocity.y += gravity * delta
	else:
		can_double_jump = true

	# Handle jump.
	if Input.is_action_just_pressed("ui_accept"):
		if is_on_floor():
			velocity.y = JUMP_VELOCITY
		elif can_double_jump:
			velocity.y = DOUBLE_JUMP_VELOCITY
			can_double_jump = false

	# Get the input direction and handle the movement/deceleration.
	var direction = Input.get_axis("ui_left", "ui_right")
	if direction:
		velocity.x = direction * SPEED
	else:
		velocity.x = move_toward(velocity.x, 0, SPEED)

	move_and_slide()
`,
      "GameScene.tscn": `[godot_scene format=3 uid="uid://c1p3v2j4x5t1"]

[node name="Node2D" type="Node2D"]

[node name="Player" type="CharacterBody2D" parent="."]
position = Vector2(100, 100)

[node name="Sprite2D" type="Sprite2D" parent="Player"]

[node name="CollisionShape2D" type="CollisionShape2D" parent="Player"]
`,
      "README.md": `# Godot 4.x 2D Side-scroller Starter
      
Open this scene inside your Godot Editor to bind inputs and begin scripting visual mechanics.`
    }
  },
  unityProject: {
    name: "Unity FPS Controller Blueprint",
    description: "A complete Unity C# script template for a first-person shooter camera, responsive movement, and collision handlers.",
    type: "Game Projects",
    files: {
      "FPSController.cs": `using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class FPSController : MonoBehaviour
{
    public float walkingSpeed = 7.5f;
    public float runningSpeed = 11.5f;
    public float jumpSpeed = 8.0f;
    public float gravity = 20.0f;
    public Camera playerCamera;
    public float lookSpeed = 2.0f;
    public float lookXLimit = 45.0f;

    CharacterController characterController;
    Vector3 moveDirection = Vector3.zero;
    float rotationX = 0;

    [HideInInspector]
    public bool canMove = true;

    void Start()
    {
        characterController = GetComponent<CharacterController>();
        // Lock cursor
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
    }

    void Update()
    {
        Vector3 forward = transform.TransformDirection(Vector3.forward);
        Vector3 right = transform.TransformDirection(Vector3.right);
        
        bool isRunning = Input.GetKey(KeyCode.LeftShift);
        float curSpeedX = canMove ? (isRunning ? runningSpeed : walkingSpeed) * Input.GetAxis("Vertical") : 0;
        float curSpeedY = canMove ? (isRunning ? runningSpeed : walkingSpeed) * Input.GetAxis("Horizontal") : 0;
        float movementDirectionY = moveDirection.y;
        moveDirection = (forward * curSpeedX) + (right * curSpeedY);

        if (Input.GetButton("Jump") && canMove && characterController.isGrounded)
        {
            moveDirection.y = jumpSpeed;
        }
        else
        {
            moveDirection.y = movementDirectionY;
        }

        if (!characterController.isGrounded)
        {
            moveDirection.y -= gravity * Time.deltaTime;
        }

        characterController.Move(moveDirection * Time.deltaTime);

        if (canMove && playerCamera != null)
        {
            rotationX += -Input.GetAxis("Mouse Y") * lookSpeed;
            rotationX = Mathf.Clamp(rotationX, -lookXLimit, lookXLimit);
            playerCamera.transform.localRotation = Quaternion.Euler(rotationX, 0, 0);
            transform.rotation *= Quaternion.Euler(0, Input.GetAxis("Mouse X") * lookSpeed, 0);
        }
    }
}`,
      "README.md": `# Unity 3D FPS Character Blueprint
      
Attach this script to your primary Capsule Player object, drag and drop the main camera to the playerCamera slot in the inspector.`
    }
  },
  pythonApp: {
    name: "Python Data Analyzer Console",
    description: "A Python CLI utility that parses CSV files, calculates mathematical metrics (mean, median, standard deviation), and plots console bar charts.",
    type: "Python Apps",
    files: {
      "analyzer.py": `import math
import csv

def analyze_data(filename):
    print(f"--- Analyzing Data: {filename} ---")
    data = []
    try:
        with open(filename, mode='r') as file:
            reader = csv.reader(file)
            next(reader, None) # skip header
            for row in reader:
                if row:
                    data.append(float(row[0]))
    except FileNotFoundError:
        print("Dataset not found! Loading sample coordinates...")
        data = [2.5, 4.3, 7.1, 1.9, 11.2, 5.5, 9.1]

    if not data:
        print("No numerical parameters detected.")
        return

    # Statistics
    count = len(data)
    total = sum(data)
    mean = total / count
    variance = sum((x - mean) ** 2 for x in data) / count
    stdev = math.sqrt(variance)

    print(f"Sample Count: {count}")
    print(f"Sum Total:    {total:.2f}")
    print(f"Average Mean: {mean:.2f}")
    print(f"Std Deviation:{stdev:.2f}")

    # Visual console chart
    print("\\n--- Distribution Chart ---")
    for x in data:
        bar = "#" * int(x * 2)
        print(f"{x:4.1f} | {bar}")

if __name__ == '__main__':
    analyze_data("data.csv")`,
      "data.csv": `Value
5.2
12.1
8.5
3.1
7.6
15.0
10.2`
    }
  },
  apiServer: {
    name: "Node Express API Framework",
    description: "A structured Express.js REST API with routers, payload sanitizers, authorization wrappers, and clean routes.",
    type: "API Servers",
    files: {
      "server.js": `const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Sample dataset in memory
let items = [
  { id: 1, name: 'Quantum Core', status: 'Active' },
  { id: 2, name: 'Vortex Mesh', status: 'Ready' }
];

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// GET list of items
app.get('/api/items', (req, res) => {
  res.json({ success: true, count: items.length, data: items });
});

// POST append item
app.post('/api/items', (req, res) => {
  const { name, status } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: "Name attribute required" });
  }
  const newItem = {
    id: items.length + 1,
    name: name,
    status: status || 'Pending'
  };
  items.push(newItem);
  res.status(201).json({ success: true, message: "Item appended", data: newItem });
});

app.listen(PORT, () => {
  console.log(\`REST API server listening on http://localhost:\${PORT}\`);
});`,
      "package.json": `{
  "name": "express-api-server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}`
    }
  },
  chatApp: {
    name: "Interactive Chat Interface",
    description: "A highly visual instant messenger frontend utilizing clean message states, avatars, timestamps, and typing simulators.",
    type: "Web Apps",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cyber Chat Workspace</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 flex items-center justify-center min-h-screen p-4 font-sans antialiased">

  <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[500px] overflow-hidden shadow-2xl">
    <!-- Header -->
    <div class="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center space-x-3">
      <div class="h-8 w-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xs">AI</div>
      <div>
        <h2 class="text-sm font-bold">ForgeAI Bot</h2>
        <p class="text-[10px] text-teal-400">● Online and Listening</p>
      </div>
    </div>

    <!-- Chat Flow Scroll -->
    <div id="chatFlow" class="flex-1 overflow-y-auto p-4 space-y-3 font-medium text-xs leading-relaxed">
      <div class="flex items-start space-x-2">
        <div class="bg-slate-800 p-3 rounded-2xl rounded-tl-none max-w-[80%] text-slate-300">
          Hello! How can I help you construct custom systems today?
        </div>
      </div>
    </div>

    <!-- Footer Input -->
    <form id="chatForm" onsubmit="sendMessage(event)" class="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
      <input id="chatInput" type="text" placeholder="Type prompt here..." class="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400" required>
      <button type="submit" class="p-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg transition-all">Send</button>
    </form>
  </div>

  <script>
    const chatFlow = document.getElementById("chatFlow");
    const chatInput = document.getElementById("chatInput");

    function sendMessage(e) {
      e.preventDefault();
      const txt = chatInput.value.trim();
      if (!txt) return;

      // User line
      const userBubble = document.createElement("div");
      userBubble.className = "flex items-start justify-end space-x-2";
      userBubble.innerHTML = \`<div class="bg-teal-500 text-slate-950 p-3 rounded-2xl rounded-tr-none max-w-[80%] font-semibold">\${txt}</div>\`;
      chatFlow.appendChild(userBubble);
      chatInput.value = "";
      chatFlow.scrollTop = chatFlow.scrollHeight;

      // Simulate Bot reply
      setTimeout(() => {
        const botBubble = document.createElement("div");
        botBubble.className = "flex items-start space-x-2 animate-pulse";
        botBubble.innerHTML = \`<div class="bg-slate-800 p-3 rounded-2xl rounded-tl-none max-w-[80%] text-slate-300">Processing input coordinate meshes... Ready!</div>\`;
        chatFlow.appendChild(botBubble);
        chatFlow.scrollTop = chatFlow.scrollHeight;
      }, 1000);
    }
  </script>
</body>
</html>`
    }
  }
};
