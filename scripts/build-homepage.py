"""Refresh the standalone homepage's embedded JavaScript modules."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
homepage = root / "alutrends-homepage.html"
html = homepage.read_text()
modules = ["alutrends-cart", "alutrends-catalogue", "alutrends-receipt"]
after_app = ["alutrends-homepage-content", "alutrends-cart-widget"]

def block(name):
    source = (root / f"{name}.js").read_text()
    # HTML's raw-text parser terminates scripts even inside JavaScript strings.
    source = re.sub(r"</script", r"<\\/script", source, flags=re.IGNORECASE)
    return f'  <script id="{name}-runtime">\n{source}  </script>\n'

for name in [*modules, *after_app]:
    html = re.sub(rf'  <script id="{name}-runtime">[\s\S]*?</script>\n', "", html)

anchor = '  <script id="alutrends-homepage-app">'
if html.count(anchor) != 1:
    raise SystemExit("Expected exactly one homepage app script")
html = html.replace(anchor, "".join(block(name) for name in modules) + anchor, 1)
html = html.replace("</body>", "".join(block(name) for name in after_app) + "</body>", 1)
homepage.write_text(html)
print(f"Refreshed {homepage.name} ({homepage.stat().st_size:,} bytes)")
