from PIL import Image, ImageFont, ImageDraw

dim = 1024
font = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', dim)

temp = Image.new('L', (dim, dim), 0)
draw = ImageDraw.Draw(temp)
draw.text((0, 0), '*', font=font, fill=255)
bbox = temp.getbbox()
cropped = temp.crop(bbox)

target_dim = 1024
cw, ch = cropped.size
px = (target_dim - cw) // 2
py = (target_dim - ch) // 2

full = Image.new('L', (target_dim, target_dim), 0)
full.paste(cropped, (px, py))

w, h = full.size
data = full.load()

# Trace outer contour
start = None
for y in range(h):
    for x in range(w):
        if data[x, y] > 128:
            start = (x, y)
            break
    if start: break

dirs = [(0, -1), (1, -1), (1, 0), (1, 1), (0, 1), (-1, 1), (-1, 0), (-1, -1)]

contour = []
curr = start
back_dir = 6

for _ in range(50000):
    contour.append(curr)
    start_idx = (back_dir + 1) % 8
    found = False
    for i in range(8):
        idx = (start_idx + i) % 8
        dx, dy = dirs[idx]
        nx, ny = curr[0] + dx, curr[1] + dy
        if 0 <= nx < w and 0 <= ny < h and data[nx, ny] > 128:
            curr = (nx, ny)
            back_dir = (idx + 4) % 8
            found = True
            break
    if not found or curr == start:
        break

def rdp(points, epsilon):
    if len(points) < 3:
        return points
    p1 = points[0]
    p2 = points[-1]
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    norm = (dx*dx + dy*dy)**0.5
    if norm == 0:
        return [p1, p2]
    max_d = 0
    max_i = 0
    for i in range(1, len(points)-1):
        p = points[i]
        d = abs(dy*p[0] - dx*p[1] + p2[0]*p1[1] - p2[1]*p1[0]) / norm
        if d > max_d:
            max_d = d
            max_i = i
    if max_d > epsilon:
        r1 = rdp(points[:max_i+1], epsilon)
        r2 = rdp(points[max_i:], epsilon)
        return r1[:-1] + r2
    else:
        return [p1, p2]

# Scale points to 512x512 coordinate space with 0.1 precision
simplified = rdp(contour, 1.5)
points_512 = [(round(x / 2.0, 1), round(y / 2.0, 1)) for x, y in simplified]

d_path = 'M ' + ' L '.join(f'{x} {y}' for x, y in points_512) + ' Z'

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="106" fill="#191b18"/>
  <path d="{d_path}" fill="#c6cd99"/>
</svg>
'''

with open('src/assets/icon.svg', 'w') as f:
    f.write(svg)

# Also update favicon.svg with this true vector path for consistency
svg_48 = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="106" fill="#191b18"/>
  <path d="{d_path}" fill="#c6cd99"/>
</svg>
'''
with open('src/assets/favicon.svg', 'w') as f:
    f.write(svg_48)

print("Generated src/assets/icon.svg and updated src/assets/favicon.svg successfully!")
