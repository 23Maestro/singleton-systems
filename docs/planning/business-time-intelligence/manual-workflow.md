# Manual project workflow

October 4, 2026. Implementation contract for
[Define the manual project workflow](https://linear.app/23maestro/issue/23M-216/define-the-manual-project-workflow).
The approved spec governs scope.

## First usable path

Project Economics → enter inputs → submit → save dated project records in
SQLite → show canonical Swift Financial Engine results. Glaze uses the locked
workspace; Raycast pushes its native result view. Collection stays off.
Engine and persistence must pass before this form is wired. Keep edits on error;
a failed save cannot show “saved.” Repeated submissions use request IDs.

## Inputs

| Field | Contract |
| --- | --- |
| Client / project | Trim names; project required. Client may be absent for internal business work. Select stable saved IDs; avoid creating duplicate names silently. |
| Job price | Fixed USD price; explicit zero allowed. Expanded hourly mode uses rate and billed hours. Actual hours never become billed hours implicitly. |
| Hours | Actual project hours, including dated manual entries. Explicit zero allowed. Manual duration additions require overlap review against existing tracked time. |
| Direct costs | Production costs only in this field; itemized fees appear separately. Blank means unknown; zero must be explicit. |
| Platform fee | Enter percentage; no universal Upwork default. Gross billed is the default fee base. A settled platform amount replaces its estimate. |
| Other fees | Itemized transaction, withdrawal or other project fees. Allocated shared withdrawals must not be charged in full to every project. |
| Expanded inputs | Allocated overhead, target hourly value, revenue status quote/billed/received and actual net received. Optional tax reserve percentage or explicit estimate; never both. |

Money accepts nonnegative USD amounts with at most two decimal places;
percentages accept 0–100 with two decimal places. Reject invalid, nonfinite,
mixed-currency or unsafe values. Decimal hours accept three places and normalize
to integer milliseconds. Money normalizes to minor units; percentages to basis
points. Swift validates normalized inputs again. Profit outputs may be negative.

Unknown expenses cannot become zero. Missing overhead uses an explicit
“overhead excluded” assumption. Unknown costs/fees leave affected profit results
unavailable. Billed and actual hours remain separate.

## Results and corrections

Show gross revenue, each cost/fee, gross profit/margin, overhead, operating
profit/margin, revenue/hour, gross profit/hour and operating profit/hour.
Show economic profit only with a labor target; own labor stays separate from
direct costs. Show estimated take-home only with a tax scenario. Zero
denominators display unavailable. Net receipts exclude production costs;
observed receipts remain separate from estimated payout.

Formula operands and explanations come from the engine. Corrections revise
dated input records; never overwrite raw activity. Start closes an earlier
project intention atomically; Stop is idempotent. With collection off, Stop
presents elapsed timer time for review before saving; AFK is not assumed excluded.

## Acceptance example

$500 price, $100 production costs, explicit zero fees/overhead and four actual
hours yield $400 gross/operating profit, 80% margins, $125 revenue/hour and
$100 profit/hour. A $100/hour labor target yields $0 economic profit.
Financial Engine tests must establish these values before either UI consumes them.
