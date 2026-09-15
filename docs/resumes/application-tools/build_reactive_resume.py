#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import argparse
import base64
import mimetypes
from pathlib import Path
from typing import Any

import requests


ROOT = Path(__file__).resolve().parents[3]
ENV_PATH = ROOT / ".env.local"
TMP_DIR = ROOT / "tmp/resumes"
PROFILE_IMAGE_PATH = ROOT / "public/email-signatures/jerami-hero-145.jpg"
SCHEMA_URL = "https://rxresu.me/schema.json"
DEFAULT_BASE_URL = "https://rxresu.me/api/openapi"
DEFAULT_JOB = "bealls-ai-specialist"
SWIFT_AQUA_WASP_ID = "019f2ab9-9442-700b-9a60-09f5e4c343b6"

JOBS: dict[str, dict[str, Any]] = {
    "social-media-video-editor": {
        "headline": "Social Media Video Editor",
        "email": "Jerami@singleton-systems.com",
        "phone": "407-473-3637",
        "location": "Riverview, FL",
        "summary": (
            "Social Media Video Editor with 10+ years across social content, sports, education, "
            "retail television, and live broadcast. Currently handles ongoing part-time Catena Media "
            "editing and additional Upwork client work, shaping raw footage into polished social and "
            "YouTube videos with strong pacing, clear storytelling, captions, music, sound effects, "
            "and simple motion graphics. Experienced in Adobe Premiere Pro, client communication, "
            "feedback, and deadline-driven delivery."
        ),
        "experience_bullets": {
            "current-freelance": [
                "Turn raw host-led sports footage into polished YouTube and social videos, tightening story flow and pacing while adding supporting visuals, captions, music, sound design, and branded motion graphics.",
                "Handle ongoing part-time editing for Catena Media's Lineups brand alongside additional Upwork and direct-client projects, managing intake, revisions, communication, and final delivery.",
                "Use Adobe Premiere Pro and After Effects for captions, music, sound effects, pacing, simple graphics, color correction, and audio cleanup as each edit requires.",
                "Maintain organized project files, repeatable quality-control checks, and platform-ready exports across multiple client workflows.",
            ],
            "national-prospect-id": [
                "Produced 1,000+ multi-sport athlete highlight reels, shaping raw game footage into clear stories for recruiting audiences.",
                "Scaled output to 70 videos per month during peak enrollment growth while maintaining pacing, clip selection, clarity, and quality-control standards.",
                "Applied sports judgment to identify key plays, frame athlete value, and keep edits engaging across different sports and source-footage conditions.",
                "Built reusable Premiere Pro templates, naming conventions, and delivery workflows that supported consistent weekly deadlines.",
            ],
            "nursehub": [
                "Restructured 60+ hours of YouTube course content and processed 180-200 lesson assets across repeated course migrations.",
                "Improved pacing and clarity across long-form educational videos while standardizing captions, transcripts, audio, and export settings.",
                "Built deterministic FFmpeg workflows that increased assembly throughput 2-3x and eliminated recurring export errors.",
                "Converted scattered source material into organized, learner-ready modules with consistent formatting and reliable quality control.",
            ],
            "home-shopping-network": [
                "Supported high-volume television content creation through on-set production, camera operation, lighting, audio, and asset capture.",
                "Worked directly with models, products, producers, and creative teams to capture demonstrations, before-and-after footage, and brand storytelling content.",
                "Maintained visual consistency, brand standards, and technical quality across deadline-driven broadcast and digital shoots.",
            ],
            "wfla-news-channel-8": [
                "Supported live news broadcasts through studio floor coordination, graphics operation, robotic cameras, and reliable on-air execution.",
                "Communicated with producers, directors, and technical teams under live production constraints where timing and accuracy mattered.",
            ],
            "freelance-broadcast-pa": [
                "Supported camera, graphics, setup, operation, and breakdown for live sports broadcasts across collegiate and professional events.",
                "Built an early foundation in deadline-driven production, visual timing, technical troubleshooting, and team communication.",
            ],
        },
        "skills": [
            {
                "id": "editing-story",
                "hidden": False,
                "icon": "",
                "iconColor": "rgba(31, 75, 130, 1)",
                "name": "Editing & Story",
                "proficiency": "",
                "level": 0,
                "keywords": [
                    "Adobe Premiere Pro",
                    "Social video editing",
                    "Long-form YouTube",
                    "Short-form / Reels",
                    "Pacing and timing",
                    "Captions",
                    "Music and sound effects",
                ],
            },
            {
                "id": "finishing",
                "hidden": False,
                "icon": "",
                "iconColor": "rgba(31, 75, 130, 1)",
                "name": "Finishing",
                "proficiency": "",
                "level": 0,
                "keywords": [
                    "Adobe After Effects",
                    "Simple motion graphics",
                    "Audio cleanup",
                    "Basic color correction",
                    "Adobe Media Encoder",
                    "FFmpeg",
                ],
            },
            {
                "id": "delivery",
                "hidden": False,
                "icon": "",
                "iconColor": "rgba(31, 75, 130, 1)",
                "name": "Client Delivery",
                "proficiency": "",
                "level": 0,
                "keywords": [
                    "Clear communication",
                    "Feedback and revisions",
                    "Deadline management",
                    "File organization",
                    "Quality control",
                ],
            },
        ],
        "profiles": [
            {
                "id": "profile-singleton-systems",
                "hidden": False,
                "icon": "",
                "iconColor": "rgba(31, 75, 130, 1)",
                "network": "Portfolio",
                "username": "singleton-systems.com",
                "website": {
                    "url": "https://singleton-systems.com",
                    "label": "singleton-systems.com",
                    "inlineLink": True,
                },
            },
            {
                "id": "profile-linkedin",
                "hidden": False,
                "icon": "",
                "iconColor": "rgba(31, 75, 130, 1)",
                "network": "LinkedIn",
                "username": "linkedin.com/in/jeramisingleton",
                "website": {
                    "url": "https://www.linkedin.com/in/jeramisingleton/",
                    "label": "linkedin.com/in/jeramisingleton",
                    "inlineLink": True,
                },
            },
            {
                "id": "profile-educational-content",
                "hidden": False,
                "icon": "",
                "iconColor": "rgba(31, 75, 130, 1)",
                "network": "Educational Content",
                "username": "jeramisingleton.carrd.co",
                "website": {
                    "url": "https://jeramisingleton.carrd.co/",
                    "label": "jeramisingleton.carrd.co",
                    "inlineLink": True,
                },
            },
            {
                "id": "profile-upwork",
                "hidden": False,
                "icon": "",
                "iconColor": "rgba(31, 75, 130, 1)",
                "network": "Upwork",
                "username": "Video Editor Profile",
                "website": {
                    "url": "https://www.upwork.com/freelancers/~01376b12599102b2cc",
                    "label": "Upwork profile",
                    "inlineLink": True,
                },
            },
        ],
        "notes": "General social media video editor resume generated from confirmed Singleton Systems resume and current freelance facts.",
        "json_filename": "social-media-video-editor-reactive-resume.json",
        "pdf_filename": "Jerami_Singleton_Social_Media_Video_Editor_Resume.pdf",
        "resume_name": "Social Media Video Editor",
        "resume_slug": "social-media-video-editor",
        "resume_tags": ["Social Media", "Video Editing"],
        "current_freelance": True,
        "hide_icons": False,
        "hide_picture": True,
        "icloud_resume_folder": True,
        "page_margin_y": 26,
        "national_prospect_period": "February 2024 - June 2026",
        "reactive_resume_id": "01a09d4e-d9c7-76dc-87c9-35ca9199c894",
        "show_freelance_broadcast": True,
        "style_rules": [
            {
                "id": "tighten-skills-top",
                "label": "Move left panel upward",
                "enabled": True,
                "target": {"scope": "sectionType", "sectionType": "skills"},
                "slots": {"section": {"marginTop": -48}},
            },
            {
                "id": "tighten-profiles-top",
                "label": "Keep profile links on page one",
                "enabled": True,
                "target": {"scope": "sectionType", "sectionType": "profiles"},
                "slots": {"section": {"marginTop": -28}},
            }
        ],
    },
    "bealls-ai-specialist": {
        "headline": "AI Specialist | Jay23singleton@gmail.com | 407-473-3637",
        "summary": (
            "AI Specialist with a broadcast and video production background who moved into "
            "practical AI-assisted workflow systems through high-volume recruiting operations and course "
            "migration work. Built FastAPI middleware, Supabase cleanup contracts, prompt development, "
            "output evaluation, documentation, and audit scripts around real operator workflows."
        ),
        "experience_bullets": {
            "national-prospect-id": [
                "Used AI-assisted analysis to map recruiting-ops workflows across scheduling, video status, notes, follow-up actions, and legacy dashboard behavior.",
                "Built Raycast command surfaces and a FastAPI translator layer to make repeated operator steps faster to test, document, and repeat.",
                "Organized workflow facts into Supabase-backed source-of-truth contracts separate from temporary UI state and support caches.",
                "Developed prompts, evaluated outputs, documented edge cases, and wrote parity/audit scripts to validate cleanup logic and handoff quality.",
            ],
            "nursehub": [
                "Managed over 50 hours of curriculum and 180-200 lesson assets through AI-assisted planning and course migration workflows.",
                "Built deterministic FFmpeg workflows that increased assembly throughput 2-3x and reduced avoidable export errors.",
                "Standardized transcript handling, naming schemas, encoding rules, upload paths, and quality control across repeated course libraries.",
                "Converted scattered source material into organized, learner-ready modules with clear order, consistent formatting, and reliable review paths.",
            ],
            "home-shopping-network": [
                "Supported high-volume retail television production through camera work, lighting, asset capture, and product demo workflows.",
            ],
            "wfla-news-channel-8": [
                "Supported live news broadcasts through studio floor coordination, graphics, robotic camera operation, and on-air execution.",
            ],
            "freelance-broadcast-pa": [
                "Supported camera, graphics, setup, operation, and breakdown for live sports broadcasts across collegiate and professional events.",
            ],
        },
        "skills": [
            {
                "id": "ai-workflow",
                "hidden": False,
                "icon": "",
                "iconColor": "rgba(31, 75, 130, 1)",
                "name": "AI Workflow Systems",
                "proficiency": "",
                "level": 0,
                "keywords": [
                    "Generative AI tools",
                    "Prompt development",
                    "AI output evaluation",
                    "Workflow automation",
                    "Documentation",
                ],
            },
            {
                "id": "technical-tools",
                "hidden": False,
                "icon": "",
                "iconColor": "rgba(31, 75, 130, 1)",
                "name": "Technical Tools",
                "proficiency": "",
                "level": 0,
                "keywords": [
                    "Python",
                    "FastAPI",
                    "SQL",
                    "Supabase",
                    "QA / parity testing",
                ],
            },
            {
                "id": "operations",
                "hidden": False,
                "icon": "",
                "iconColor": "rgba(31, 75, 130, 1)",
                "name": "Operations",
                "proficiency": "",
                "level": 0,
                "keywords": [
                    "Data cleanup",
                    "Validation",
                    "Excel",
                    "PowerPoint",
                    "FFmpeg workflows",
                ],
            },
        ],
        "notes": "Bealls AI Specialist variant generated from Singleton Systems confirmed resume data.",
        "json_filename": "bealls-ai-specialist-reactive-resume.json",
        "pdf_filename": "Jerami.Singleton_Bealls_AI_Specialist_Reactive_Resume.pdf",
        "reactive_resume_id": SWIFT_AQUA_WASP_ID,
    },
}


