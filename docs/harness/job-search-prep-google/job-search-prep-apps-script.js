const SHEETS = {
  config: 'Config',
  terms: 'Search Terms',
  urls: 'Search URLs',
  leads: 'Job Leads',
  runs: 'Search Runs',
  prep: 'Prep Queue',
  applied: 'Applied Log',
};

const DEFAULT_RECENCY_DAYS = 7;
const DEFAULT_WEEKLY_CAP_PER_ROLE_FAMILY = 25;
const GEMINI_MODEL = 'gemini-2.5-flash';
const SPREADSHEET_TITLE = 'Job Search Prep Engine';
const SPREADSHEET_ID_PROPERTY = 'JOB_SEARCH_PREP_SPREADSHEET_ID';

const HEADERS = {
  [SHEETS.config]: ['Key', 'Value', 'Notes'],
  [SHEETS.terms]: [
    'Enabled',
    'Role Family',
    'Resume Lane',
    'Search Term',
    'Source Type',
    'Site',
    'Query Template',
    'Notes',
  ],
  [SHEETS.urls]: ['Built At', 'Role Family', 'Source', 'Search Term', 'URL', 'Notes'],
  [SHEETS.leads]: [
    'Lead ID',
    'Found At',
    'Source',
    'Source Query',
    'Title',
    'Company',
    'Location',
    'Remote Text',
    'Posted At',
    'Age Days',
    'Job URL',
    'Search URL',
    'Resume Lane',
    'Role Family',
    'Remote Gate',
    'Recency Gate',
    'Seniority Gate',
    'Overall Gate',
    'Gate Notes',
    'Status',
    'Fit Score',
    'Fit Reason',
    'Resume Angle',
    'Cover Angle',
    'Keywords',
    'Next Action',
    'Raw Snippet',
  ],
  [SHEETS.runs]: ['Run At', 'Source', 'Query', 'Results Seen', 'Added', 'Rejected', 'Notes'],
  [SHEETS.prep]: [
    'Selected At',
    'Lead ID',
    'Title',
    'Company',
    'Job URL',
    'Resume Lane',
    'Resume Angle',
    'Cover Angle',
    'Next Action',
  ],
  [SHEETS.applied]: ['Applied At', 'Lead ID', 'Title', 'Company', 'Job URL', 'Resume File', 'Status', 'Follow Up Date'],
};

const DEFAULT_CONFIG = [
  ['RECENCY_DAYS', String(DEFAULT_RECENCY_DAYS), 'Reject posts older than this many days.'],
  ['REMOTE_STRICT', 'TRUE', 'Reject hybrid/on-site/travel/local-preference remote claims.'],
  ['WEEKLY_CAP_PER_ROLE_FAMILY', String(DEFAULT_WEEKLY_CAP_PER_ROLE_FAMILY), 'Cap accepted findings per role family across remote/local sources in the rolling recency window.'],
  ['COUNTRY', 'United States', 'Preferred remote market.'],
  ['LOCATION_HOME', 'Riverview, FL', 'Used only for Tampa-area review notes.'],
  ['GEMINI_MODEL', GEMINI_MODEL, 'Scoring model used by scoreUnscoredLeads.'],
];

