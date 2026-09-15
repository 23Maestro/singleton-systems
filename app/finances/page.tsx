import FinanceAccessGate from "./FinanceAccessGate";
import Ledger from "./ledger/Ledger";

export default function FinancesPage() {
  return <FinanceAccessGate><Ledger /></FinanceAccessGate>;
}
