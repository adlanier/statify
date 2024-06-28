from flask import Flask, request, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
import requests

allowed_origins = [
    "http://localhost:5173"
]

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": allowed_origins}}) # Adjust origins as per your needs

@app.route('/api/artists', methods=['POST'])
def get_artist_info():
    content = request.json
    urls = content.get('urls')
    if not urls:
        return jsonify({"error": "No URLs provided"}), 400

    results = []

    for url in urls:
        try:
            response = requests.get(url)
            if response.status_code != 200:
                results.append({"url": url, "artist_name": "Unknown", "monthly_listeners": "Unknown"})
                continue

            soup = BeautifulSoup(response.content, 'html.parser')

            # Extract artist name from og:title or title
            og_title_tag = soup.find('meta', property='og:title')
            artist_name = og_title_tag['content'] if og_title_tag else soup.title.string.split('|')[0].strip()

            # Extract monthly listeners from meta description
            meta_description_tag = soup.find('meta', {'name': 'description'})
            monthly_listeners = "Unknown"
            if meta_description_tag:
                description = meta_description_tag['content']
                if 'monthly listeners' in description:
                    monthly_listeners = description.split('·')[-1].strip().replace('monthly listeners', '').strip()

            results.append({
                "url": url,
                "artist_name": artist_name,
                "monthly_listeners": monthly_listeners
            })
        except Exception as e:
            results.append({"url": url, "error": str(e)})

    return jsonify(results), 200

if __name__ == '__main__':
    app.run(debug=True)