#!/usr/bin/env python3
"""
CYBERQUEST 2099 - Futuristic Gamified Task & Quantum Focus Protocol
Backend Server & REST Synchronization API
"""

import http.server
import json
import os
import socketserver
import sys
import threading
import time
import urllib.parse
import webbrowser

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_FILE = os.path.join(DATA_DIR, 'cyber_db.json')

# MIME Type map
MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
}

def ensure_db():
    """Ensure data directory and database file exist."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DB_FILE):
        initial_state = {
            "player": {
                "level": 1,
                "xp": 0,
                "credits": 120,
                "streak": 0,
                "maxStreak": 0,
                "streakMultiplier": 1.0,
                "totalTasksDone": 0,
                "totalFocusMinutes": 0,
                "bossesSlain": 0,
                "unlockedAchievements": [],
                "theme": "cyber",
                "soundMuted": False,
                "volume": 0.6,
                "overdrive": False,
                "inventory": []
            },
            "tasks": [
                {
                    "id": "task-init-1",
                    "title": "⚡ Calibrate Quantum Matrix & Focus Engine",
                    "tier": "s",
                    "tag": "#system",
                    "completed": False,
                    "createdAt": int(time.time() * 1000),
                    "subtasks": [
                        { "id": "sub-1", "title": "Initiate neural telemetry", "done": True },
                        { "id": "sub-2", "title": "Execute full cognitive diagnostic", "done": False }
                    ]
                },
                {
                    "id": "task-init-2",
                    "title": "🛡️ Deploy Cyber Firewall Security Protocols",
                    "tier": "a",
                    "tag": "#security",
                    "completed": False,
                    "createdAt": int(time.time() * 1000) - 3600000,
                    "subtasks": []
                },
                {
                    "id": "task-init-3",
                    "title": "☕ Sync Focus Ambient Soundscapes",
                    "tier": "b",
                    "tag": "#wellness",
                    "completed": True,
                    "createdAt": int(time.time() * 1000) - 7200000,
                    "subtasks": []
                }
            ],
            "bosses": [
                {
                    "id": "boss-init-1",
                    "name": "MECHA CHRONOS: The Procrastination Titan",
                    "avatar": "🤖",
                    "maxHp": 300,
                    "currentHp": 300,
                    "subtasks": [
                        { "id": "bs-1", "text": "Break project into 4 strategic milestones", "damage": 75, "done": False },
                        { "id": "bs-2", "text": "Run 2 uninterrupted 25m Focus Cycles", "damage": 75, "done": False },
                        { "id": "bs-3", "text": "Refactor core codebase architecture", "damage": 75, "done": False },
                        { "id": "bs-4", "text": "Conduct final peer review & deployment", "damage": 75, "done": False }
                    ],
                    "defeated": False
                }
            ],
            "rewards": [
                {
                    "id": "rew-1",
                    "title": "☕ Double Espresso Neuro-Boost",
                    "desc": "Reward yourself with a premium brew or espresso shot.",
                    "cost": 60,
                    "icon": "☕",
                    "isCustom": False
                },
                {
                    "id": "rew-2",
                    "title": "🎮 1 Hour Guilt-Free Gaming",
                    "desc": "Unwind with an hour of your favorite video game.",
                    "cost": 160,
                    "icon": "🎮",
                    "isCustom": False
                },
                {
                    "id": "rew-3",
                    "title": "🍕 Cyber Feast / Favorite Takeout",
                    "desc": "Order your favorite meal guilt-free after crushing objectives.",
                    "cost": 320,
                    "icon": "🍕",
                    "isCustom": False
                },
                {
                    "id": "rew-4",
                    "title": "🛡️ Quantum Streak Shield",
                    "desc": "Protects your streak from resetting if you miss a cycle.",
                    "cost": 180,
                    "icon": "🛡️",
                    "isCustom": False
                },
                {
                    "id": "rew-5",
                    "title": "⚡ Overclock Core (2x XP Booster)",
                    "desc": "Earn 2x XP for the next 2 hours of task completions.",
                    "cost": 220,
                    "icon": "⚡",
                    "isCustom": False
                }
            ],
            "redemptionHistory": []
        }
        with open(DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(initial_state, f, indent=2)

def read_db():
    ensure_db()
    try:
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[!] Error reading database: {e}")
        return {}

def write_db(data):
    ensure_db()
    try:
        with open(DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"[!] Error saving database: {e}")
        return False


class CyberRequestHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Clean terminal logging
        pass

    def send_json(self, status_code, payload):
        response_bytes = json.dumps(payload).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # REST API endpoints
        if path == '/api/state':
            data = read_db()
            self.send_json(200, data)
            return
        elif path == '/api/health':
            self.send_json(200, {"status": "online", "synapse": "v3.4", "time": time.time()})
            return

        # Static file serving
        if path == '/' or path == '':
            filepath = os.path.join(PUBLIC_DIR, 'index.html')
        else:
            rel_path = path.lstrip('/')
            filepath = os.path.join(PUBLIC_DIR, rel_path)

        # Normalize and prevent directory traversal
        filepath = os.path.normpath(filepath)
        if not filepath.startswith(PUBLIC_DIR):
            self.send_error(403, "Access Denied")
            return

        if os.path.exists(filepath) and os.path.isfile(filepath):
            _, ext = os.path.splitext(filepath)
            mime = MIME_TYPES.get(ext.lower(), 'application/octet-stream')

            try:
                with open(filepath, 'rb') as f:
                    content = f.read()

                self.send_response(200)
                self.send_header('Content-Type', mime)
                self.send_header('Content-Length', str(len(content)))
                self.send_header('Cache-Control', 'no-cache')
                self.end_headers()
                self.wfile.write(content)
            except Exception as e:
                self.send_error(500, f"Internal Error: {e}")
        else:
            # Fallback to index.html for SPA routing
            index_path = os.path.join(PUBLIC_DIR, 'index.html')
            if os.path.exists(index_path):
                with open(index_path, 'rb') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_error(404, "File Not Found")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/state':
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length).decode('utf-8')
                payload = json.loads(body)
                success = write_db(payload)
                if success:
                    self.send_json(200, {"status": "saved", "updated": time.time()})
                else:
                    self.send_json(500, {"error": "Failed to save state"})
            except Exception as e:
                self.send_json(400, {"error": f"Invalid JSON payload: {e}"})
            return

        self.send_error(404, "API endpoint not found")


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

def print_cyber_banner():
    cyan = "\033[96m"
    magenta = "\033[95m"
    yellow = "\033[93m"
    reset = "\033[0m"
    bold = "\033[1m"

    try:
        print(f"""
{cyan}========================================================================={reset}
{bold}{cyan}   [ CYBERQUEST 2099 // QUANTUM FOCUS & GAMIFIED TASK MATRIX ]{reset}
{yellow}               * SYSTEM STATUS: ONLINE & OPTIMAL *{reset}
{cyan}========================================================================={reset}
  [+] {bold}Neural HUD Server:{reset}  http://localhost:{PORT}
  [+] {bold}Local Database:{reset}     {DB_FILE}
  [+] {bold}Framework:{reset}          Zero-Dependency Python Web & REST Engine
  [!] Press {bold}Ctrl + C{reset} to terminate quantum reactor.
{cyan}========================================================================={reset}
""")
    except Exception:
        print(f"CYBERQUEST 2099 Server running at http://localhost:{PORT}")


def start_server(open_browser=True):
    ensure_db()
    server_address = ('', PORT)

    try:
        httpd = ReusableTCPServer(server_address, CyberRequestHandler)
    except OSError as e:
        print(f"[!] Port {PORT} is already in use. Trying alternate port 8081...")
        httpd = ReusableTCPServer(('', 8081), CyberRequestHandler)

    print_cyber_banner()

    if open_browser:
        def open_tab():
            time.sleep(0.6)
            webbrowser.open(f"http://localhost:{PORT}")
        threading.Thread(target=open_tab, daemon=True).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Quantum core safely deactivated. Goodbye Operator.")
        httpd.server_close()
        sys.exit(0)


if __name__ == '__main__':
    auto_open = '--no-browser' not in sys.argv
    start_server(open_browser=auto_open)