def load_dotenv(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def website(url: str = "", label: str = "", inline: bool = True) -> dict[str, Any]:
    return {"url": url, "label": label or url, "inlineLink": inline}


def section(title: str, items: list[dict[str, Any]], hidden: bool = False, icon: str = "") -> dict[str, Any]:
    return {
        "title": title,
        "icon": icon,
        "columns": 1,
        "hidden": hidden,
        "keepTogether": False,
        "startOnNewPage": False,
        "items": items,
    }


def bullets(items: list[str]) -> str:
    return "<ul>" + "".join(f"<li>{item}</li>" for item in items) + "</ul>"


def image_data_uri(path: Path) -> str:
    mime_type = mimetypes.guess_type(path.name)[0] or "image/jpeg"
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime_type};base64,{encoded}"


def job_config(job_slug: str) -> dict[str, Any]:
    try:
        return JOBS[job_slug]
    except KeyError as exc:
        valid = ", ".join(sorted(JOBS))
        raise SystemExit(f"Unknown job '{job_slug}'. Valid jobs: {valid}") from exc


def json_output_path(job_slug: str) -> Path:
    return TMP_DIR / job_config(job_slug)["json_filename"]


def pdf_output_path(job_slug: str) -> Path:
    config = job_config(job_slug)
    if config.get("icloud_resume_folder"):
        output_dir = Path.home() / "Library/Mobile Documents/com~apple~CloudDocs/Records/23/Resumes"
    else:
        output_dir = Path.home() / "Documents"
    return output_dir / config["pdf_filename"]