const DEFAULT_TERMS = [
  ['TRUE', 'AI Specialist', 'White collar - AI workflow systems', 'AI workflow specialist', 'ATS_GOOGLE', 'boards.greenhouse.io', 'site:boards.greenhouse.io "{role}" remote ("United States" OR "US" OR "USA") -senior -lead -manager', 'US remote/direct ATS AI specialist lane.'],
  ['TRUE', 'AI Specialist', 'White collar - AI workflow systems', 'workflow automation specialist', 'ATS_GOOGLE', 'jobs.lever.co', 'site:jobs.lever.co "{role}" remote ("United States" OR "US" OR "USA") -senior -lead -manager', 'US remote/direct workflow automation roles.'],
  ['TRUE', 'AI Specialist', 'White collar - AI workflow systems', 'business process automation specialist', 'ATS_GOOGLE', 'jobs.ashbyhq.com', 'site:jobs.ashbyhq.com "{role}" remote ("United States" OR "US" OR "USA") -senior -lead -manager', 'US remote/direct process automation roles.'],
  ['TRUE', 'AI Specialist', 'White collar - AI workflow systems', 'AI operations coordinator', 'ATS_GOOGLE', '*myworkdayjobs.com', 'site:*myworkdayjobs.com "{role}" remote ("United States" OR "US" OR "USA") -senior -lead -manager', 'US remote coordinator lane for AI operations.'],
  ['TRUE', 'AI Specialist', 'White collar - AI workflow systems', 'AI workflow specialist', 'LOCAL_GOOGLE', 'Tampa / Riverview', '"{role}" ("Tampa" OR "Riverview") Florida -senior -lead -manager', 'Local Tampa/Riverview AI specialist lane.'],
  ['TRUE', 'AI Specialist', 'White collar - AI workflow systems', 'workflow automation specialist', 'LOCAL_GOOGLE', 'Tampa / Riverview', '"{role}" ("Tampa" OR "Riverview") Florida -senior -lead -manager', 'Local Tampa/Riverview workflow automation lane.'],
  ['TRUE', 'AI Specialist', 'White collar - AI workflow systems', 'business process automation specialist', 'LOCAL_GOOGLE', 'Tampa / Riverview', '"{role}" ("Tampa" OR "Riverview") Florida -senior -lead -manager', 'Local Tampa/Riverview process automation lane.'],
  ['TRUE', 'Video Editor / Content Ops', 'White collar - video/content', 'video editor', 'REMOTIVE', 'remotive.com', '', 'Remote video editing lane; gate must confirm US/Americas fit.'],
  ['TRUE', 'Video Editor / Content Ops', 'White collar - video/content', 'post production coordinator', 'ATS_GOOGLE', 'jobs.ashbyhq.com', 'site:jobs.ashbyhq.com "{role}" remote ("United States" OR "US" OR "USA") -senior -lead -manager', 'US remote/direct post-production lane.'],
  ['TRUE', 'Video Editor / Content Ops', 'White collar - video/content', 'digital asset manager', 'ATS_GOOGLE', 'boards.greenhouse.io', 'site:boards.greenhouse.io "{role}" remote ("United States" OR "US" OR "USA") -senior -lead -manager', 'US remote DAM and workflow assets.'],
  ['TRUE', 'Video Editor / Content Ops', 'White collar - media operations', 'creative operations coordinator', 'REMOTIVE', 'remotive.com', '', 'Remote creative ops support term; gate must confirm US/Americas fit.'],
  ['TRUE', 'Video Editor / Content Ops', 'White collar - media operations', 'content operations coordinator', 'REMOTIVE', 'remotive.com', '', 'Remote content ops support term; gate must confirm US/Americas fit.'],
  ['TRUE', 'Video Editor / Content Ops', 'White collar - media operations', 'media operations coordinator', 'REMOTEOK', 'remoteok.com', '', 'RemoteOK API; reject UK/EU/non-US restrictions.'],
  ['TRUE', 'Video Editor / Content Ops', 'White collar - video/content', 'video editor', 'LOCAL_GOOGLE', 'Tampa / Riverview', '"{role}" ("Tampa" OR "Riverview") Florida -senior -lead -manager', 'Local Tampa/Riverview video lane.'],
  ['TRUE', 'Video Editor / Content Ops', 'White collar - video/content', 'post production coordinator', 'LOCAL_GOOGLE', 'Tampa / Riverview', '"{role}" ("Tampa" OR "Riverview") Florida -senior -lead -manager', 'Local Tampa/Riverview post-production lane.'],
  ['TRUE', 'Video Editor / Content Ops', 'White collar - media operations', 'creative operations coordinator', 'LOCAL_GOOGLE', 'Tampa / Riverview', '"{role}" ("Tampa" OR "Riverview") Florida -senior -lead -manager', 'Local Tampa/Riverview creative ops lane.'],
  ['TRUE', 'Video Editor / Content Ops', 'White collar - media operations', 'content operations coordinator', 'LOCAL_GOOGLE', 'Tampa / Riverview', '"{role}" ("Tampa" OR "Riverview") Florida -senior -lead -manager', 'Local Tampa/Riverview content ops lane.'],
  ['TRUE', 'Video Editor / Content Ops', 'White collar - review only', 'creative operations', 'SEARCH_URL', 'Google ATS', 'https://www.google.com/search?q={role}%20remote%20(%22United%20States%22%20OR%20US%20OR%20USA)%20-site%3Alinkedin.com&tbs=qdr:w', 'Manual US remote review, past week.'],
  ['TRUE', 'Video Editor / Content Ops', 'White collar - review only', 'content operations', 'SEARCH_URL', 'Google ATS', 'https://www.google.com/search?q={role}%20remote%20(%22United%20States%22%20OR%20US%20OR%20USA)%20-site%3Alinkedin.com&tbs=qdr:w', 'Manual US remote review, past week.'],
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Job Search Prep')
    .addItem('Run Recent Search', 'runRecentJobSearch')
    .addItem('Report Focused Job Leads', 'reportFocusedJobLeads')
    .addItem('Score Unscored Leads', 'scoreUnscoredLeads')
    .addItem('Build Search URLs', 'buildSearchUrls')
    .addItem('Send Selected Rows to Prep Queue', 'sendSelectedLeadsToPrepQueue')
    .addSeparator()
    .addItem('Refresh Default Search Terms', 'refreshDefaultSearchTerms')
    .addItem('Setup / Repair Sheet', 'setupJobSearchPrep')
    .addToUi();
}

