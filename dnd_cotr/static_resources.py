class static_resource:

    path: str
    id: str

    def __init__(self, path: str, id: str=None):
        self.path = path
        if id!=None: self.id = id
        else: self.id = path

    def __str__(self):
        return f"{self.id}@{self.path}"
    
    def read(self):
        return None
    
class page_resource(static_resource):
    def read(self):
        with open(self.path, 'r') as f:
            content = f.read()
        return content
    
class script_resource(static_resource):
    def read(self):
        with open(self.path, 'r') as f:
            content = f.read()
        return content
    
resources: dict[str, static_resource] = {}
    
def __register__(rsc: static_resource): 
    resources[rsc.id] = rsc

# init

__register__(page_resource("index.html"))
__register__(script_resource('back_sync.js'))
__register__(script_resource("py_console.js"))