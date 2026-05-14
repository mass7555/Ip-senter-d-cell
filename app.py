from flask import Flask, request, jsonify
import yt_dlp
import os
import threading
import time
import requests

app = Flask(__name__)

MAX_CONCURRENT_REQUESTS = 2
pool = threading.Semaphore(MAX_CONCURRENT_REQUESTS)
last_activity_time = time.time()

def smart_keep_alive():
    global last_activity_time
    # Hugging Face ka internal URL ya direct 7860 port
    self_url = "http://localhost:7860/extract"
    test_link = "https://www.instagram.com/reel/DT7xEKSj-rl/"
    
    while True:
        time.sleep(60)
        current_time = time.time()
        if current_time - last_activity_time >= 600:
            try:
                requests.get(self_url, params={'url': test_link}, timeout=15)
            except Exception:
                pass

@app.route('/extract', methods=['GET'])
def extract_link():
    global last_activity_time
    last_activity_time = time.time()

    if not pool.acquire(blocking=False):
        return jsonify({"error": "Server busy"}), 503

    try:
        video_url = request.args.get('url')
        if not video_url:
            return jsonify({"error": "No URL provided"}), 400

        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'cachedir': False,
            'extract_flat': True,
            'socket_timeout': 15
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            return jsonify({
                "title": info.get('title', 'Video'), 
                "download_link": info.get('url'),
                "status": "success"
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        pool.release()

if __name__ == '__main__':
    threading.Thread(target=smart_keep_alive, daemon=True).start()
    # Port 7860 Hugging Face ke liye mandatory hai
    app.run(host='0.0.0.0', port=7860)
    