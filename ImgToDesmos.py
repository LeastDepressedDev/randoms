from PIL import Image

#
#  Settings
#

# Clusterizing distance, the more the value, the less colors
c_dist = 24

# Clusterizing steps
c_steps = 5

# Limiting area
area = [0,0,1000,1000]

# Desmos pixel size
w, h = 0.1, 0.1

# Print lines in the end
print_lines = False


#
# 
#

class cwi:

    def __init__(self, central, inf):
        self.mid_point = central
        self.points = [central]
        self.inner = inf
        self.xpts = central[0]
        self.ypts = central[1]
        self.zpts = central[2]
    
    def tryAdd(self, point, inf):
        if (self.mid_point[0]-point[0])**2+(self.mid_point[1]-point[1])**2+(self.mid_point[2]-point[2])**2 < c_dist**2:
            self.points.append(point)
            self.xpts += point[0]
            self.ypts += point[1]
            self.zpts += point[2]
            self.mid_point = (self.xpts/len(self.points), self.ypts/len(self.points), self.zpts/len(self.points))
            self.inner += inf
            return True
        else:
            return False


reg = {}

img = Image.open("in.jpeg")
pix = img.load()

print(f"Image opened: size{img.size}, {img.size[0]*img.size[1]} pixels)")
# define colors N sets
for x in range(img.size[0]):
    for y in range(img.size[1]):
        if area[0]<=x<=area[2] and area[1]<=y<=area[3]:
            p = pix[x,y]
            color = (p[0],p[1],p[2]) # removing alpha layer cuz fuck it
            try:
                reg[color].append((-x,-y))
            except:
                reg[color] = [(-x,-y)]
print(f"First layer reg - size:{len(reg.keys())}")

def cts(reg):
    clusters = []
    # Clusterizing
    for k in reg.keys():
        flag = True
        for v in clusters:
            if v.tryAdd(k, reg[k]):
                flag = False
                break
        if flag: clusters.append(cwi(k, reg[k]))
    return clusters

def arrange(cwi_array):
    nreg = {}
    for a in cwi_array:
        pt = a.mid_point
        nreg[(int(pt[0]), int(pt[1]), int(pt[2]))] = a.inner
    return nreg

def drf(index):
    return "P_{"+str(index)+"}=\\left(w\\left(\\cos2\\pi t\\right)^{\\frac{1}{3}}+2wp_{"+str(index)+"}.x,h\\left(\\sin2\\pi t\\right)^{\\frac{1}{3}}+2hp_{"+str(index)+"}.y\\right)"

for i in range(1, c_steps+1):
    reg = arrange(cts(reg))
    print(f"Clusterized step({i}) - size:{len(reg.keys())}")

next = input("Allow build(y/n):")
if next[0]=="y":
    lines = f"w={w}\nh={h}\n"
    i = 1
    for k,v in reg.items():
        lines += "C_{" +str(i)+ "}="+"\\operatorname{rgb}"+f"{k}"+"\n"+"p_{"+str(i)+"}="+f"{v}\n"+drf(i)+"\n"
        i += 1
    print(["Lines printing disabled!", print_lines][print_lines])
    with open("output.txt", "w") as f:
        f.write(lines)
        print(f"Exported lines into {f.name}")