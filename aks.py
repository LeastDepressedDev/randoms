import json
import sys

main_state: State = None
json_prototype = {
    "language": [],
    "female": [],
    "male": [],
    "other": [],
    "artist": [],
    "parody": [],
    "group": []
} 

def print_help():
    print("""
-h, --help -> display help
-i, --init  [name] -> initialise prototype .json file
-e, -r, --exec, --run  [name] -> construct request 
"""[1:])

class State:
    def close(self):
        global main_state
        main_state = GeneralState()
    def step(self, arg: str): 
        self.close()
        return False

class JsonInitState(State):
    def step(self, arg: str):
        global main_state, json_prototype
        try:
            with open([f'{arg}.json', arg][arg.endswith('.json')], 'w', encoding='utf-16') as f:
                f.write(json.dumps(json_prototype, indent=4)) 
        except Exception as e:
            print("Something went wrong on init operation")
            print(str(e))
        self.close()
        return False

class ExecuteState(State):
    def step(self, arg):
        global main_state
        try:
            with open([f'{arg}.json', arg][arg.endswith('.json')], 'r', encoding='utf-16') as f:
                robj: dict[str] = json.loads(f.read())
                ol = []
                for k,v in robj.items():
                    for t in v: 
                        if t.startswith("-"): 
                            ol.append(f'-{k}:"{t[1:]}"')
                        else:
                            ol.append(f'{k}:"{t}"')
                print(" ".join(ol))         
        except Exception as e:
            print("Something went wrong on execute operation")
            print(str(e))
        self.close()
        return False
        



class GeneralState(State):
    def step(self, arg: str):
        global main_state
        arg = arg.lower()
        if arg in ['-h', '--help']: print_help()
        elif arg in ['-i', '--init']: main_state = JsonInitState()
        elif arg in ['-e', '-r', '--exec', '--run']: main_state = ExecuteState()
        else: return True
        return False

main_state = GeneralState()

if len(sys.argv) > 1:
    args: list[str] = sys.argv[1:]
    tpo = False
    for arg in args:
        if main_state.step(arg):
            tpo = True
    if tpo: print("Unknown command found among string request... Type -h tag to display help menu")
else:
    print("Mama mia, it's akuma builder")
