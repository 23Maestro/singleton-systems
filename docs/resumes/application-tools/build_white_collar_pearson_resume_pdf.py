from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


OUT = Path.home() / "Library/Mobile Documents/com~apple~CloudDocs/_Inbox/Jerami.Singleton_PearsonResume.pdf"

PAGE_W, PAGE_H = A4
BLUE = colors.HexColor("#1f4b82")
TEXT = colors.HexColor("#2f3033")
BLACK = colors.HexColor("#111111")

BORDER = 34
INNER_X = 46
INNER_Y = 46
INNER_W = PAGE_W - 92
INNER_H = PAGE_H - 92
LEFT_W = 160
GAP = 28
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


def draw_wrapped(c, text, x, y, width, font="Helvetica", size=10.5, leading=14, bullet=False):
    c.setFillColor(TEXT)
    c.setFont(font, size)
    lines = wrap_text(text, font, size, width - (12 if bullet else 0))
    if bullet:
        c.drawString(x, y, u"\u2022")
        text_x = x + 12
    else:
        text_x = x
    for i, line in enumerate(lines):
        c.drawString(text_x, y - i * leading, line)
    return y - len(lines) * leading


def draw_heading(c, text, x, y, size=17):
    c.setFillColor(BLACK)
    c.setFont("Helvetica-Bold", size)
    c.drawString(x, y, text)
    return y - size - 9


def draw_role(c, x, y, title, meta_lines, bullets, width=RIGHT_W):
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 12.2)
    c.drawString(x, y, title)
    y -= 15
    c.setFont("Helvetica-Oblique", 11)
    for meta in meta_lines:
        c.drawString(x, y, meta)
        y -= 13
    y -= 3
    for bullet in bullets:
        y = draw_wrapped(c, bullet, x, y, width, size=10.4, leading=13.2, bullet=True)
        y -= 3
    return y - 11


def draw_sidebar(c):
    x = INNER_X + 14
    y = PAGE_H - INNER_Y - 42

    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 10.8)
    c.drawString(x, y, "Jay23singleton@gmail.com")
    y -= 18
    c.drawString(x, y, "407-473-3637")
    y -= 18
    c.setFont("Helvetica", 12)
    c.drawString(x, y, "Riverview, FL")

    y -= 46
    y = draw_heading(c, "Skills", x, y, size=16)
    skills = [
        "Adobe Premiere Pro",
        "Adobe Media Encoder",
        "Adobe After Effects",
        "Adobe Audition",
        "FFmpeg",
        "Social Video Editing",
        "Short-Form Video Packaging",
        "Transcript & Caption Workflows",
        "Camera, Lighting & Audio",
        "LMS Course Packaging",
        "Quality Control & Delivery",
    ]
    for skill in skills:
        y = draw_wrapped(c, skill, x, y, LEFT_W - 24, size=10.8, leading=14, bullet=True)
        y -= 3

    y -= 30
    y = draw_heading(c, "Education", x, y, size=16)
    c.setFont("Helvetica-Oblique", 10.7)
    c.drawString(x, y, "2016")
    y -= 22
    c.setFont("Helvetica-Bold", 10.7)
    c.drawString(x, y, "Bachelor Of")
    y -= 15
    c.drawString(x, y, "Communications:")
    y -= 15
    c.drawString(x, y, "Stetson University")
    y -= 15
    c.setFont("Helvetica", 10.7)
    c.drawString(x, y, "DeLand, FL")

    y -= 45
    y = draw_heading(c, "Portfolio & LinkedIn", x, y, size=15)
    for link in ["jeramisingleton.carrd.co", "singleton-systems.com", "LinkedIn: /in/jeramisingleton"]:
        y = draw_wrapped(c, link, x, y, LEFT_W - 24, size=10.5, leading=13.5, bullet=True)
        y -= 12


