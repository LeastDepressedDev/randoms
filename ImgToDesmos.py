from PIL import Image

#
#  Settings
#

# Clusterizing distance, the more the value, the less colors
c_dist = 23

# Clusterizing steps
c_steps = 0

# Limiting area
area = [0,0,1000,1000]

# Desmos pixel size
w, h = 0.1, 0.1

# Print lines in the end
print_lines = False

# Render mode: 
# 0->default/laggy on high pixel but high quality 
# 1->polygons 
# 2->optimized polygons
# 3->Partilation
render_mode = 3

# Partilation list max size and use polygons in parts
part_max = 5000
part_poly = True

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
    # Cos/sin
    if render_mode==0:
        return "P_{"+str(index)+"}=\\left(w\\left(\\cos2\\pi t\\right)^{\\frac{1}{3}}+2wp_{"+str(index)+"}.x,h\\left(\\sin2\\pi t\\right)^{\\frac{1}{3}}+2hp_{"+str(index)+"}.y\\right)"
    # Polygon
    elif render_mode==1:
        return "P_{"+str(index)+"}=\\left[\\operatorname{polygon}\\left(b+M_{ask}\\right)\\operatorname{for}b=p_{"+str(index)+"}\\right]"
    # Opti polygon
    elif render_mode==2:
        return "P_{"+str(index)+"}=\\left[\\operatorname{polygon}\\left(\\left(wb.x,hb.y\\right)+M_{ask}\\right)\\operatorname{for}b=p_{"+str(index)+"}\\right]"

for i in range(1, c_steps+1):
    reg = arrange(cts(reg))
    print(f"Clusterized step({i}) - size:{len(reg.keys())}")

next = input("Allow build(y/n):")
if next[0]=="y":
    if render_mode in [0, 1, 2]:
        lines = f"w={w}\nh={h}\n" + "M_{ask}=\\left[\\left(0,0\\right),\\left(0,h\\right),\\left(w,h\\right),\\left(w,0\\right)\\right]\n"
        i = 1
        for k,v in reg.items():
            dots = f"{v}\n"
            if render_mode==1:
                dots = dots.replace('(','(w\\cdot').replace(')','\\cdot h)')
            lines += "C_{" +str(i)+ "}="+"\\operatorname{rgb}"+f"{k}"+"\n"+"p_{"+str(i)+"}="+dots+drf(i)+"\n"
            i += 1
        print(["Lines printing disabled!", print_lines][print_lines])
        with open("output.txt", "w") as f:
            f.write(lines)
            print(f"Exported lines into {f.name}")
    elif render_mode in [3]:
        lines = f"w={w}\nh={h}\n" + "M_{ask}=\\left[\\left(0,0\\right),\\left(0,h\\right),\\left(w,h\\right),\\left(w,0\\right)\\right]\n"
        i = 1
        n = part_max
        partC = "C_{1}=["
        partA = "a_{1}=\\operatorname{join}\\left("
        for k,v in reg.items():
            if n-len(v) <= 0:
                partC = partC[:-1].replace('[', '\\left[').replace(']','\\right]')+"\\right]\n"
                partA = partA[:-1]+"\\right)\n"
                lines += partA + partC
                if part_poly: lines += "V_{"+str(i)+"}="+"\\left[\\operatorname{polygon}\\left(\\left(wb.x,hb.y\\right)+M_{ask}\\right)\\operatorname{for}b=a_{"+str(i)+"}\\right]\n"
                i+=1
                partC = "C_{"+str(i)+"}=["
                partA = "a_{"+str(i)+"}=\\operatorname{join}\\left("
                n=part_max
            partA += f"{v},".replace('[', '\\left[').replace(']','\\right]')
            partC += ("\\operatorname{rgb}\\left("+f"{k[0]},{k[1]},{k[2]}"+"\\right),")*len(v)
            n-=len(v)
        partC = partC[:-1].replace('[', '\\left[').replace(']','\\right]')+"\\right]\n"
        partA = partA[:-1]+"\\right)\n"
        lines += partA + partC
        if part_poly: lines += "V_{"+str(i)+"}="+"\\left[\\operatorname{polygon}\\left(\\left(wb.x,hb.y\\right)+M_{ask}\\right)\\operatorname{for}b=a_{"+str(i)+"}\\right]\n"
        print(["Lines printing disabled!", print_lines][print_lines])
        with open("output.txt", "w") as f:
            f.write(lines)
            print(f"Exported lines into {f.name}")
    else:
        print("Unknown render mode sellected. Woopsie error!")