function setupJobSearchPrep() {
  const spreadsheet = jobSearchSpreadsheet_();
  Object.keys(SHEETS).forEach(function (key) {
    const name = SHEETS[key];
    const sheet = getOrCreateSheet_(spreadsheet, name);
    resetHeader_(sheet, HEADERS[name]);
  });

  seedIfEmpty_(spreadsheet.getSheetByName(SHEETS.config), DEFAULT_CONFIG);
  seedIfEmpty_(spreadsheet.getSheetByName(SHEETS.terms), DEFAULT_TERMS);
  applyFormatting_(spreadsheet);
  buildSearchUrls();
  installSpreadsheetMenuTrigger_(spreadsheet);
  Logger.log('Job Search Prep Sheet: ' + spreadsheet.getUrl());
  return spreadsheet.getUrl();
}

function refreshDefaultSearchTerms() {
  const spreadsheet = jobSearchSpreadsheet_();
  const termsSheet = spreadsheet.getSheetByName(SHEETS.terms);
  resetHeader_(termsSheet, HEADERS[SHEETS.terms]);
  appendRows_(termsSheet, DEFAULT_TERMS);
  buildSearchUrls();
  toast_(spreadsheet, 'Default search terms refreshed.', 'Job Search Prep');
}

function runRecentJobSearch() {
  setupJobSearchPrep();
  const spreadsheet = jobSearchSpreadsheet_();
  const terms = enabledTerms_(spreadsheet);
  let totalSeen = 0;
  let totalAdded = 0;
  let totalRejected = 0;

  terms.forEach(function (term) {
    let result = { seen: 0, added: 0, rejected: 0, notes: 'Search URL only.' };
    if (term.sourceType === 'REMOTIVE') {
      result = runRemotiveTerm_(spreadsheet, term);
    } else if (term.sourceType === 'REMOTEOK') {
      result = runRemoteOkTerm_(spreadsheet, term);
    } else if (term.sourceType === 'ATS_GOOGLE' || term.sourceType === 'LOCAL_GOOGLE') {
      result = runGoogleCseTerm_(spreadsheet, term);
    }
    totalSeen += result.seen;
    totalAdded += result.added;
    totalRejected += result.rejected;
    appendRun_(spreadsheet, term.sourceType, term.searchTerm, result);
  });

  buildSearchUrls();
  toast_(spreadsheet,
    'Seen ' + totalSeen + ', added ' + totalAdded + ', rejected ' + totalRejected,
    'Job Search Prep'
  );
}

