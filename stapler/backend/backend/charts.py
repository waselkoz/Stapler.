"""Chart generator — pure CSS/HTML/SVG charts with zero JS dependencies."""

import math
import hashlib


def bar_chart(labels: list[str], values: list[float], title: str = "", height: int = 300, bar_color: str = "#2563eb", show_values: bool = True) -> str:
    if not labels or not values:
        return ""
    max_val = max(values) or 1
    bars = []
    for i, (label, val) in enumerate(zip(labels, values)):
        pct = (val / max_val) * 100
        bar_h = max(4, pct)
        val_str = f'<span class="chart-value">{val}</span>' if show_values else ""
        bars.append(f'''<div class="chart-bar-group">
        {val_str}
        <div class="chart-bar" style="height:{bar_h}%;background:{bar_color};animation-delay:{i * 0.05}s">
          <div class="chart-bar-fill" style="background:linear-gradient(to top, {bar_color}, {bar_color}dd)"></div>
        </div>
        <span class="chart-label">{label}</span>
      </div>''')

    uid = hashlib.md5((title + str(labels)).encode()).hexdigest()[:8]
    bars_html = "\n".join(bars)
    return f'''<div class="chart-container">
  {f'<h3 class="chart-title">{title}</h3>' if title else ''}
  <div class="chart-bar-chart" style="--chart-height:{height}px">
    {bars_html}
  </div>
  <style>
    .chart-container {{ width:100%; padding:1.5rem; }}
    .chart-title {{ font-size:1.125rem; font-weight:600; margin-bottom:1.5rem; color:var(--text,#1a1a2e); }}
    .chart-bar-chart {{ display:flex; align-items:flex-end; justify-content:space-around; gap:0.5rem; height:var(--chart-height,300px); padding-top:1.5rem; border-bottom:2px solid var(--border,rgba(0,0,0,0.06)); }}
    .chart-bar-group {{ display:flex; flex-direction:column; align-items:center; flex:1; height:100%; justify-content:flex-end; position:relative; }}
    .chart-bar {{ width:100%; max-width:48px; border-radius:4px 4px 0 0; position:relative; min-height:4px; animation:chart-grow 0.6s cubic-bezier(0.4,0,0.2,1) both; transform-origin:bottom; }}
    .chart-bar-fill {{ position:absolute; inset:0; border-radius:4px 4px 0 0; }}
    .chart-value {{ font-size:0.75rem; font-weight:600; color:var(--text,#1a1a2e); margin-bottom:0.25rem; }}
    .chart-label {{ font-size:0.6875rem; color:var(--text-muted,#6b7280); margin-top:0.5rem; text-align:center; max-width:64px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }}
    @keyframes chart-grow {{ from {{ transform:scaleY(0); }} to {{ transform:scaleY(1); }} }}
  </style>
</div>'''


def horizontal_bar_chart(labels: list[str], values: list[float], title: str = "", bar_color: str = "#2563eb") -> str:
    if not labels or not values:
        return ""
    max_val = max(values) or 1
    rows = []
    for i, (label, val) in enumerate(zip(labels, values)):
        pct = (val / max_val) * 100
        rows.append(f'''<div class="hbar-row">
      <span class="hbar-label">{label}</span>
      <div class="hbar-track">
        <div class="hbar-fill" style="width:{pct}%;background:{bar_color};animation-delay:{i * 0.05}s">
          <span class="hbar-value">{val}</span>
        </div>
      </div>
    </div>''')

    rows_html = "\n".join(rows)
    uid = hashlib.md5(("hbar" + title + str(labels)).encode()).hexdigest()[:8]
    return f'''<div class="chart-container">
  {f'<h3 class="chart-title">{title}</h3>' if title else ''}
  <div class="hbar-chart">
    {rows_html}
  </div>
  <style>
    .hbar-chart {{ display:flex; flex-direction:column; gap:0.75rem; padding:0.5rem 0; }}
    .hbar-row {{ display:flex; align-items:center; gap:0.75rem; }}
    .hbar-label {{ min-width:80px; font-size:0.8125rem; color:var(--text,#1a1a2e); font-weight:500; text-align:right; }}
    .hbar-track {{ flex:1; height:28px; background:var(--border,rgba(0,0,0,0.06)); border-radius:14px; overflow:hidden; }}
    .hbar-fill {{ height:100%; border-radius:14px; display:flex; align-items:center; justify-content:flex-end; padding:0 0.75rem; animation:hbar-grow 0.6s cubic-bezier(0.4,0,0.2,1) both; transform-origin:left; min-width:fit-content; }}
    .hbar-value {{ font-size:0.6875rem; font-weight:600; color:#fff; }}
    @keyframes hbar-grow {{ from {{ transform:scaleX(0); }} to {{ transform:scaleX(1); }} }}
  </style>
</div>'''