def build_resume_data(job_slug: str = DEFAULT_JOB) -> dict[str, Any]:
    config = job_config(job_slug)
    experience_bullets = config["experience_bullets"]
    experience_items: list[dict[str, Any]] = []
    if config.get("current_freelance"):
        experience_items.append(
            {
                "id": "current-freelance",
                "hidden": False,
                "company": "Upwork & Direct Clients",
                "position": "Freelance Video Editor",
                "location": "Remote",
                "period": "June 2026 - Present",
                "website": website("https://www.upwork.com/freelancers/~01376b12599102b2cc", "Upwork profile"),
                "description": bullets(experience_bullets["current-freelance"]),
                "roles": [],
            }
        )

    experience_items.extend(
        [
            {
                "id": "national-prospect-id",
                "hidden": False,
                "company": "National Prospect ID",
                "position": "Video Editor",
                "location": "Remote",
                "period": config.get("national_prospect_period", "February 2024 - June 2026"),
                "website": website(),
                "description": bullets(experience_bullets["national-prospect-id"]),
                "roles": [],
            },
            {
                "id": "nursehub",
                "hidden": False,
                "company": "NurseHub",
                "position": "Video Editor",
                "location": "Remote",
                "period": "July 2024 - December 2025",
                "website": website(),
                "description": bullets(experience_bullets["nursehub"]),
                "roles": [],
            },
            {
                "id": "home-shopping-network",
                "hidden": False,
                "company": "Home Shopping Network",
                "position": "Production Technician",
                "location": "St. Petersburg, FL",
                "period": "December 2020 - February 2023",
                "website": website(),
                "description": bullets(experience_bullets["home-shopping-network"]),
                "roles": [],
            },
            {
                "id": "wfla-news-channel-8",
                "hidden": False,
                "company": "WFLA News Channel 8",
                "position": "Production Technician",
                "location": "Tampa, FL",
                "period": "January 2018 - April 2019",
                "website": website(),
                "description": bullets(experience_bullets["wfla-news-channel-8"]),
                "roles": [],
            },
            {
                "id": "freelance-broadcast-pa",
                "hidden": not config.get("show_freelance_broadcast", False),
                "company": "Freelance",
                "position": "Broadcast Production Assistant",
                "location": "Central Florida",
                "period": "August 2014 - January 2018",
                "website": website(),
                "description": bullets(experience_bullets["freelance-broadcast-pa"]),
                "roles": [],
            },
        ]
    )
    return {
        "$schema": SCHEMA_URL,
        "version": "5.0.0",
        "picture": {
            "hidden": config.get("hide_picture", not PROFILE_IMAGE_PATH.exists()),
            "url": image_data_uri(PROFILE_IMAGE_PATH) if PROFILE_IMAGE_PATH.exists() else "",
            "size": 96,
            "rotation": 0,
            "aspectRatio": 1,
            "borderRadius": 48,
            "borderColor": "rgba(31, 75, 130, 1)",
            "borderWidth": 0,
            "shadowColor": "rgba(0, 0, 0, 0)",
            "shadowWidth": 0,
        },
        "basics": {
            "name": "Jerami Singleton",
            "headline": config["headline"],
            "email": config.get("email", ""),
            "phone": config.get("phone", ""),
            "location": config.get("location", ""),
            "website": {"url": "", "label": ""},
            "customFields": [],
        },
        "summary": {
            "title": "Summary",
            "icon": "",
            "columns": 1,
            "hidden": False,
            "keepTogether": False,
            "startOnNewPage": False,
            "content": config["summary"],
        },
        "sections": {
            "profiles": section(
                "Portfolio",
                config.get("profiles", [
                    {
                        "id": "profile-singleton-systems",
                        "hidden": False,
                        "icon": "",
                        "iconColor": "rgba(31, 75, 130, 1)",
                        "network": "Links",
                        "username": "singleton-systems.com\nlinkedin.com/in/jeramisingleton",
                        "website": website("https://singleton-systems.com", "singleton-systems.com"),
                    },
                    {
                        "id": "profile-linkedin",
                        "hidden": True,
                        "icon": "",
                        "iconColor": "rgba(31, 75, 130, 1)",
                        "network": "LinkedIn",
                        "username": "jeramisingleton",
                        "website": website("https://linkedin.com/in/jeramisingleton", "linkedin.com/in/jeramisingleton"),
                    },
                ]),
            ),
            "experience": section(
                "Experience",
                experience_items,
            ),
            "education": section(
                "Education",
                [
                    {
                        "id": "stetson",
                        "hidden": False,
                        "school": "Stetson University",
                        "degree": "Bachelor of Communications",
                        "area": "Communications",
                        "grade": "",
                        "location": "DeLand, FL",
                        "period": "2016",
                        "website": website(),
                        "description": "",
                    },
                    {
                        "id": "spc",
                        "hidden": False,
                        "school": "St. Petersburg College",
                        "degree": "Computer Programming / Information Technology Coursework",
                        "area": "",
                        "grade": "",
                        "location": "St. Petersburg, Florida",
                        "period": "2021 - 2023",
                        "website": website(),
                        "description": "",
                    },
                ],
            ),
            "projects": section("Projects", [], hidden=True),
            "skills": section("Skills", config["skills"]),
            "languages": section("Languages", [], hidden=True),
            "interests": section("Interests", [], hidden=True),
            "awards": section("Awards", [], hidden=True),
            "certifications": section("Certifications", [], hidden=True),
            "publications": section("Publications", [], hidden=True),
            "volunteer": section("Volunteer", [], hidden=True),
            "references": section("References", [], hidden=True),
        },
        "customSections": [
            {
                "id": "career-highlights",
                "type": "summary",
                "title": "Career Highlights",
                "icon": "",
                "columns": 1,
                "hidden": True,
                "keepTogether": False,
                "startOnNewPage": False,
                "items": [
                    {
                        "id": "highlight-1",
                        "hidden": False,
                        "content": "Used AI-assisted analysis to map recurring business workflows, inspect legacy behavior, and turn scattered work into documented systems.",
                    },
                    {
                        "id": "highlight-2",
                        "hidden": False,
                        "content": "Built Raycast command surfaces, FastAPI adapter logic, Supabase source-of-truth contracts, debug templates, and parity/audit scripts.",
                    },
                    {
                        "id": "highlight-3",
                        "hidden": False,
                        "content": "Produced 1,000+ athlete highlight reels, scaled delivery to 70 videos per month, and supported course migration across 60+ hours of content.",
                    },
                ],
            }
        ],
        "metadata": {
            "template": "ditto",
            "layout": {
                "sidebarWidth": 30,
                "pages": [
                    {
                        "fullWidth": False,
                        "main": ["summary", "experience"],
                        "sidebar": ["skills", "education", "profiles"],
                    }
                ],
            },
            "page": {
                "gapX": 18,
                "gapY": 12,
                "marginX": 32,
                "marginY": config.get("page_margin_y", 24),
                "format": "letter",
                "locale": "en-US",
                "hideLinkUnderline": True,
                "hideIcons": config.get("hide_icons", True),
                "hideSectionIcons": True,
            },
            "design": {
                "level": {"icon": "", "type": "hidden"},
                "colors": {
                    "primary": "rgba(31, 75, 130, 1)",
                    "text": "rgba(34, 34, 34, 1)",
                    "background": "rgba(255, 255, 255, 1)",
                },
            },
            "typography": {
                "body": {
                    "fontFamily": "Open Sans",
                    "fontWeights": ["400", "600"],
                    "fontSize": 10.5,
                    "lineHeight": 1.3,
                },
                "heading": {
                    "fontFamily": "Open Sans",
                    "fontWeights": ["700"],
                    "fontSize": 14,
                    "lineHeight": 1.2,
                },
            },
            "notes": config["notes"],
            "styleRules": config.get("style_rules", [
                {
                    "id": "tighten-summary-top",
                    "label": "Tighten Summary top spacing",
                    "enabled": True,
                    "target": {"scope": "sectionType", "sectionType": "summary"},
                    "slots": {"section": {"marginTop": -48}},
                },
                {
                    "id": "tighten-skills-top",
                    "label": "Tighten Skills top spacing",
                    "enabled": True,
                    "target": {"scope": "sectionType", "sectionType": "skills"},
                    "slots": {"section": {"marginTop": -48}},
                },
            ]),
        },
    }


