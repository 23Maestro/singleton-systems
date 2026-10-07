> Current approved route · October 4, 2026: build directly in `/Users/singleton23/Documents/Development/business-time-intelligence-fork` using TimeScribe’s NativePHP/Electron, Vue and Laravel. Laravel writes business SQLite; an independent Swift agent writes raw-activity SQLite. The Swift Financial Engine stays canonical. Jerami’s latest approval replaces the Glaze runtime and six-region shell below. Use the fork’s `docs/BUILD-PLAN.md` and current layout contract. Earlier runtime references below are historical research.

# Business time intelligence

October 4, 2026. Approved: Glaze desktop application, Raycast companion commands, native Swift tracker and SQLite. Foundation bridge and independent-lifecycle probe are verified. Manual workflow is specified; the Financial Engine is next. Collection remains off. [Product build](https://linear.app/23maestro/issue/23M-214/build-business-time-intelligence).

[Decision map](../../public/decision-maps/2026-10-04-business-time-intelligence/index.html): permissions, schema, sources, tradeoffs and acceptance criteria.

## 1. Timing mechanics

Keep foreground context, inactivity gaps, project rules, corrections and one-project-per-period accounting. Timing samples once per second; V1 proposes app-change notifications plus five-second reconciliation. Missing context triggers another capture route. [Timing FAQ](https://timingapp.com/help/faq), [project rules](https://timingapp.com/help/projects).

## 2. Excluded behaviors

No screenshots, recordings, input contents, clipboard capture, productivity scores, cloud sync, CRM, invoicing, payroll, accounting, tax preparation or Upwork integration.

## 3. Raycast limits

Commands unload. Background refresh has a ten-second minimum and timing tolerance. Script Commands accept three arguments; they cannot provide the requested seven-field form. Use TypeScript Forms, Lists and Details. LocalStorage holds interface preferences; business records live in SQLite. [Lifecycle](https://developers.raycast.com/information/lifecycle), [refresh](https://developers.raycast.com/information/lifecycle/background-refresh), [scripts](https://github.com/raycast/script-commands), [storage](https://developers.raycast.com/api-reference/storage).

## 4. APIs and permissions

NSWorkspace identifies the foreground app. Accessibility reads exposed titles/documents. Optional Apple Events require Automation approval per browser/Finder. Aggregate idle time requires no input listener. Try AX, app APIs/bridges, then scripting. Optional CGWindow title metadata requires Screen Recording permission; capture no pixels. No Input Monitoring or Full Disk Access. [Apple service management](https://developer.apple.com/documentation/servicemanagement/smappservice).

## 5. Open-source pieces

[ActivityWatch](https://github.com/ActivityWatch/aw-watcher-window) provides tracking references. [GRDB](https://github.com/groue/GRDB.swift) provides SQLite migrations. [AXorcist](https://github.com/openclaw/AXorcist) provides maintained AX observation patterns. [Hammerspoon](https://github.com/Hammerspoon/hammerspoon) is an existing-runtime alternative. GitHub maintenance dates and rejected candidates are in the map.

## 6. Architecture

The main application must follow the [locked Standard UI layout](business-time-intelligence/layout-contract.md) and [approved image](business-time-intelligence/standard-ui.jpeg). Preserve its left rail, contextual sidebar, top tabs, main content, right inspector and bottom status bar. Layout changes require Jerami's explicit approval. Verify the actual built Glaze window before closing UI stages.

Glaze is the main Mac application for saved projects, work logs, corrections, economics and learning. Raycast supplies companion forms and shortcuts. One native agent owns collection and persistence. Its versioned JSON interface serves both application surfaces. One Swift Financial Engine owns all business calculations; reports and learning consume its results and explanatory components. Manual mode works with tracking disabled. Native APIs handle monitoring; scoped adapters recover context. No LLM. SQLite stays in internal Application Support.

Glaze 0.14.3's installed SDK uses a macOS WebView with a Node backend and supports source-built Swift executables under `native/<name>/`. Xcode 27 is installed. A Glaze-owned child process alone does not establish tracking independence after app quit; the tracker retains its own native app lifecycle. Verify installed signing and permission behavior before collection. [Glaze native integration](https://manual.glaze.app/capabilities/system-integration).

## 7. Data model

Separate sanitized activity intervals, clients/projects, deterministic rules, replaceable assignments, manual entries, project intentions and financial inputs. Preserve correction provenance. Explicit corrections outrank intentions and rules. Conflicting rules remain unassigned. Merge intervals before totaling; never add overlapping timer and automatic hours.

## 8. Business math

G = gross revenue; D = production costs plus itemized project fees; O = allocated overhead; H = actual hours; V = target hourly value.

Gross profit = G − D. Gross margin % = (G − D) / G × 100. Operating profit = G − D − O. Operating margin % = operating profit / G × 100. Hourly measures divide revenue, gross profit or operating profit by H. Economic profit = operating profit − H × V. Estimated take-home = operating profit − optional tax estimate. Own labor stays separate. Zero denominators show unavailable.

$500 − $100 = $400; 80% margin; four hours give $125 revenue/hour and $100 gross profit/hour. At $100/hour labor value, economic profit is $0.

## 9. V1 plan

Foundation → manual economics workflow → tested Financial Engine → SQLite and application interfaces → tracker/idle → activity adapters and classification/project attribution → reporting → learning → future billing adapter boundary. Provide Start Project, Stop Project, Current Project, Project Economics, Today and This Week. Keep Upwork behind a billing-input adapter; no OAuth/API integration.

The [manual input contract](business-time-intelligence/manual-workflow.md) defines the first saved-input/result path. Installed tracker signing, TCC attribution and opt-in login verification gate collection; manual economics runs with collection off. Final visible window-drag acceptance belongs to the desktop workspace stage.

Use the existing Wayfinder, Backend Architect, TDD and Implement skills along this route. Apply Improve Codebase Architecture when existing module friction warrants it. Test the approved financial, persistence, interval-accounting, classification, adapter and reporting/learning consumption seams. Deterministic financial unit tests pass before dependent reports or learning. Skills need no separate registration ticket. [Existing learning issue](https://linear.app/23maestro/issue/23M-213/add-real-project-business-math-learning-engine) is required phase 8 scope under the product parent.

## 10. Risks

Target 95% correct automatic project attribution of eligible active work time across your current apps; measure it. Missing titles never stop app-duration tracking. Route gaps through scoped adapters; manual corrections cover the remainder. DaVinci and generic brain games remain outside V1.