function buildSearchUrls() {
  const spreadsheet = jobSearchSpreadsheet_();
  const urlSheet = spreadsheet.getSheetByName(SHEETS.urls);
  clearBody_(urlSheet);
  const now = new Date();
  const rows = [];
  enabledTerms_(spreadsheet).forEach(function (term) {
    const url = searchUrlForTerm_(term);
    rows.push([now, term.roleFamily, term.sourceType + ' / ' + term.site, term.searchTerm, url, term.notes]);
  });
  appendRows_(urlSheet, rows);
}

function scoreUnscoredLeads() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY script property.');
  }
  const spreadsheet = jobSearchSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(SHEETS.leads);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const index = headerIndex_(headers);
  const model = configValue_(spreadsheet, 'GEMINI_MODEL') || GEMINI_MODEL;
  let scored = 0;

  for (let row = 1; row < values.length; row += 1) {
    const record = rowObject_(headers, values[row]);
    if (record['Fit Score'] || record['Overall Gate'] !== 'PASS') {
      continue;
    }
    const score = scoreLeadWithGemini_(apiKey, model, record);
    sheet.getRange(row + 1, index['Fit Score'] + 1, 1, 6).setValues([[
      score.fitScore,
      score.fitReason,
      score.resumeAngle,
      score.coverAngle,
      score.keywords.join(', '),
      score.nextAction,
    ]]);
    scored += 1;
  }

  toast_(spreadsheet, 'Scored ' + scored + ' leads.', 'Job Search Prep');
}

function reportFocusedJobLeads() {
  const spreadsheet = jobSearchSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(SHEETS.leads);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1).map(function (row) {
    return rowObject_(headers, row);
  }).filter(function (row) {
    return row['Overall Gate'] !== 'REJECT';
  });
  const byLane = {};
  rows.forEach(function (row) {
    const lane = row['Role Family'] || 'Unlabeled';
    byLane[lane] = byLane[lane] || [];
    byLane[lane].push(row);
  });
  Object.keys(byLane).forEach(function (lane) {
    Logger.log(lane + ': ' + byLane[lane].length + ' active findings');
    byLane[lane].slice(0, 12).forEach(function (row) {
      Logger.log([
        '[' + row['Overall Gate'] + ' / ' + row['Remote Gate'] + ']',
        row.Title,
        '-',
        row.Company || 'Unknown company',
        '-',
        row.Location || 'Unknown location',
        '-',
        row['Job URL'],
      ].join(' '));
    });
  });
  Logger.log('Total active findings: ' + rows.length);
}

function sendSelectedLeadsToPrepQueue() {
  const spreadsheet = activeOrJobSearchSpreadsheet_();
  const leadSheet = spreadsheet.getSheetByName(SHEETS.leads);
  const prepSheet = spreadsheet.getSheetByName(SHEETS.prep);
  const range = spreadsheet.getActiveRange();
  if (!range || range.getRow() === 1) {
    throw new Error('Select one or more lead rows first.');
  }
  if (range.getSheet().getName() !== SHEETS.leads) {
    throw new Error('Select rows from the Job Leads sheet first.');
  }
  const values = leadSheet.getDataRange().getValues();
  const headers = values[0];
  const index = headerIndex_(headers);
  const rows = [];
  for (let offset = 0; offset < range.getNumRows(); offset += 1) {
    const rowNumber = range.getRow() + offset;
    if (rowNumber === 1) {
      continue;
    }
    const row = values[rowNumber - 1];
    rows.push([
      new Date(),
      row[index['Lead ID']],
      row[index.Title],
      row[index.Company],
      row[index['Job URL']],
      row[index['Resume Lane']],
      row[index['Resume Angle']],
      row[index['Cover Angle']],
      row[index['Next Action']],
    ]);
  }
  appendRows_(prepSheet, rows);
}

function openJobSearchPrepSpreadsheet() {
  const url = jobSearchSpreadsheet_().getUrl();
  Logger.log('Job Search Prep Sheet: ' + url);
  return url;
}

