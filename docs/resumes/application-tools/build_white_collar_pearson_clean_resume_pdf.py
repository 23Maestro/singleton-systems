from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


OUT = Path.home() / "Documents/Jerami.Singleton_Bealls_AI_Specialist_Pearson_Clean_Resume.pdf"

PAGE_W, PAGE_H = letter
BLUE = colors.HexColor("#1F4B82")
TEXT = colors.HexColor("#222222")
MUTED = colors.HexColor("#4A4A4A")
RULE = colors.HexColor("#9B9B9B")

AVENIR_NEXT = "/System/Library/Fonts/Avenir Next.ttc"
FONT_REGULAR = "AvenirNext-Regular"
FONT_BOLD = "AvenirNext-Bold"
FONT_ITALIC = "AvenirNext-Italic"

pdfmetrics.registerFont(TTFont(FONT_BOLD, AVENIR_NEXT, subfontIndex=0))
pdfmetrics.registerFont(TTFont(FONT_ITALIC, AVENIR_NEXT, subfontIndex=4))
pdfmetrics.registerFont(TTFont(FONT_REGULAR, AVENIR_NEXT, subfontIndex=7))

MARGIN_X = 42
TOP = PAGE_H - 42
BOTTOM = 42
LEFT_W = 168
DIVIDER_X = MARGIN_X + LEFT_W + 18
RIGHT_X = DIVIDER_X + 28
RIGHT_W = PAGE_W - RIGHT_X - MARGIN_X
LEFT_X = MARGIN_X


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


def draw_wrapped(c, text, x, y, width, font=FONT_REGULAR, size=11, leading=13.2, color=TEXT):
    c.setFillColor(color)
    c.setFont(font, size)
    lines = wrap_text(text, font, size, width)
    for i, line in enumerate(lines):
        c.drawString(x, y - i * leading, line)
    return y - len(lines) * leading


def draw_heading(c, text, x, y, size=14):
    c.setFillColor(BLUE)
    c.setFont(FONT_BOLD, size)
    c.drawString(x, y, text.upper())
    return y - size - 5


def draw_bullets(c, items, x, y, width, size=10.75, leading=12.9):
    for item in items:
        c.setFillColor(TEXT)
        c.setFont(FONT_REGULAR, size)
        c.drawString(x, y, "-")
        y = draw_wrapped(c, item, x + 10, y, width - 10, size=size, leading=leading)
        y -= 2
    return y


def draw_role(c, x, y, title, meta, bullets, width=RIGHT_W):
    c.setFillColor(TEXT)
    c.setFont(FONT_BOLD, 12)
    c.drawString(x, y, title)
    y -= 13
    c.setFillColor(MUTED)
    c.setFont(FONT_ITALIC, 10)
    c.drawString(x, y, meta)
    y -= 13
    y = draw_bullets(c, bullets, x, y, width, size=10.75, leading=12.9)
    return y - 5