def pie_chart(labels: list[str], values: list[float], title: str = "", size: int = 240) -> str:
    if not labels or not values:
        return ""
    total = sum(values) or 1
    colors = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#db2777", "#0891b2", "#4f46e5", "#f97316", "#84cc16"]
    segments = []
    cumulative = 0
    for i, (label, val) in enumerate(zip(labels, values)):
        pct = val / total
        deg = pct * 360
        start = cumulative
        end = cumulative + deg
        mid = start + deg / 2
        large = 1 if deg > 180 else 0
        x1 = size / 2 + size / 2 * math.cos(math.radians(start - 90))
        y1 = size / 2 + size / 2 * math.sin(math.radians(start - 90))
        x2 = size / 2 + size / 2 * math.cos(math.radians(end - 90))
        y2 = size / 2 + size / 2 * math.sin(math.radians(end - 90))
        color = colors[i % len(colors)]
        segments.append(f'''<path d="M{size/2},{size/2} L{x1},{y1} A{size/2},{size/2} 0 {large},1 {x2},{y2} Z" fill="{color}" />''')
        cumulative += deg

    mid_x = size / 2 + size * 0.35 * math.cos(math.radians(cumulative - deg / 2 - 90))
    mid_y = size / 2 + size * 0.35 * math.sin(math.radians(cumulative - deg / 2 - 90))

    segments_html = "\n    ".join(segments)
    legend = "\n".join(f'<div class="pie-legend-item"><span class="pie-legend-dot" style="background:{colors[i % len(colors)]}"></span>{label} <strong>({round(val/total*100)}%)</strong></div>' for i, (label, val) in enumerate(zip(labels, values)))

    return f'''<div class="chart-container pie-wrapper">
  {f'<h3 class="chart-title">{title}</h3>' if title else ''}
  <div class="pie-layout">
    <svg viewBox="0 0 {size} {size}" width="{size}" height="{size}" class="pie-svg">
      {segments_html}
    </svg>
    <div class="pie-legend">{legend}</div>
  </div>
  <style>
    .pie-wrapper .chart-title {{ text-align:center; }}
    .pie-layout {{ display:flex; align-items:center; gap:2rem; flex-wrap:wrap; justify-content:center; }}
    .pie-svg {{ flex-shrink:0; }}
    .pie-legend {{ display:flex; flex-direction:column; gap:0.5rem; }}
    .pie-legend-item {{ display:flex; align-items:center; gap:0.5rem; font-size:0.8125rem; color:var(--text,#1a1a2e); }}
    .pie-legend-dot {{ width:10px; height:10px; border-radius:50%; flex-shrink:0; }}
  </style>
</div>'''


def doughnut_chart(labels: list[str], values: list[float], title: str = "", size: int = 240, hole: float = 0.6) -> str:
    pie = pie_chart(labels, values, title, size)
    inner_r = size / 2 * hole
    center = size / 2
    mask = f'''<mask id="donut-hole">
      <rect width="{size}" height="{size}" fill="white" />
      <circle cx="{center}" cy="{center}" r="{inner_r}" fill="black" />
    </mask>'''
    svg_with_hole = pie.replace('<svg', f'<svg><defs>{mask}</defs>')
    svg_with_hole = svg_with_hole.replace('pie-svg', 'pie-svg donut-svg')
    return svg_with_hole.replace(
      '<style>',
      '<style>.donut-svg { mask: url(#donut-hole); } '
    )


def line_chart(points: list[dict], title: str = "", width: int = 600, height: int = 250, line_color: str = "#2563eb") -> str:
    """points: list of {label, value}"""
    if not points:
        return ""
    values = [p["value"] for p in points]
    labels = [p["label"] for p in points]
    max_val = max(values) or 1
    padding = 30
    chart_w = width - padding * 2
    chart_h = height - padding * 2

    path_d = []
    area_d = []
    dots = []
    grid = []
    x_step = chart_w / (len(points) - 1) if len(points) > 1 else chart_w

    for i, p in enumerate(points):
        x = padding + i * x_step
        y = padding + chart_h - (p["value"] / max_val * chart_h)
        path_d.append(f"{'M' if i == 0 else 'L'}{x},{y}")
        area_d.append(f"{'M' if i == 0 else 'L'}{x},{y}")
        dots.append(f'<circle cx="{x}" cy="{y}" r="4" fill="{line_color}" stroke="#fff" stroke-width="2"/>')
        dots.append(f'<text x="{x}" y="{y - 10}" text-anchor="middle" font-size="11" fill="var(--text,#1a1a2e)" font-weight="600">{p["value"]}</text>')
        grid.append(f'<line x1="{x}" y1="{padding}" x2="{x}" y2="{height - padding}" stroke="var(--border,rgba(0,0,0,0.06))" stroke-dasharray="3"/>')

    path = " ".join(path_d)
    area = " ".join(area_d) + f" L{padding + (len(points)-1) * x_step},{height - padding} L{padding},{height - padding} Z"

    x_labels = "\n".join(
        f'<text x="{padding + i * x_step}" y="{height - 8}" text-anchor="middle" font-size="11" fill="var(--text-muted,#6b7280)">{labels[i]}</text>'
        for i in range(len(points))
    )

    uid = hashlib.md5(("line" + title + str(values)).encode()).hexdigest()[:8]
    return f'''<div class="chart-container">
  {f'<h3 class="chart-title">{title}</h3>' if title else ''}
  <svg viewBox="0 0 {width} {height}" width="100%" style="max-width:{width}px" class="line-svg">
    {grid[0] if grid else ''}
    {grid[-1] if len(grid) > 1 else ''}
    <path d="{area}" fill="{line_color}15" />
    <path d="{path}" fill="none" stroke="{line_color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      class="line-path" style="stroke-dasharray:1000;stroke-dashoffset:1000;animation:line-draw 1.2s ease forwards" />
    {dots}
    {x_labels}
  </svg>
  <style>
    .line-svg {{ display:block; }}
    @keyframes line-draw {{ to {{ stroke-dashoffset:0; }} }}
  </style>
</div>'''