function runRemotiveTerm_(spreadsheet, term) {
  const url = 'https://remotive.com/api/remote-jobs?search=' + encodeURIComponent(term.searchTerm);
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (response.getResponseCode() >= 300) {
    return { seen: 0, added: 0, rejected: 0, notes: 'Remotive fetch failed: ' + response.getResponseCode() };
  }
  const payload = JSON.parse(response.getContentText());
  const jobs = payload.jobs || [];
  return ingestJobs_(spreadsheet, term, jobs.map(function (job) {
    return {
      source: 'Remotive',
      sourceQuery: term.searchTerm,
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || 'Remote',
      remoteText: job.candidate_required_location || 'Remote',
      postedAt: job.publication_date,
      url: job.url,
      snippet: stripHtml_(job.description || ''),
    };
  }));
}

function runRemoteOkTerm_(spreadsheet, term) {
  const url = 'https://remoteok.com/api?tags=' + encodeURIComponent(term.searchTerm);
  const response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { 'User-Agent': 'Singleton Systems Job Search Prep' },
  });
  if (response.getResponseCode() >= 300) {
    return { seen: 0, added: 0, rejected: 0, notes: 'RemoteOK fetch failed: ' + response.getResponseCode() };
  }
  const payload = JSON.parse(response.getContentText()).filter(function (item) {
    return item && item.position;
  });
  return ingestJobs_(spreadsheet, term, payload.map(function (job) {
    return {
      source: 'RemoteOK',
      sourceQuery: term.searchTerm,
      title: job.position,
      company: job.company,
      location: job.location || 'Remote',
      remoteText: job.location || 'Remote',
      postedAt: job.date,
      url: job.url,
      snippet: stripHtml_(job.description || ''),
    };
  }));
}

function runGoogleCseTerm_(spreadsheet, term) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GOOGLE_CSE_API_KEY');
  const cx = PropertiesService.getScriptProperties().getProperty('GOOGLE_CSE_CX');
  if (!apiKey || !cx) {
    return { seen: 0, added: 0, rejected: 0, notes: 'No Google CSE key/CX. Search URL generated for manual review.' };
  }
  const query = queryForTerm_(term);
  const url = 'https://www.googleapis.com/customsearch/v1?key=' + encodeURIComponent(apiKey) +
    '&cx=' + encodeURIComponent(cx) +
    '&dateRestrict=d' + recencyDays_(spreadsheet) +
    '&q=' + encodeURIComponent(query);
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (response.getResponseCode() >= 300) {
    return { seen: 0, added: 0, rejected: 0, notes: 'Google CSE failed: ' + response.getResponseCode() };
  }
  const payload = JSON.parse(response.getContentText());
  const items = payload.items || [];
  return ingestJobs_(spreadsheet, term, items.map(function (item) {
    return {
      source: 'Google CSE',
      sourceQuery: query,
      title: item.title,
      company: '',
      location: 'Needs review',
      remoteText: item.snippet || '',
      postedAt: '',
      url: item.link,
      snippet: item.snippet || '',
    };
  }));
}

function ingestJobs_(spreadsheet, term, jobs) {
  const sheet = spreadsheet.getSheetByName(SHEETS.leads);
  const existing = existingUrls_(sheet);
  const weeklyCounts = weeklyAcceptedCountsByRoleFamily_(spreadsheet);
  const weeklyCap = weeklyCapPerRoleFamily_(spreadsheet);
  const rows = [];
  let rejected = 0;
  const now = new Date();

  jobs.forEach(function (job) {
    if (!job.url || existing[job.url]) {
      rejected += 1;
      return;
    }
    const gate = gateJob_(spreadsheet, job, term);
    if (gate.overallGate !== 'REJECT' && weeklyCap > 0 && (weeklyCounts[term.roleFamily] || 0) >= weeklyCap) {
      rejected += 1;
      existing[job.url] = true;
      return;
    }
    if (gate.overallGate !== 'REJECT') {
      weeklyCounts[term.roleFamily] = (weeklyCounts[term.roleFamily] || 0) + 1;
    }
    if (gate.overallGate === 'REJECT') {
      rejected += 1;
    }
    rows.push([
      makeLeadId_(job.url),
      now,
      job.source,
      job.sourceQuery,
      clean_(job.title),
      clean_(job.company),
      clean_(job.location),
      clean_(job.remoteText),
      gate.postedAt || '',
      gate.ageDays,
      job.url,
      searchUrlForTerm_(term),
      term.resumeLane,
      term.roleFamily,
      gate.remoteGate,
      gate.recencyGate,
      gate.seniorityGate,
      gate.overallGate,
      gate.notes.join('; '),
      gate.overallGate === 'PASS' ? 'Queued' : 'Parked',
      '',
      '',
      '',
      '',
      '',
      gate.overallGate === 'PASS' ? 'Review job post before tailoring.' : 'Skip unless manually revived.',
      clean_(job.snippet),
    ]);
    existing[job.url] = true;
  });

  appendRows_(sheet, rows);
  return { seen: jobs.length, added: rows.length, rejected: rejected, notes: '' };
}