def begin_page(c, draw_left=False):
    c.setFillColor(colors.white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setStrokeColor(RULE)
    c.setLineWidth(0.55)
    c.line(DIVIDER_X, BOTTOM, DIVIDER_X, TOP)
    if draw_left:
        draw_left_rail(c)


def draw_left_rail(c):
    x = LEFT_X
    y = TOP - 8

    c.setFillColor(TEXT)
    c.setFont(FONT_BOLD, 10.5)
    c.drawString(x, y, "Jay23singleton@gmail.com")
    y -= 13
    c.drawString(x, y, "407-473-3637")
    y -= 13
    c.setFont(FONT_REGULAR, 10.5)
    c.drawString(x, y, "Riverview, FL")

    y -= 30
    y = draw_heading(c, "Skills", x, y)
    skills = [
        "Generative AI tools",
        "Prompt development",
        "AI output evaluation",
        "Python / FastAPI",
        "SQL / Supabase",
        "Data cleanup & validation",
        "Workflow automation",
        "Documentation & SOPs",
        "QA / parity testing",
        "Excel & PowerPoint",
        "FFmpeg workflows",
    ]
    y = draw_bullets(c, skills, x, y, LEFT_W, size=10.5, leading=12.6)

    y -= 16
    y = draw_heading(c, "Education", x, y)
    y = draw_wrapped(c, "Bachelor of Communications", x, y, LEFT_W, font=FONT_BOLD, size=10.75, leading=12.9)
    y = draw_wrapped(c, "Stetson University, 2016", x, y - 1, LEFT_W, size=10.5, leading=12.6)
    y -= 8
    y = draw_wrapped(c, "Computer Programming / Information Technology Coursework", x, y, LEFT_W, font=FONT_BOLD, size=10.5, leading=12.6)
    y = draw_wrapped(c, "St. Petersburg College, 2021 - 2023", x, y - 1, LEFT_W, size=10.5, leading=12.6)

    y -= 16
    y = draw_heading(c, "Portfolio", x, y)
    links = [
        "jeramisingleton.carrd.co",
        "singleton-systems.com",
        "linkedin.com/in/jeramisingleton",
    ]
    draw_bullets(c, links, x, y, LEFT_W, size=10.5, leading=12.6)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=letter)
    c.setTitle("Jerami Singleton - Bealls AI Specialist Pearson Clean Resume")

    begin_page(c, draw_left=True)
    y = TOP - 2
    c.setFillColor(BLUE)
    c.setFont(FONT_BOLD, 29)
    c.drawString(RIGHT_X, y, "Jerami Singleton")
    y -= 31

    y = draw_heading(c, "Summary", RIGHT_X, y)
    summary = (
        "AI Specialist candidate with a broadcast and video production background who moved into practical "
        "AI-assisted workflow systems through high-volume recruiting operations and course migration work. "
        "Built FastAPI middleware, Supabase cleanup contracts, prompt and output review practices, "
        "documentation, and audit scripts around real operator workflows."
    )
    y = draw_wrapped(c, summary, RIGHT_X, y, RIGHT_W, size=11, leading=13.2)
    y -= 10

    y = draw_heading(c, "Career Highlights", RIGHT_X, y)
    highlights = [
        "Used AI-assisted analysis to map recurring business workflows, inspect legacy behavior, and turn scattered work into documented systems.",
        "Built Raycast command surfaces, FastAPI adapter logic, Supabase source-of-truth contracts, debug templates, and parity/audit scripts.",
        "Produced 1,000+ athlete highlight reels, scaled delivery to 70 videos per month, and supported course migration across 60+ hours of content.",
    ]
    y = draw_bullets(c, highlights, RIGHT_X, y, RIGHT_W, size=10.75, leading=12.9)
    y -= 9

    y = draw_heading(c, "Experience", RIGHT_X, y)
    y = draw_role(
        c,
        RIGHT_X,
        y,
        "National Prospect ID - Video Editor",
        "Remote | February 2024 - June 2026",
        [
            "Used AI-assisted analysis to map recruiting-ops workflows across scheduling, video status, notes, follow-up actions, and legacy dashboard behavior.",
            "Built Raycast command surfaces and a FastAPI translator layer to make repeated operator steps faster to test, document, and repeat.",
            "Organized workflow facts into Supabase-backed source-of-truth contracts separate from temporary UI state and support caches.",
            "Developed prompts, evaluated outputs, documented edge cases, and wrote parity/audit scripts to validate cleanup logic and handoff quality.",
            "Produced 1,000+ multi-sport athlete highlight reels and scaled delivery to 70 videos per month during peak enrollment growth.",
        ],
    )
    draw_role(
        c,
        RIGHT_X,
        y,
        "NurseHub - Video Editor",
        "Remote | July 2024 - December 2025",
        [
            "Used AI-assisted planning to centralize course migration requirements across 60+ hours of curriculum and 180-200 lesson assets.",
            "Built deterministic FFmpeg workflows that increased assembly throughput 2-3x and reduced avoidable export errors.",
            "Standardized transcript handling, naming schemas, encoding rules, upload paths, and quality control across repeated course libraries.",
            "Converted scattered source material into organized, learner-ready modules with clear order, consistent formatting, and reliable review paths.",
        ],
    )

    c.showPage()
    begin_page(c, draw_left=False)
    y = TOP - 4
    y = draw_heading(c, "Experience Continued", RIGHT_X, y)
    y = draw_role(
        c,
        RIGHT_X,
        y,
        "Home Shopping Network - Production Technician",
        "St. Petersburg, FL | December 2020 - February 2023",
        [
            "Supported high-volume retail television production through on-set operations, camera work, lighting, asset capture, and product demo workflows.",
            "Worked with models, products, and creative teams to produce application, before/after, and product storytelling footage for broadcast and digital use.",
            "Maintained visual consistency, brand standards, and technical quality across large-scale retail content production.",
        ],
    )
    y = draw_role(
        c,
        RIGHT_X,
        y,
        "WFLA News Channel 8 - Production Technician",
        "Tampa, FL | January 2018 - April 2019",
        [
            "Supported live news broadcasts through studio floor coordination, graphics operation, robotic camera work, and reliable on-air execution.",
            "Communicated with producers, directors, and technical teams under live production constraints where timing and accuracy mattered.",
        ],
    )
    draw_role(
        c,
        RIGHT_X,
        y,
        "Freelance - Broadcast Production Assistant",
        "Central Florida | August 2014 - January 2018",
        [
            "Supported camera, graphics, setup, operation, and breakdown for live sports broadcasts across collegiate and professional events.",
            "Built an early foundation in deadline-driven production, technical troubleshooting, team communication, and repeatable event workflows.",
        ],
    )

    c.save()


if __name__ == "__main__":
    build()
