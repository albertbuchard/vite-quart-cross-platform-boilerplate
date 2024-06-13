import os
from quart import Quart, jsonify
from quart_cors import cors

app = Quart(__name__)
app = cors(app)  # Allow all domains for simplicity, adjust as needed

@app.route("/data", methods=["GET"])
async def get_data():
    return jsonify({"message": "Hello from Quart!"})

if __name__ == "__main__":
    port = int(os.getenv("BACKEND_PORT", 5000))  # Use the BACKEND_PORT from the environment
    app.run(host="0.0.0.0", port=port)
