import { financeMetadata } from "@/lib/ledger/metadata";
import { metadata as base } from "../finances/layout";
export { default, viewport } from "../finances/layout";
export const metadata = { ...base, ...financeMetadata("plan") };
