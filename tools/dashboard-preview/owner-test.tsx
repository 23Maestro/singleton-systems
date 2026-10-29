import { createRoot } from "react-dom/client";
import CommandCenterApp from "../../app/command-center/CommandCenterApp";

// Test entry only. Playwright stubs the public HTTP boundary, never app internals.
createRoot(document.getElementById("root")!).render(<CommandCenterApp />);
