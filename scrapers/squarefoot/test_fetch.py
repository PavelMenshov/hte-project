import requests
from bs4 import BeautifulSoup

r = requests.get(
    "https://www.squarefoot.com.hk/en/buy/a1/",
    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"},
    timeout=15,
)
print("Status", r.status_code, "Length", len(r.text))
soup = BeautifulSoup(r.text, "html.parser")
cards = soup.select(".item.property_item")
print("Cards .item.property_item:", len(cards))
cards2 = soup.select("[class*='property_item']")
print("Cards [class*=property_item]:", len(cards2))
print("Sell HKD in page:", "Sell HKD" in r.text)
print("ft² in page:", "ft²" in r.text or "ft2" in r.text)
# save first 15k chars
with open("sample.html", "w", encoding="utf-8") as f:
    f.write(r.text[:25000])
print("Wrote sample.html")