function gateJob_(spreadsheet, job, term) {
  const notes = [];
  const postedAt = parseDate_(job.postedAt);
  const ageDays = postedAt ? Math.floor((new Date() - postedAt) / 86400000) : '';
  const titleText = String(job.title || '').toLowerCase();
  const text = [job.title, job.company, job.location, job.remoteText, job.snippet].join(' ').toLowerCase();
  const locationText = [job.location, job.remoteText].join(' ').toLowerCase();
  const recencyDays = recencyDays_(spreadsheet);
  const isLocalSearch = term && term.sourceType === 'LOCAL_GOOGLE';
  let recencyGate = 'VERIFY_DATE';
  if (postedAt) {
    recencyGate = ageDays <= recencyDays ? 'PASS' : 'REJECT';
    if (ageDays > recencyDays) {
      notes.push('Posted older than ' + recencyDays + ' days.');
    }
  } else {
    notes.push('No reliable posted date found; verify with Tools > Past week or job post timestamp.');
  }

  let remoteGate = isLocalSearch ? 'LOCAL_VERIFY' : 'VERIFY_REMOTE';
  if (isLocalSearch) {
    if (/\btampa\b|\briverview\b/.test(text)) {
      remoteGate = 'LOCAL_PASS';
    } else {
      notes.push('Local search result needs Tampa/Riverview location verification.');
    }
  } else if (/(hybrid|on-site|onsite|relocat|commut|travel required|local candidates|local preference|must be located|based in|residents of|within \d+ miles)/i.test(text)) {
    remoteGate = 'REJECT';
    notes.push('Remote claim has hybrid/local/travel/location restriction language.');
  } else if (/(united kingdom|\buk\b|europe|emea|cet|gmt|bst|canada|latin america|apac|australia|new zealand|brazil|mexico|uruguay|argentina|colombia|chile|peru)/i.test(locationText)) {
    remoteGate = 'REJECT';
    notes.push('Remote market appears non-US or region-restricted.');
  } else if (/(united states|\bu\.?s\.?\b|\busa\b|north america|americas|est|cst|mst|pst|eastern time|central time|mountain time|pacific time)/i.test(locationText) && /\bremote\b|work from home|distributed/i.test(text)) {
    remoteGate = 'PASS';
  } else if (/\bremote\b|work from home|distributed/i.test(text)) {
    remoteGate = 'VERIFY_REMOTE';
    notes.push('Remote exists but US market fit is not explicit.');
  } else {
    notes.push('Remote language missing or indirect.');
  }

  const seniorityGate = /(senior|sr\.|staff|lead|principal|manager|director|vp|head of)/i.test(job.title || '')
    ? 'REJECT'
    : 'PASS';
  if (seniorityGate === 'REJECT') {
    notes.push('Seniority/title excluded.');
  }

  const laneGate = laneRelevanceGate_(term, titleText, text);
  if (laneGate === 'REJECT') {
    notes.push('Role does not match the selected lane.');
  }

  const overallGate = remoteGate === 'REJECT' || recencyGate === 'REJECT' || seniorityGate === 'REJECT' || laneGate === 'REJECT'
    ? 'REJECT'
    : (remoteGate === 'PASS' || remoteGate === 'LOCAL_PASS') && recencyGate === 'PASS'
      ? 'PASS'
      : 'VERIFY';

  return {
    postedAt: postedAt || '',
    ageDays: ageDays,
    remoteGate: remoteGate,
    recencyGate: recencyGate,
    seniorityGate: seniorityGate,
    overallGate: overallGate,
    notes: notes,
  };
}

