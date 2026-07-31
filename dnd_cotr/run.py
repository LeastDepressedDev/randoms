import flask
import os
import static_resources
import json
import math as mt
import random
from back import *

app = flask.Flask("Nigger")
V = None
last_data = None

@app.route("/")
def main_rt():
    return app.redirect("/index.html")

@app.route("/lld")
def load_last():
    global last_data
    try:
        with open("rec.json", 'r') as f:
            content = f.read()
            last_data = content
            content = json.loads(content)
        return {"code": 0, "status": "sent", "body": content}
    except Exception as e:
        return {"code": 1, "status": f"Serverside error: {e}"}


@app.route("/upd", methods=['POST'])
def upd():
    global last_data, V
    try:
        dta = str(flask.request.get_data())
        if dta != last_data:
            last_data = dta
            obj = flask.request.get_json()
            V = ActiveCharInfo(obj)
            with open("rec.json", 'w') as f:
                f.write(json.dumps(obj))
        return {"code": 0, "status": "accepted"}
    except Exception as e:
        return {"code": 1, "status": f"Serverside error: {e}"}

@app.route("/eval", methods=["POST"])
def evcmd():
    global V

    def d(N, T=1):
        s=0
        for _ in range(T):
            s+=random.randint(1, N)
        return s

    try:
        cmd = str(flask.request.get_json()["pvl"])
        return {"code": 0, "status": "accepted", "body": str(eval(cmd))}
    except Exception as e:
        return {"code": 1, "status": f"Serverside error: {e}"}
    
@app.route("/index.html")
def index():
    return static_resources.resources["index.html"].read()

@app.route("/back_sync.js")
def backsync():
    return static_resources.resources["back_sync.js"].read()

@app.route("/py_console.js")
def pysconsole():
    print("sent")
    return static_resources.resources["py_console.js"].read()

if __name__ == "__main__":
    if not os.path.exists("rec.json"):
        with open("rec.json", "w") as f: f.write("{}")
    

    app.run(port=8080)