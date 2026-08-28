#!/usr/bin/env python3
"""
CYBERQUEST 2099 - Main Launcher & Terminal Cyber Interface
Provides options to launch the Holographic Web HUD or run Cyber CLI mode.
"""

import os
import sys
import subprocess
import time
import json

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, 'data', 'cyber_db.json')

def load_db():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "player": {"level": 1, "xp": 0, "credits": 100, "streak": 0},
        "tasks": []
    }

def save_db(data):
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def run_cyber_cli():
    """Interactive Cyberpunk Terminal Mode."""
    db = load_db()
    
    while True:
        player = db.get('player', {})
        lvl = player.get('level', 1)
        xp = player.get('xp', 0)
        credits = player.get('credits', 0)
        streak = player.get('streak', 0)

        print("\n" + "=" * 55)
        print(f" ⚡ CYBERQUEST 2099 // TERMINAL COMMAND CONSOLE")
        print(f" [LVL {lvl}] | [XP: {xp}] | [{credits} QC] | [{streak}x STREAK]")
        print("=" * 55)
        print(" 1. ➕ Initialize New Objective (Add Task)")
        print(" 2. 📋 View Tactical Task Matrix")
        print(" 3. ⚔️ Eliminate Objective (Complete Task)")
        print(" 4. 🗑️ Purge Objective (Delete Task)")
        print(" 5. 🌐 Launch Holographic Web HUD")
        print(" 6. 🚪 Exit Protocol")
        print("-" * 55)

        choice = input("Enter Command [1-6]: ").strip()

        if choice == "1":
            title = input("Enter Objective Title: ").strip()
            if title:
                tier = input("Select Tier [S/A/B/C] (default B): ").strip().lower() or 'b'
                tag = input("Tag (e.g. #code, #study): ").strip() or '#mission'
                new_task = {
                    "id": f"task-cli-{int(time.time()*1000)}",
                    "title": title,
                    "tier": tier if tier in ['s', 'a', 'b', 'c'] else 'b',
                    "tag": tag if tag.startswith('#') else f"#{tag}",
                    "completed": False,
                    "createdAt": int(time.time() * 1000),
                    "subtasks": []
                }
                db['tasks'].append(new_task)
                save_db(db)
                print(f"[+] Objective '{title}' initialized into matrix!")
        elif choice == "2":
            tasks = db.get('tasks', [])
            print("\n--- ACTIVE TASK MATRIX ---")
            if not tasks:
                print("No objectives logged.")
            else:
                for idx, t in enumerate(tasks, 1):
                    status = "✅ [DONE]" if t.get('completed') else "⏳ [ACTIVE]"
                    tier = t.get('tier', 'b').upper()
                    print(f" {idx}. {status} [{tier}-TIER] {t.get('title')} {t.get('tag', '')}")
        elif choice == "3":
            tasks = db.get('tasks', [])
            for idx, t in enumerate(tasks, 1):
                if not t.get('completed'):
                    print(f" {idx}. {t.get('title')}")
            num = input("Enter Objective number to complete: ").strip()
            if num.isdigit() and 1 <= int(num) <= len(tasks):
                task = tasks[int(num) - 1]
                task['completed'] = True
                player['xp'] = player.get('xp', 0) + 50
                player['credits'] = player.get('credits', 0) + 20
                player['streak'] = player.get('streak', 0) + 1
                save_db(db)
                print(f"[+] Objective neutralized! +50 XP / +20 QC awarded.")
            else:
                print("[-] Invalid selection.")
        elif choice == "4":
            tasks = db.get('tasks', [])
            for idx, t in enumerate(tasks, 1):
                print(f" {idx}. {t.get('title')}")
            num = input("Enter Objective number to delete: ").strip()
            if num.isdigit() and 1 <= int(num) <= len(tasks):
                removed = tasks.pop(int(num) - 1)
                save_db(db)
                print(f"[+] Objective '{removed.get('title')}' purged.")
            else:
                print("[-] Invalid selection.")
        elif choice == "5":
            print("[*] Launching Holographic Web HUD...")
            subprocess.run([sys.executable, os.path.join(BASE_DIR, 'app.py')])
            break
        elif choice == "6":
            print("[*] Terminating terminal session. Goodbye Operator.")
            break
        else:
            print("[-] Invalid command.")

def main():
    if len(sys.argv) > 1 and sys.argv[1] == '--cli':
        run_cyber_cli()
    else:
        # Default: Launch Python Holographic Web App
        from app import start_server
        start_server(open_browser=True)

if __name__ == '__main__':
    main()
