const SPREADSHEET_ID = "1WixNN_PjxflMoxCjQDfupXVsAJGKZrkiwGzTzXL63go";
const EXISTING_FORM_ID = "19YUeduBb_ip7xFDHxtws-KeKAqSDFQnf2x0Qy9VumJU";
const TASKS_SHEET = "Chores";
const TASK_HEADERS = ["Task ID", "Room", "Task", "Duration", "Plan", "Notes"];

const ROOMS = [
  "Auto",
  "Bathroom",
  "Garage",
  "Kitchen",
  "Laundry",
  "Living Room",
  "Office",
];

const DURATIONS = ["5m", "10m", "15m", "30m", "45m", "60m", "90m", "2h", "4h+"];
const PLAN_OPTIONS = ["Pending", "Today"];

function setupPersonalOpsChores() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const choresSheet = ensureSheet_(spreadsheet, TASKS_SHEET, TASK_HEADERS);
  ensureSheet_(spreadsheet, "Kanban", ROOMS);
  ensureSheet_(spreadsheet, "Daily Plan", TASK_HEADERS);
  ensureSheet_(spreadsheet, "Form Fields", ["Field", "Input", "Values"]);

  applyChoresValidation_(choresSheet);
  buildDerivedTabs_(spreadsheet);

  const form = EXISTING_FORM_ID
    ? FormApp.openById(EXISTING_FORM_ID)
    : createChoresForm_();
  form.setDestination(FormApp.DestinationType.SPREADSHEET, SPREADSHEET_ID);

  PropertiesService.getScriptProperties().setProperties({
    FORM_ID: form.getId(),
    FORM_URL: form.getPublishedUrl(),
    EDIT_URL: form.getEditUrl(),
  });

  ensureFormSubmitTrigger_(spreadsheet);

  return {
    formUrl: form.getPublishedUrl(),
    editUrl: form.getEditUrl(),
    spreadsheetUrl: spreadsheet.getUrl(),
  };
}

function ensureFormSubmitTrigger_(spreadsheet) {
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === "syncLatestFormResponse")
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger("syncLatestFormResponse")
    .forSpreadsheet(spreadsheet)
    .onFormSubmit()
    .create();
}

function createChoresForm_() {
  const form = FormApp.create("Personal Ops Chores Intake");
  form.setDescription("Quick chore capture. Rooms store task lists; Plan is only Pending or Today.");
  form.addListItem().setTitle("Room").setChoiceValues(ROOMS).setRequired(true);
  form.addTextItem().setTitle("Task").setRequired(true);
  form.addListItem().setTitle("Duration").setChoiceValues(DURATIONS).setRequired(true);
  form.addListItem().setTitle("Plan").setChoiceValues(PLAN_OPTIONS).setRequired(true);
  form.addParagraphTextItem().setTitle("Notes").setRequired(false);
  return form;
}

function syncLatestFormResponse(event) {
  const namedValues = event.namedValues || {};
  appendChore_({
    room: first_(namedValues.Room),
    task: first_(namedValues.Task),
    duration: first_(namedValues.Duration) || "15m",
    plan: first_(namedValues.Plan) || "Pending",
    notes: first_(namedValues.Notes),
  });
}

function appendChore_(chore) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(TASKS_SHEET);
  sheet.appendRow([
    makeTaskId_(),
    chore.room,
    chore.task,
    chore.duration,
    chore.plan,
    chore.notes || "",
  ]);
}

function doGet() {
  const rows = SpreadsheetApp.openById(SPREADSHEET_ID)
    .getSheetByName(TASKS_SHEET)
    .getDataRange()
    .getValues();
  const headers = rows.shift();
  const tasks = rows
    .filter((row) => row[0] && row[1])
    .map((row) =>
      headers.reduce((acc, header, index) => {
        acc[header] = row[index];
        return acc;
      }, {})
    );

  return ContentService.createTextOutput(
    JSON.stringify(
      {
        source: "Personal Ops Chores",
        generatedAt: new Date().toISOString(),
        tasks,
      },
      null,
      2
    )
  ).setMimeType(ContentService.MimeType.JSON);
}

function buildDerivedTabs_(spreadsheet) {
  const kanban = spreadsheet.getSheetByName("Kanban");
  kanban.clear();
  kanban.getRange(1, 1, 1, ROOMS.length).setValues([ROOMS]).setFontWeight("bold");
  ROOMS.forEach((room, index) => {
    const col = index + 1;
    const formula = `=IFERROR(FILTER(${TASKS_SHEET}!$C$2:$C,${TASKS_SHEET}!$B$2:$B=${columnLetter_(col)}$1),"")`;
    kanban.getRange(2, col).setFormula(formula);
  });

  const dailyPlan = spreadsheet.getSheetByName("Daily Plan");
  dailyPlan.clear();
  dailyPlan
    .getRange(1, 1, 1, TASK_HEADERS.length)
    .setValues([TASK_HEADERS])
    .setFontWeight("bold");
  dailyPlan
    .getRange(2, 1)
    .setFormula(`=IFERROR(FILTER(${TASKS_SHEET}!A2:F,${TASKS_SHEET}!E2:E="Today"),"")`);

  const fields = spreadsheet.getSheetByName("Form Fields");
  fields.clear();
  fields.getRange(1, 1, 5, 3).setValues([
    ["Field", "Input", "Values"],
    ["Room", "Dropdown", ROOMS.join(", ")],
    ["Task", "Text", ""],
    ["Duration", "Dropdown", DURATIONS.join(", ")],
    ["Plan", "Dropdown", PLAN_OPTIONS.join(", ")],
  ]);
}

function ensureSheet_(spreadsheet, name, headers) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  sheet.setFrozenRows(1);
  return sheet;
}

function applyChoresValidation_(sheet) {
  const roomRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(ROOMS, true)
    .setAllowInvalid(false)
    .build();
  const durationRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(DURATIONS, true)
    .setAllowInvalid(false)
    .build();
  const planRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(PLAN_OPTIONS, true)
    .setAllowInvalid(false)
    .build();

  sheet.getRange("B2:B200").setDataValidation(roomRule);
  sheet.getRange("D2:D200").setDataValidation(durationRule);
  sheet.getRange("E2:E200").setDataValidation(planRule);
}

function first_(value) {
  return Array.isArray(value) ? value[0] : value;
}

function columnLetter_(columnNumber) {
  let column = "";
  while (columnNumber > 0) {
    const remainder = (columnNumber - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }
  return column;
}

function makeTaskId_() {
  const stamp = Utilities.formatDate(new Date(), "Etc/UTC", "yyyyMMddHHmmss");
  const suffix = Utilities.getUuid().slice(0, 8);
  return `task_${stamp}_${suffix}`;
}