function laneRelevanceGate_(term, titleText, text) {
  if (!term || !term.roleFamily) {
    return 'PASS';
  }
  if (term.roleFamily === 'AI Specialist') {
    return /(ai|artificial intelligence|automation|workflow|process automation|operations coordinator|prompt|llm|systems)/i.test(titleText)
      ? 'PASS'
      : 'REJECT';
  }
  if (term.roleFamily === 'Video Editor / Content Ops') {
    return /(video|editor|editing|post production|production coordinator|content operations|creative operations|media operations|digital asset|\bdam\b|course)/i.test(titleText)
      ? 'PASS'
      : 'REJECT';
  }
  return 'PASS';
}

function scoreLeadWithGemini_(apiKey, model, record) {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' +
    encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(apiKey);
  const prompt = [
    'Score this job lead for Jerami Singleton.',
    'Return strict JSON only with fitScore number 0-100, fitReason, resumeAngle, coverAngle, keywords array, nextAction.',
    'Resume facts: AI-assisted workflow systems, Raycast command surfaces, FastAPI adapters, Supabase source-of-truth contracts, prompt/output review, audit scripts, high-volume video editing, course migration, FFmpeg, broadcast production.',
    'Avoid inventing experience. Favor AI workflow specialist, creative operations, content operations, media operations, educational video, post production coordinator, and digital asset management roles.',
    'Reject or lower score if not truly remote, older than 7 days, senior/lead/manager, or unrelated.',
    JSON.stringify(record),
  ].join('\n');
  const response = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (response.getResponseCode() >= 300) {
    throw new Error('Gemini scoring failed: ' + response.getResponseCode() + ' ' + response.getContentText());
  }
  const payload = JSON.parse(response.getContentText());
  const text = (((payload.candidates || [])[0] || {}).content || {}).parts[0].text || '{}';
  const jsonText = text.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
  return JSON.parse(jsonText);
}

function enabledTerms_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(SHEETS.terms);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values.filter(function (row) {
    return String(row[0]).toUpperCase() === 'TRUE';
  }).map(function (row) {
    const item = rowObject_(headers, row);
    return {
      roleFamily: item['Role Family'],
      resumeLane: item['Resume Lane'],
      searchTerm: item['Search Term'],
      sourceType: item['Source Type'],
      site: item.Site,
      queryTemplate: item['Query Template'],
      notes: item.Notes,
    };
  });
}

function searchUrlForTerm_(term) {
  if (term.sourceType === 'SEARCH_URL' && term.queryTemplate) {
    return term.queryTemplate.replace('{role}', encodeURIComponent(term.searchTerm));
  }
  const query = queryForTerm_(term);
  return 'https://www.google.com/search?q=' + encodeURIComponent(query) + '&tbs=qdr:w';
}

function queryForTerm_(term) {
  if (term.queryTemplate) {
    return term.queryTemplate.replace('{role}', term.searchTerm);
  }
  return '"' + term.searchTerm + '" remote -senior -lead -manager';
}

function recencyDays_(spreadsheet) {
  return Number(configValue_(spreadsheet, 'RECENCY_DAYS') || DEFAULT_RECENCY_DAYS);
}

function weeklyCapPerRoleFamily_(spreadsheet) {
  return Number(configValue_(spreadsheet, 'WEEKLY_CAP_PER_ROLE_FAMILY') || DEFAULT_WEEKLY_CAP_PER_ROLE_FAMILY);
}

