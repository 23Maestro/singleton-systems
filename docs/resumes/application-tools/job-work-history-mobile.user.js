// ==UserScript==
// @name         Job Work History Filler
// @namespace    singleton-systems
// @version      0.1
// @description  Mobile Safari helper for repeated job-application work history fields.
// @match        https://*/*
// @grant        none
// ==/UserScript==

(() => {
  if (window.__jobWorkHistoryFiller) return;
  window.__jobWorkHistoryFiller = true;

  const jobs = {
    amazon: {
      label: "Amazon Flex",
      employer: "Amazon Flex",
      title: "Delivery Driver",
      phone: "",
      address1: "6337 County Road 579",
      address2: "",
      city: "Seffner",
      county: "Hillsborough",
      state: "FL",
      zip: "33584",
      country: "United States",
      startMonth: "08",
      startYear: "2023",
      endMonth: "08",
      endYear: "2024",
      reason: "Started NurseHub contract work",
      responsibilities:
        "Picked up Amazon Flex delivery blocks, delivered packages across assigned routes, followed customer delivery instructions, managed timing and navigation, handled packages carefully, and completed early-morning route work consistently.",
    },
    pepsi: {
      label: "Pepsi Warehouse",
      employer: "Pepsi Warehouse",
      title: "Warehouse Associate",
      phone: "813-971-2550",
      address1: "11315 N 30th St",
      address2: "",
      city: "Tampa",
      county: "Hillsborough",
      state: "FL",
      zip: "33612",
      country: "United States",
      startMonth: "04",
      startYear: "2023",
      endMonth: "06",
      endYear: "2023",
      reason: "Temporary/short-term warehouse role ended",
      responsibilities:
        "Supported product movement in a fast-paced beverage distribution warehouse, used pallet jacks, moved and organized product for daily work, followed warehouse safety expectations, handled repetitive heavy work, and worked with teammates to keep product moving accurately and on schedule.",
    },
    optimal: {
      label: "Optimal U.S. Logistics",
      employer: "Optimal U.S. Logistics",
      title: "Amazon Delivery Driver",
      phone: "727-325-2909",
      address1: "8824 E Adamo Dr",
      address2: "",
      city: "Tampa",
      county: "Hillsborough",
      state: "FL",
      zip: "33619",
      country: "United States",
      startMonth: "03",
      startYear: "2020",
      endMonth: "12",
      endYear: "2020",
      reason: "Role ended",
      responsibilities:
        "Delivered Amazon packages on assigned routes for a logistics delivery partner, loaded and organized packages, operated a delivery vehicle, followed customer delivery notes, completed route stops, handled packages with care, and managed daily route timing and navigation.",
    },
    gat: {
      label: "GAT Airline",
      employer: "GAT Airline Ground Support",
      title: "Passenger Assistant",
      phone: "941-359-2770",
      address1: "6000 Airport Cir",
      address2: "",
      city: "Sarasota",
      county: "Sarasota",
      state: "FL",
      zip: "34243",
      country: "United States",
      startMonth: "11",
      startYear: "2019",
      endMonth: "03",
      endYear: "2020",
      reason: "Role ended",
      responsibilities:
        "Assisted airline passengers with bags, boarding, deplaning, and mobility needs; provided wheelchair assistance; communicated with passengers and teammates in a safety-sensitive airport environment; and helped keep passenger movement organized during active travel periods.",
    },
    smh: {
      label: "Sarasota Memorial",
      employer: "Sarasota Memorial Hospital",
      title: "Valet",
      phone: "941-917-9000",
      address1: "1700 S Tamiami Trail",
      address2: "",
      city: "Sarasota",
      county: "Sarasota",
      state: "FL",
      zip: "34239",
      country: "United States",
      startMonth: "05",
      startYear: "2019",
      endMonth: "10",
      endYear: "2019",
      reason: "Role ended",
      responsibilities:
        "Provided valet service for hospital patients, visitors, and staff; greeted guests; handled vehicles carefully; supported a smooth arrival flow; delivered direct customer service in a busy medical setting; and assisted people who needed quick, respectful help at the hospital entrance.",
    },
  };

  const norm = (value) => String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  const controls = () =>
    [...document.querySelectorAll("input:not([type=hidden]), textarea, select")]
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      })
      .map((el) => ({ el, meta: norm([el.id, el.name, el.placeholder, labelFor(el)].join(" ")) }));

  function labelFor(el) {
    const direct = el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (direct) return direct.innerText;
    let parent = el;
    for (let i = 0; parent && i < 5; i += 1, parent = parent.parentElement) {
      const label = parent.querySelector && parent.querySelector("label");
      if (label && label.innerText.trim()) return label.innerText;
      const text = [...parent.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent)
        .join(" ")
        .trim();
      if (text) return text;
    }
    return "";
  }

  function setValue(item, value) {
    if (!item || !item.el) return false;
    const el = item.el;
    if (el.tagName === "SELECT") {
      const wanted = norm(value);
      const option = [...el.options].find((opt) => norm(opt.value) === wanted || norm(opt.text) === wanted || norm(opt.text).includes(wanted));
      if (!option) return false;
      el.value = option.value;
    } else if (el.type === "checkbox") {
      el.checked = value === true || norm(value) === "yes";
    } else {
      el.value = value || "";
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    return true;
  }

  function findField(list, ...needles) {
    return list.find((item) => needles.every((needle) => item.meta.includes(needle)));
  }

  function fill(job) {
    const list = controls();
    const results = {
      employer: setValue(findField(list, "employer") || findField(list, "company", "name"), job.employer),
      title: setValue(findField(list, "job", "title") || findField(list, "position"), job.title),
      phone: setValue(findField(list, "company", "phone") || findField(list, "employer", "phone"), job.phone),
      address1: setValue(findField(list, "address", "line 1") || findField(list, "address1"), job.address1),
      address2: setValue(findField(list, "address", "line 2") || findField(list, "address2"), job.address2),
      city: setValue(findField(list, "city"), job.city),
      county: setValue(findField(list, "county"), job.county),
      state: setValue(findField(list, "state"), job.state),
      zip: setValue(findField(list, "zip"), job.zip),
      country: setValue(findField(list, "country"), job.country),
      responsibilities: setValue(findField(list, "responsibilities") || findField(list, "duties"), job.responsibilities),
      reason: setValue(findField(list, "reason") || findField(list, "leaving"), job.reason),
      current: setValue(findField(list, "current", "job") || findField(list, "currently", "working"), "No"),
    };

    const monthFields = list.filter((item) => item.meta.includes("month"));
    const yearFields = list.filter((item) => item.meta.includes("year"));
    results.startMonth = setValue(monthFields[0], job.startMonth);
    results.startYear = setValue(yearFields[0], job.startYear);
    results.endMonth = setValue(monthFields[1], job.endMonth);
    results.endYear = setValue(yearFields[1], job.endYear);

    toast(`${job.label}: ${Object.values(results).filter(Boolean).length} fields filled`);
    console.table(results);
  }

  function toast(text) {
    const existing = document.getElementById("jwh-toast");
    if (existing) existing.remove();
    const el = document.createElement("div");
    el.id = "jwh-toast";
    el.textContent = text;
    el.style.cssText = "position:fixed;left:16px;right:16px;bottom:86px;z-index:2147483647;background:#111;color:#fff;padding:12px 14px;border-radius:12px;font:15px system-ui;text-align:center;";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  function openPicker() {
    document.getElementById("jwh-modal")?.remove();
    const wrap = document.createElement("div");
    wrap.id = "jwh-modal";
    wrap.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.35);display:flex;align-items:flex-end;font-family:system-ui;";
    wrap.innerHTML = `
      <div style="background:#fff;width:100%;padding:16px;border-radius:18px 18px 0 0;box-shadow:0 -8px 30px rgba(0,0,0,.18)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <strong style="font-size:17px">Fill Work History</strong>
          <button data-close style="font-size:16px;border:0;background:#eee;border-radius:999px;padding:7px 11px">Close</button>
        </div>
        <div id="jwh-options" style="display:grid;gap:8px"></div>
      </div>`;
    document.body.appendChild(wrap);
    wrap.querySelector("[data-close]").onclick = () => wrap.remove();
    const options = wrap.querySelector("#jwh-options");
    Object.entries(jobs).forEach(([key, job]) => {
      const button = document.createElement("button");
      button.textContent = job.label;
      button.style.cssText = "width:100%;text-align:left;border:1px solid #ddd;background:#fafafa;border-radius:12px;padding:13px 14px;font:16px system-ui;";
      button.onclick = () => {
        wrap.remove();
        fill(jobs[key]);
      };
      options.appendChild(button);
    });
  }

  const button = document.createElement("button");
  button.textContent = "Fill Job";
  button.style.cssText = "position:fixed;right:14px;bottom:20px;z-index:2147483646;border:0;background:#111;color:#fff;border-radius:999px;padding:12px 15px;font:700 15px system-ui;box-shadow:0 6px 20px rgba(0,0,0,.25);";
  button.onclick = openPicker;
  document.body.appendChild(button);
})();
