from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


OUT = Path.home() / "Library/Mobile Documents/com~apple~CloudDocs/_Inbox/v2-2026_CSA_Jerami_Singleton_.pdf"

PAGE_W, PAGE_H = A4
BLUE = colors.HexColor("#1f4b82")
TEXT = colors.HexColor("#2f3033")
MUTED = colors.HexColor("#5b616b")
BLACK = colors.HexColor("#111111")

BORDER = 34
INNER_X = 46
INNER_Y = 46
INNER_W = PAGE_W - 92
LEFT_W = 150
GAP = 26
DIVIDER_X = INNER_X + LEFT_W + 8
RIGHT_X = DIVIDER_X + GAP
RIGHT_W = INNER_X + INNER_W - RIGHT_X


def wrap_text(text, font, size, width):
    words = text.split()
    lines = []
    line = ""
    for word in words:
        trial = word if not line else f"{line} {word}"
        if stringWidth(trial, font, size) <= width:
            line = trial
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_wrapped(c, text, x, y, width, font="Helvetica", size=9.4, leading=12.1, bullet=False):
    c.setFillColor(TEXT)
    c.setFont(font, size)
    lines = wrap_text(text, font, size, width - (11 if bullet else 0))
    text_x = x
    if bullet:
        c.drawString(x, y, "-")
        text_x = x + 10
    for i, line in enumerate(lines):
        c.drawString(text_x, y - i * leading, line)
    return y - len(lines) * leading


def draw_heading(c, text, x, y, size=15):
    c.setFillColor(BLACK)
    c.setFont("Helvetica-Bold", size)
    c.drawString(x, y, text)
    return y - size - 7


def draw_role(c, x, y, title, meta, bullets, width=RIGHT_W):
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 10.4)
    c.drawString(x, y, title)
    y -= 12.5
    c.setFillColor(MUTED)
    c.setFont("Helvetica-Oblique", 8.9)
    c.drawString(x, y, meta)
    y -= 12.4
    for bullet in bullets:
        y = draw_wrapped(c, bullet, x, y, width, size=8.75, leading=10.8, bullet=True)
        y -= 1.8
    return y - 5.5


def draw_sidebar(c):
    x = INNER_X + 12
    y = PAGE_H - INNER_Y - 40

    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 9.3)
    c.drawString(x, y, "Jay23singleton@gmail.com")
    y -= 15
    c.drawString(x, y, "407-473-3637")
    y -= 15
    c.setFont("Helvetica", 9.7)
    c.drawString(x, y, "Riverview, FL")

    y -= 36
    y = draw_heading(c, "Skills", x, y, size=14)
    skills = [
        "Customer service",
        "Delivery route work",
        "Package handling",
        "Loading and unloading",
        "Pallet jack use",
        "Route navigation",
        "Safe vehicle handling",
        "Passenger assistance",
        "Warehouse support",
        "Time management",
        "Team communication",
        "Problem solving",
    ]
    for skill in skills:
        y = draw_wrapped(c, skill, x, y, LEFT_W - 22, size=8.9, leading=11.2, bullet=True)
        y -= 1

    y -= 18
    y = draw_heading(c, "Target Roles", x, y, size=14)
    for role in [
        "Delivery Driver",
        "Customer Service Associate",
        "Warehouse Associate",
        "Route Support",
    ]:
        c.setFillColor(TEXT)
        c.setFont("Helvetica", 9.1)
        c.drawString(x, y, role)
        y -= 12

    y -= 22
    y = draw_heading(c, "Links", x, y, size=13)
    for link in ["linkedin.com/in/jeramisingleton", "singleton-systems.com"]:
        y = draw_wrapped(c, link, x, y, LEFT_W - 22, size=8.2, leading=10.4, bullet=True)
        y -= 6


def begin_page(c):
    c.setFillColor(BLUE)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.rect(BORDER, BORDER, PAGE_W - 2 * BORDER, PAGE_H - 2 * BORDER, fill=1, stroke=0)
    c.setStrokeColor(TEXT)
    c.setLineWidth(0.55)
    c.line(DIVIDER_X, BORDER, DIVIDER_X, PAGE_H - BORDER)
    draw_sidebar(c)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("v2-2026_CSA_Jerami_Singleton_")

    begin_page(c)
    y = PAGE_H - INNER_Y - 52
    c.setFillColor(TEXT)
    c.setFont("Helvetica", 31)
    c.drawString(RIGHT_X, y, "Jerami Singleton")
    y -= 30
    c.setFillColor(BLUE)
    c.setFont("Helvetica-Bold", 11.2)
    c.drawString(RIGHT_X, y, "Delivery Driver / Customer Service Associate")
    y -= 34

    y = draw_heading(c, "Summary", RIGHT_X, y, size=15)
    summary = (
        "Customer-focused delivery and service worker with experience across Amazon route work, "
        "hospital valet service, airport passenger assistance, and warehouse support. Reliable "
        "with early starts, package handling, loading and unloading, pallet jack work, safe vehicle "
        "handling, and direct customer assistance."
    )
    y = draw_wrapped(c, summary, RIGHT_X, y, RIGHT_W, size=9.25, leading=11.8)
    y -= 17

    y = draw_heading(c, "Experience", RIGHT_X, y, size=15)
    roles = [
        (
            "Amazon Flex - Delivery Driver",
            "Sarasota / Tampa Bay Area, Florida | August 2023-August 2024",
            [
                "Picked up and completed Amazon Flex delivery blocks on a consistent weekly schedule using a personal vehicle.",
                "Delivered packages across assigned routes while managing timing, navigation, customer drop-off instructions, and access issues.",
                "Handled packages carefully during early-morning blocks, often working four to five days per week.",
            ],
        ),
        (
            "Pepsi Warehouse - Warehouse Associate",
            "Tampa, Florida | April 2023-June 2023",
            [
                "Supported product movement in a fast-paced beverage distribution warehouse.",
                "Used pallet jacks to move product and help keep loads organized for daily movement.",
                "Followed warehouse safety expectations while handling heavy, repetitive work.",
            ],
        ),
        (
            "Optimal U.S. Logistics - Amazon Delivery Driver",
            "Palmetto, Florida | March 2020-December 2020",
            [
                "Delivered Amazon packages on assigned routes for a logistics delivery partner.",
                "Loaded, organized, transported, and delivered packages while keeping pace with route expectations.",
                "Followed customer delivery notes, handled packages with care, and completed stops safely.",
            ],
        ),
        (
            "GAT Airline - Passenger Assistant",
            "Sarasota, Florida | November 2019-March 2020",
            [
                "Assisted airline passengers with bags, boarding, deplaning, and mobility needs.",
                "Provided wheelchair assistance for passengers traveling to and from aircraft.",
                "Communicated with passengers and teammates in a safety-sensitive airport environment.",
            ],
        ),
        (
            "Sarasota Memorial Hospital - Valet",
            "Sarasota, Florida | May 2019-October 2019",
            [
                "Provided valet service for hospital patients, visitors, and staff.",
                "Greeted guests, handled vehicles carefully, and helped maintain a smooth arrival and departure flow.",
                "Delivered direct customer service in a busy medical setting where patience, safety, and clear communication mattered.",
            ],
        ),
    ]
    for title, meta, bullets in roles:
        y = draw_role(c, RIGHT_X, y, title, meta, bullets)

    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