function weeklyAcceptedCountsByRoleFamily_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(SHEETS.leads);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return {};
  }
  const headers = values[0];
  const index = headerIndex_(headers);
  const maxAgeDays = recencyDays_(spreadsheet);
  const counts = {};
  for (let row = 1; row < values.length; row += 1) {
    const foundAt = parseDate_(values[row][index['Found At']]);
    const roleFamily = values[row][index['Role Family']];
    const gate = values[row][index['Overall Gate']];
    if (!foundAt || !roleFamily || gate === 'REJECT') {
      continue;
    }
    const ageDays = Math.floor((new Date() - foundAt) / 86400000);
    if (ageDays <= maxAgeDays) {
      counts[roleFamily] = (counts[roleFamily] || 0) + 1;
    }
  }
  return counts;
}

function configValue_(spreadsheet, key) {
  const rows = spreadsheet.getSheetByName(SHEETS.config).getDataRange().getValues();
  for (let i = 1; i < rows.length; i += 1) {
    if (rows[i][0] === key) {
      return rows[i][1];
    }
  }
  return '';
}

function getOrCreateSheet_(spreadsheet, name) {
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function resetHeader_(sheet, headers) {
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

function seedIfEmpty_(sheet, rows) {
  if (sheet.getLastRow() > 1) {
    return;
  }
  appendRows_(sheet, rows);
}

function clearBody_(sheet) {
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
}

function appendRows_(sheet, rows) {
  if (!rows.length) {
    return;
  }
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function appendRun_(spreadsheet, source, query, result) {
  appendRows_(spreadsheet.getSheetByName(SHEETS.runs), [[
    new Date(),
    source,
    query,
    result.seen,
    result.added,
    result.rejected,
    result.notes,
  ]]);
}

function applyFormatting_(spreadsheet) {
  Object.keys(SHEETS).forEach(function (key) {
    const sheet = spreadsheet.getSheetByName(SHEETS[key]);
    sheet.autoResizeColumns(1, Math.min(sheet.getLastColumn(), 10));
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold');
  });
}

function existingUrls_(sheet) {
  const urls = {};
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return urls;
  }
  const index = headerIndex_(values[0])['Job URL'];
  for (let i = 1; i < values.length; i += 1) {
    if (values[i][index]) {
      urls[values[i][index]] = true;
    }
  }
  return urls;
}

function headerIndex_(headers) {
  return headers.reduce(function (memo, header, index) {
    memo[header] = index;
    return memo;
  }, {});
}

function rowObject_(headers, row) {
  return headers.reduce(function (memo, header, index) {
    memo[header] = row[index];
    return memo;
  }, {});
}

function parseDate_(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function stripHtml_(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function clean_(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function makeLeadId_(url) {
  let hash = 0;
  for (let i = 0; i < url.length; i += 1) {
    hash = ((hash << 5) - hash) + url.charCodeAt(i);
    hash |= 0;
  }
  return 'JOB-' + Math.abs(hash);
}

function activeOrJobSearchSpreadsheet_() {
  return SpreadsheetApp.getActive() || jobSearchSpreadsheet_();
}

function jobSearchSpreadsheet_() {
  const properties = PropertiesService.getScriptProperties();
  const existingId = properties.getProperty(SPREADSHEET_ID_PROPERTY);
  if (existingId) {
    try {
      return SpreadsheetApp.openById(existingId);
    } catch (error) {
      properties.deleteProperty(SPREADSHEET_ID_PROPERTY);
    }
  }

  const spreadsheet = SpreadsheetApp.create(SPREADSHEET_TITLE);
  properties.setProperty(SPREADSHEET_ID_PROPERTY, spreadsheet.getId());
  return spreadsheet;
}

function installSpreadsheetMenuTrigger_(spreadsheet) {
  const existing = ScriptApp.getProjectTriggers().some(function (trigger) {
    return trigger.getHandlerFunction() === 'onOpen' &&
      trigger.getTriggerSourceId() === spreadsheet.getId();
  });
  if (existing) {
    return;
  }
  ScriptApp.newTrigger('onOpen').forSpreadsheet(spreadsheet).onOpen().create();
}

function toast_(spreadsheet, message, title) {
  try {
    spreadsheet.toast(message, title);
  } catch (error) {
    Logger.log(title + ': ' + message);
  }
}