def validate_with_ajv(resume_data: dict[str, Any], json_out: Path) -> None:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    schema_path = TMP_DIR / "reactive-resume-schema.json"
    schema = requests.get(SCHEMA_URL, timeout=30)
    schema.raise_for_status()
    schema_data = schema.json()
    schema_path.write_text(json.dumps(schema_data, indent=2))
    json_out.write_text(json.dumps(resume_data, indent=2))
    try:
        import jsonschema
    except ModuleNotFoundError:
        validate_required_shape(resume_data, schema_data)
        print("schema_validation=required-shape-fallback")
        return

    validator_cls = jsonschema.validators.validator_for(schema_data)
    validator_cls.check_schema(schema_data)
    validator = validator_cls(schema_data)
    errors = sorted(validator.iter_errors(resume_data), key=lambda error: list(error.path))
    if errors:
        summary = "\n".join(f"{'/'.join(map(str, error.path))}: {error.message}" for error in errors[:20])
        raise RuntimeError(f"Reactive Resume schema validation failed:\n{summary}")
    print("schema_validation=jsonschema")


def validate_required_shape(resume_data: dict[str, Any], schema_data: dict[str, Any]) -> None:
    missing = [key for key in schema_data.get("required", []) if key not in resume_data]
    if missing:
        raise RuntimeError(f"Missing top-level Reactive Resume fields: {', '.join(missing)}")

    required_sections = schema_data["properties"]["sections"]["required"]
    sections = resume_data.get("sections", {})
    missing_sections = [key for key in required_sections if key not in sections]
    if missing_sections:
        raise RuntimeError(f"Missing Reactive Resume sections: {', '.join(missing_sections)}")

    section_schema = schema_data["properties"]["sections"]["properties"]
    for name, value in sections.items():
        required = section_schema.get(name, {}).get("required", [])
        missing_fields = [key for key in required if key not in value]
        if missing_fields:
            raise RuntimeError(f"Section {name} missing fields: {', '.join(missing_fields)}")

        item_required = section_schema.get(name, {}).get("properties", {}).get("items", {}).get("items", {}).get("required", [])
        for item in value.get("items", []):
            missing_item_fields = [key for key in item_required if key not in item]
            if missing_item_fields:
                item_id = item.get("id", "<missing id>")
                raise RuntimeError(f"Section {name} item {item_id} missing fields: {', '.join(missing_item_fields)}")


