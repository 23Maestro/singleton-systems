# Forkable product references

Verified October 4, 2026 through GitHub repository metadata, release metadata and source inspection. Implementation is stopped for this research. No fork or architecture replacement has been made.

## Recommendation

Use **TimeScribe as the primary complete desktop product comp**, **Tuttle for business economics**, and **Solidtime Desktop for automatic tracking mechanics**. These are substantial working applications. No inspected candidate implements the entire approved economics and automatic attribution contract.

| Repository | Verified fit | Maintenance | License |
| --- | --- | --- | --- |
| [TimeScribe](https://github.com/WINBIGFOX/TimeScribe) | Offline macOS desktop app, SQLite, app usage, idle start/pause, projects, hourly rates, billing and reports | v1.17.1 released September 21, 2026; 912 stars | GPL-3.0 |
| [Tuttle](https://github.com/tuttle-dev/tuttle) | Local desktop freelancer app with project time, revenue dashboard, effective hourly rate, expenses and spendable-income views | v4.6.2 released October 3, 2026; pushed October 4; 90 stars | GPL-3.0 |
| [Solidtime Desktop](https://github.com/solidtime-io/solidtime-desktop) | Window/URL capture, local SQLite activity records, retroactive idle boundaries, lock/sleep handling and automated tests | v0.4.0-beta released September 3, 2026; pushed September 30; 361 stars | AGPL-3.0 |

## Source evidence and boundaries

**TimeScribe:** [Project model](https://github.com/WINBIGFOX/TimeScribe/blob/main/app/Models/Project.php) calculates billable amount from worked seconds and hourly rate. [Project view](https://github.com/WINBIGFOX/TimeScribe/blob/main/resources/js/Pages/Project/Show.vue) groups entries and shows paid/open amounts. Its [activity model](https://github.com/WINBIGFOX/TimeScribe/blob/main/app/Models/ActivityHistory.php) stores app identity and intervals; it does not contain window title, document path or URL fields. This is a real local app foundation, but richer project attribution and our profit model still need implementation. Stack: Laravel/PHP, Vue, NativePHP/Electron, SQLite.

**Tuttle:** [KPI calculations](https://github.com/tuttle-dev/tuttle/blob/main/tuttle/kpi.py) use Decimal and calculate effective hourly rate as paid revenue divided by tracked hours. Its [salary feature](https://github.com/tuttle-dev/tuttle/tree/main/tuttle/app/salary) handles recurring expenses. This is the strongest money/workflow comp found, but time capture is timer/manual/import based, and invoice/tax/AI features exceed our V1. Do not substitute its receipt-based revenue semantics for our separate revenue, receipts and profit metrics.

**Solidtime Desktop:** [capture backend](https://github.com/solidtime-io/solidtime-desktop/blob/main/src/main/activity/xWinBackend.ts) wraps `@miniben90/x-win`; browser URL access can invoke AppleScript. [Activity tracker](https://github.com/solidtime-io/solidtime-desktop/blob/main/src/main/activityTracker.ts) records app/title/sanitized URL and intervals. [Idle monitor](https://github.com/solidtime-io/solidtime-desktop/blob/main/src/main/idleMonitor.ts) backdates idle to last input and handles power/session events. Full client expects Solidtime cloud or a self-hosted server; it is not a standalone replacement for our app.

## Alternative with permissive code reuse

[Accordio Tracker](https://github.com/accordio-ai/accordio-tracker), MIT, released v1.7.0 September 24, 2026, has React/Electron capture, idle handling and [learned project suggestions](https://github.com/accordio-ai/accordio-tracker/blob/main/src/renderer/hooks/useProjectSuggestion.ts). Upstream sends entries/window titles to a hosted account. It has only three stars, and its confidence heuristic is not evidence of 95% measured attribution. Useful extraction candidate, lower confidence as the whole-app base.

Next decision: keep Glaze/Swift and adapt selected patterns, or intentionally replace the app foundation with a full fork. A PHP/Vue/Electron or Python/Electron fork changes the approved architecture. Preserve the locked layout, canonical Financial Engine, privacy requirements and excluded V1 features in either route. Copied code must retain its applicable license terms.