def begin_page(c, sidebar=True):
    c.setFillColor(BLUE)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.rect(BORDER, BORDER, PAGE_W - 2 * BORDER, PAGE_H - 2 * BORDER, fill=1, stroke=0)
    c.setStrokeColor(TEXT)
    c.setLineWidth(0.6)
    c.line(DIVIDER_X, BORDER, DIVIDER_X, PAGE_H - BORDER)
    if sidebar:
        draw_sidebar(c)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("Jerami Singleton - Pearson Resume")

    begin_page(c, sidebar=True)
    y = PAGE_H - INNER_Y - 54
    c.setFillColor(TEXT)
    c.setFont("Helvetica", 34)
    c.drawString(RIGHT_X, y, "Jerami Singleton")
    y -= 58

    y = draw_heading(c, "Summary", RIGHT_X, y, size=17)
    summary = (
        "Video Editor and content production specialist with 10+ years across sports, education, "
        "broadcast, retail, and digital media. Experienced turning raw footage, complex source "
        "material, transcripts, and production notes into polished video packages, course modules, "
        "and social-ready assets. Strong fit for hands-on social content creation through end-to-end "
        "editing, caption and transcript workflows, camera-aware production judgment, platform-conscious "
        "packaging, and repeatable post-production systems built for speed, consistency, and quality."
    )
    y = draw_wrapped(c, summary, RIGHT_X, y, RIGHT_W, size=11.2, leading=14.7)
    y -= 26

    y = draw_heading(c, "Experience", RIGHT_X, y, size=17)
    y = draw_role(
        c,
        RIGHT_X,
        y,
        "National Prospect ID - Video Editor",
        ["02/2024 - 06/2026"],
        [
            "Produced 1,000+ multi-sport athlete highlight reels for recruiting distribution, shaping raw game footage into clear, polished video stories.",
            "Scaled output to 70 videos per month during peak enrollment growth while maintaining pacing, clarity, and quality-control standards.",
            "Built structured post-production systems with templates, naming conventions, QC workflows, and repeatable delivery processes.",
            "Improved review and handoff flow for recurring creative requests, helping reduce friction across high-volume video work.",
            "Maintained consistent weekly delivery under deadline pressure and enrollment spikes.",
        ],
    )
    y = draw_role(
        c,
        RIGHT_X,
        y,
        "NurseHub - Video Editor",
        ["07/2024 - 12/2025"],
        [
            "Restructured 60+ hours of YouTube course content and processed 180-200 lesson assets across repeated course migrations.",
            "Led course migration through deterministic FFmpeg workflows, increasing assembly throughput 2-3x and eliminating export errors.",
            "Standardized naming schema, transcript handling, encoding rules, and upload-ready delivery paths across multiple course libraries.",
            "Converted scattered source material into organized, learner-ready modules with clear order, consistent formatting, and reliable QC.",
        ],
    )
    c.showPage()
    begin_page(c, sidebar=False)
    y = PAGE_H - INNER_Y - 46
    y = draw_role(
        c,
        RIGHT_X,
        y,
        "Home Shopping Network - Production Technician",
        ["St. Petersburg, USA", "12/2020 - 02/2023"],
        [
            "Supported high-volume retail television content creation through on-set production, camera operation, lighting, and asset capture.",
            "Worked directly with models, products, and creative teams to produce demo, application, before/after, and product storytelling footage for broadcast and digital use.",
            "Ensured visual consistency, brand standards, and technical quality across large-scale product shoots.",
        ],
    )
    y = draw_role(
        c,
        RIGHT_X,
        y,
        "WFLA News Channel 8 - Production Technician",
        ["Tampa, USA", "01/2018 - 04/2019"],
        [
            "Live Broadcast Support: Assisted in live news broadcasts for a leading local station, supporting smooth and accurate on-air delivery.",
            "Floor Operations: Coordinated studio floor activity with producers and directors under live production constraints.",
            "Broadcast Technology: Operated graphics systems and robotic cameras to support reliable live output.",
        ],
    )
    draw_role(
        c,
        RIGHT_X,
        y,
        "Freelance - Broadcast Production Assistant",
        ["Central Florida, USA", "08/2014 - 01/2018"],
        [
            "Live Event Coverage: Supported camera, graphics, and technical operations for live sports broadcasts across collegiate and professional events.",
            "Technical Execution: Assisted with setup, operation, and breakdown of broadcast equipment to ensure reliable production workflows.",
        ],
    )
    c.save()


if __name__ == "__main__":
    build()