def extract_resume_id(payload: Any) -> str:
    if isinstance(payload, str):
        return payload
    if isinstance(payload, dict):
        for key in ("id", "resumeId"):
            value = payload.get(key)
            if isinstance(value, str) and value:
                return value
        data = payload.get("data")
        if isinstance(data, dict):
            for key in ("id", "resumeId"):
                value = data.get(key)
                if isinstance(value, str) and value:
                    return value
        if isinstance(data, str) and data:
            return data
    raise RuntimeError(f"Could not find resume ID in import response keys: {list(payload.keys()) if isinstance(payload, dict) else type(payload).__name__}")


def import_and_download(resume_data: dict[str, Any], pdf_out: Path) -> str:
    api_key = os.environ.get("REACTIVE_RESUME_API_KEY")
    if not api_key:
        raise RuntimeError("Missing REACTIVE_RESUME_API_KEY in environment or .env.local")

    base_url = os.environ.get("REACTIVE_RESUME_BASE_URL", DEFAULT_BASE_URL).rstrip("/")
    headers = {"x-api-key": api_key, "Content-Type": "application/json"}

    import_response = requests.post(
        f"{base_url}/resumes/import",
        headers=headers,
        json={"data": resume_data},
        timeout=60,
    )
    if import_response.status_code >= 400:
        raise RuntimeError(f"Reactive import failed with HTTP {import_response.status_code}: {import_response.text[:500]}")

    resume_id = extract_resume_id(import_response.json())
    pdf_response = requests.get(
        f"{base_url}/resumes/{resume_id}/pdf",
        headers={"x-api-key": api_key},
        timeout=90,
    )
    if pdf_response.status_code >= 400:
        raise RuntimeError(f"Reactive PDF export failed with HTTP {pdf_response.status_code}: {pdf_response.text[:500]}")

    content_type = pdf_response.headers.get("content-type", "")
    if "pdf" not in content_type.lower() and not pdf_response.content.startswith(b"%PDF"):
        raise RuntimeError(f"Reactive PDF export did not return a PDF. Content-Type: {content_type}")

    pdf_out.parent.mkdir(parents=True, exist_ok=True)
    pdf_out.write_bytes(pdf_response.content)
    return resume_id


def update_and_download(
    resume_data: dict[str, Any], resume_id: str, pdf_out: Path, config: dict[str, Any]
) -> str:
    api_key = os.environ.get("REACTIVE_RESUME_API_KEY")
    if not api_key:
        raise RuntimeError("Missing REACTIVE_RESUME_API_KEY in environment or .env.local")

    base_url = os.environ.get("REACTIVE_RESUME_BASE_URL", DEFAULT_BASE_URL).rstrip("/")
    headers = {"x-api-key": api_key, "Content-Type": "application/json"}

    update_payload: dict[str, Any] = {"data": resume_data}
    if config.get("resume_name"):
        update_payload["name"] = config["resume_name"]
    if config.get("resume_slug"):
        update_payload["slug"] = config["resume_slug"]
    if config.get("resume_tags") is not None:
        update_payload["tags"] = config["resume_tags"]

    update_response = requests.put(
        f"{base_url}/resumes/{resume_id}",
        headers=headers,
        json=update_payload,
        timeout=60,
    )
    if update_response.status_code >= 400:
        raise RuntimeError(f"Reactive update failed with HTTP {update_response.status_code}: {update_response.text[:500]}")

    pdf_response = requests.get(
        f"{base_url}/resumes/{resume_id}/pdf",
        headers={"x-api-key": api_key},
        timeout=90,
    )
    if pdf_response.status_code >= 400:
        raise RuntimeError(f"Reactive PDF export failed with HTTP {pdf_response.status_code}: {pdf_response.text[:500]}")

    content_type = pdf_response.headers.get("content-type", "")
    if "pdf" not in content_type.lower() and not pdf_response.content.startswith(b"%PDF"):
        raise RuntimeError(f"Reactive PDF export did not return a PDF. Content-Type: {content_type}")

    pdf_out.parent.mkdir(parents=True, exist_ok=True)
    pdf_out.write_bytes(pdf_response.content)
    return resume_id


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build a job-specific Reactive Resume PDF from confirmed resume truth.",
    )
    parser.add_argument(
        "--job",
        default=DEFAULT_JOB,
        choices=sorted(JOBS),
        help="Job variant to build.",
    )
    parser.add_argument(
        "--no-api",
        action="store_true",
        help="Validate and write Reactive JSON only; do not import/export through Reactive Resume.",
    )
    parser.add_argument(
        "--update-existing",
        action="store_true",
        help="Update the existing Reactive resume configured for this job instead of importing a new random-named resume.",
    )
    parser.add_argument(
        "--force-overwrite-existing",
        action="store_true",
        help="Allow --update-existing to overwrite manual edits in the existing Reactive resume.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    load_dotenv(ENV_PATH)
    json_out = json_output_path(args.job)
    pdf_out = pdf_output_path(args.job)
    config = job_config(args.job)
    resume_data = build_resume_data(args.job)
    validate_with_ajv(resume_data, json_out)
    print(f"job={args.job}")
    print(f"validated_json={json_out}")

    if args.no_api:
        return 0

    if args.update_existing:
        if not args.force_overwrite_existing:
            raise RuntimeError(
                "--update-existing overwrites the full live Reactive resume. "
                "Use --force-overwrite-existing only after confirming manual Reactive edits should be replaced."
            )
        resume_id = config.get("reactive_resume_id")
        if not resume_id:
            raise RuntimeError(f"Job {args.job} does not define reactive_resume_id")
        resume_id = update_and_download(resume_data, resume_id, pdf_out, config)
    else:
        resume_id = import_and_download(resume_data, pdf_out)
    print(f"reactive_resume_id={resume_id}")
    print(f"pdf={pdf_out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
