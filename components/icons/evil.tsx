// SVG paths from evil-icons (MIT). See THIRD-PARTY.md.
import type { SVGProps } from "react"

export type IconProps = SVGProps<SVGSVGElement> & { size?: number }
export type EvilIcon = (props: IconProps) => React.JSX.Element

export function ChevronLeft({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M27.3 34.7L17.6 25l9.7-9.7 1.4 1.4-8.3 8.3 8.3 8.3z"/></svg>
}
export function ChevronRight({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M22.7 34.7l-1.4-1.4 8.3-8.3-8.3-8.3 1.4-1.4 9.7 9.7z"/></svg>
}
export function ChevronDownIcon({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M25 32.4l-9.7-9.7 1.4-1.4 8.3 8.3 8.3-8.3 1.4 1.4z"/></svg>
}
export function ChevronLeftIcon({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M27.3 34.7L17.6 25l9.7-9.7 1.4 1.4-8.3 8.3 8.3 8.3z"/></svg>
}
export function ChevronRightIcon({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M22.7 34.7l-1.4-1.4 8.3-8.3-8.3-8.3 1.4-1.4 9.7 9.7z"/></svg>
}
export function CalendarDays({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M37 38H13c-1.7 0-3-1.3-3-3V13c0-1.7 1.1-3 2.5-3H14v2h-1.5c-.2 0-.5.4-.5 1v22c0 .6.4 1 1 1h24c.6 0 1-.4 1-1V13c0-.6-.3-1-.5-1H36v-2h1.5c1.4 0 2.5 1.3 2.5 3v22c0 1.7-1.3 3-3 3z"/><path d="M17 14c-.6 0-1-.4-1-1V9c0-.6.4-1 1-1s1 .4 1 1v4c0 .6-.4 1-1 1z"/><path d="M33 14c-.6 0-1-.4-1-1V9c0-.6.4-1 1-1s1 .4 1 1v4c0 .6-.4 1-1 1z"/><path d="M20 10h10v2H20z"/><path d="M12 16h26v2H12z"/><path d="M34 20h2v2h-2z"/><path d="M30 20h2v2h-2z"/><path d="M26 20h2v2h-2z"/><path d="M22 20h2v2h-2z"/><path d="M18 20h2v2h-2z"/><path d="M34 24h2v2h-2z"/><path d="M30 24h2v2h-2z"/><path d="M26 24h2v2h-2z"/><path d="M22 24h2v2h-2z"/><path d="M18 24h2v2h-2z"/><path d="M14 24h2v2h-2z"/><path d="M34 28h2v2h-2z"/><path d="M30 28h2v2h-2z"/><path d="M26 28h2v2h-2z"/><path d="M22 28h2v2h-2z"/><path d="M18 28h2v2h-2z"/><path d="M14 28h2v2h-2z"/><path d="M30 32h2v2h-2z"/><path d="M26 32h2v2h-2z"/><path d="M22 32h2v2h-2z"/><path d="M18 32h2v2h-2z"/><path d="M14 32h2v2h-2z"/></svg>
}
export function X({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M37.304 11.282l1.414 1.414-26.022 26.02-1.414-1.413z"/><path d="M12.696 11.282l26.022 26.02-1.414 1.415-26.022-26.02z"/></svg>
}
export function Check({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z"/><path d="M23 32.4l-8.7-8.7 1.4-1.4 7.3 7.3 11.3-11.3 1.4 1.4z"/></svg>
}
export function Plus({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z"/><path d="M16 24h18v2H16z"/><path d="M24 16h2v18h-2z"/></svg>
}
export function Minus({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z"/><path d="M16 24h18v2H16z"/></svg>
}
export function Inbox({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M42 20h-2v-5c0-.6-.4-1-1-1H11c-.6 0-1 .4-1 1v5H8v-5c0-1.7 1.3-3 3-3h28c1.7 0 3 1.3 3 3v5z"/><path d="M37 40H13c-1.7 0-3-1.3-3-3V20h2v17c0 .6.4 1 1 1h24c.6 0 1-.4 1-1V20h2v17c0 1.7-1.3 3-3 3z"/><path d="M29 26h-8c-.6 0-1-.4-1-1s.4-1 1-1h8c.6 0 1 .4 1 1s-.4 1-1 1z"/><path d="M8 18h34v2H8z"/></svg>
}
export function Moon({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M25 36C13.5 36 8.3 25.9 8.1 25.4c-.1-.3-.1-.6 0-.9C8.3 24.1 13.5 14 25 14s16.7 10.1 16.9 10.6c.1.3.1.6 0 .9-.2.4-5.4 10.5-16.9 10.5zM10.1 25c1.1 1.9 5.9 9 14.9 9s13.7-7.1 14.9-9c-1.1-1.9-5.9-9-14.9-9s-13.7 7.1-14.9 9z"/><path d="M25 34c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zm0-16c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z"/><path d="M25 30c-2.8 0-5-2.2-5-5 0-.6.4-1 1-1s1 .4 1 1c0 1.7 1.3 3 3 3s3-1.3 3-3-1.3-3-3-3c-.6 0-1-.4-1-1s.4-1 1-1c2.8 0 5 2.2 5 5s-2.2 5-5 5z"/></svg>
}
export function Sun({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M25 34c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zm0-16c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z"/><path d="M27.7 44h-5.4l-1.5-4.6c-1-.3-2-.7-2.9-1.2l-4.4 2.2-3.8-3.8 2.2-4.4c-.5-.9-.9-1.9-1.2-2.9L6 27.7v-5.4l4.6-1.5c.3-1 .7-2 1.2-2.9l-2.2-4.4 3.8-3.8 4.4 2.2c.9-.5 1.9-.9 2.9-1.2L22.3 6h5.4l1.5 4.6c1 .3 2 .7 2.9 1.2l4.4-2.2 3.8 3.8-2.2 4.4c.5.9.9 1.9 1.2 2.9l4.6 1.5v5.4l-4.6 1.5c-.3 1-.7 2-1.2 2.9l2.2 4.4-3.8 3.8-4.4-2.2c-.9.5-1.9.9-2.9 1.2L27.7 44zm-4-2h2.6l1.4-4.3.5-.1c1.2-.3 2.3-.8 3.4-1.4l.5-.3 4 2 1.8-1.8-2-4 .3-.5c.6-1 1.1-2.2 1.4-3.4l.1-.5 4.3-1.4v-2.6l-4.3-1.4-.1-.5c-.3-1.2-.8-2.3-1.4-3.4l-.3-.5 2-4-1.8-1.8-4 2-.5-.3c-1.1-.6-2.2-1.1-3.4-1.4l-.5-.1L26.3 8h-2.6l-1.4 4.3-.5.1c-1.2.3-2.3.8-3.4 1.4l-.5.3-4-2-1.8 1.8 2 4-.3.5c-.6 1-1.1 2.2-1.4 3.4l-.1.5L8 23.7v2.6l4.3 1.4.1.5c.3 1.2.8 2.3 1.4 3.4l.3.5-2 4 1.8 1.8 4-2 .5.3c1.1.6 2.2 1.1 3.4 1.4l.5.1 1.4 4.3z"/></svg>
}
export function ArrowUpRight({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M38.288 10.297l1.414 1.415-14.99 14.99-1.414-1.414z"/><path d="M40 20h-2v-8h-8v-2h10z"/><path d="M35 38H15c-1.7 0-3-1.3-3-3V15c0-1.7 1.3-3 3-3h11v2H15c-.6 0-1 .4-1 1v20c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V24h2v11c0 1.7-1.3 3-3 3z"/></svg>
}
export function CreditCard({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M39 38H11c-1.7 0-3-1.3-3-3V15c0-1.7 1.3-3 3-3h28c1.7 0 3 1.3 3 3v20c0 1.7-1.3 3-3 3zM11 14c-.6 0-1 .4-1 1v20c0 .6.4 1 1 1h28c.6 0 1-.4 1-1V15c0-.6-.4-1-1-1H11z"/><path d="M9 16h32v6H9z"/><path d="M12 26h1v2h-1z"/><path d="M14 26h1v2h-1z"/><path d="M16 26h1v2h-1z"/><path d="M19 26h1v2h-1z"/><path d="M21 26h1v2h-1z"/><path d="M23 26h1v2h-1z"/><path d="M26 26h1v2h-1z"/><path d="M28 26h1v2h-1z"/><path d="M30 26h1v2h-1z"/><path d="M33 26h1v2h-1z"/><path d="M35 26h1v2h-1z"/><path d="M37 26h1v2h-1z"/></svg>
}
export function Pencil({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M9.6 40.4l2.5-9.9L27 15.6l7.4 7.4-14.9 14.9-9.9 2.5zm4.3-8.9l-1.5 6.1 6.1-1.5L31.6 23 27 18.4 13.9 31.5z"/><path d="M17.8 37.3c-.6-2.5-2.6-4.5-5.1-5.1l.5-1.9c3.2.8 5.7 3.3 6.5 6.5l-1.9.5z"/><path d="M29.298 19.287l1.414 1.414-13.01 13.02-1.414-1.41z"/><path d="M11 39l2.9-.7c-.3-1.1-1.1-1.9-2.2-2.2L11 39z"/><path d="M35 22.4L27.6 15l3-3 .5.1c3.6.5 6.4 3.3 6.9 6.9l.1.5-3.1 2.9zM30.4 15l4.6 4.6.9-.9c-.5-2.3-2.3-4.1-4.6-4.6l-.9.9z"/></svg>
}
export function Receipt({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M42 20h-2v-5c0-.6-.4-1-1-1H11c-.6 0-1 .4-1 1v5H8v-5c0-1.7 1.3-3 3-3h28c1.7 0 3 1.3 3 3v5z"/><path d="M37 40H13c-1.7 0-3-1.3-3-3V20h2v17c0 .6.4 1 1 1h24c.6 0 1-.4 1-1V20h2v17c0 1.7-1.3 3-3 3z"/><path d="M29 26h-8c-.6 0-1-.4-1-1s.4-1 1-1h8c.6 0 1 .4 1 1s-.4 1-1 1z"/><path d="M8 18h34v2H8z"/></svg>
}
export function Repeat2({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M25 38c-7.2 0-13-5.8-13-13 0-3.2 1.2-6.2 3.3-8.6l1.5 1.3C15 19.7 14 22.3 14 25c0 6.1 4.9 11 11 11 1.6 0 3.1-.3 4.6-1l.8 1.8c-1.7.8-3.5 1.2-5.4 1.2z"/><path d="M34.7 33.7l-1.5-1.3c1.8-2 2.8-4.6 2.8-7.3 0-6.1-4.9-11-11-11-1.6 0-3.1.3-4.6 1l-.8-1.8c1.7-.8 3.5-1.2 5.4-1.2 7.2 0 13 5.8 13 13 0 3.1-1.2 6.2-3.3 8.6z"/><path d="M18 24h-2v-6h-6v-2h8z"/><path d="M40 34h-8v-8h2v6h6z"/></svg>
}
export function BriefcaseBusiness({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M42 20h-2v-5c0-.6-.4-1-1-1H11c-.6 0-1 .4-1 1v5H8v-5c0-1.7 1.3-3 3-3h28c1.7 0 3 1.3 3 3v5z"/><path d="M37 40H13c-1.7 0-3-1.3-3-3V20h2v17c0 .6.4 1 1 1h24c.6 0 1-.4 1-1V20h2v17c0 1.7-1.3 3-3 3z"/><path d="M29 26h-8c-.6 0-1-.4-1-1s.4-1 1-1h8c.6 0 1 .4 1 1s-.4 1-1 1z"/><path d="M8 18h34v2H8z"/></svg>
}
export function Car({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M25 42.5l-.8-.9C23.7 41.1 12 27.3 12 19c0-7.2 5.8-13 13-13s13 5.8 13 13c0 8.3-11.7 22.1-12.2 22.7l-.8.8zM25 8c-6.1 0-11 4.9-11 11 0 6.4 8.4 17.2 11 20.4 2.6-3.2 11-14 11-20.4 0-6.1-4.9-11-11-11z"/><path d="M25 24c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/></svg>
}
export function Cloud({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M42 20h-2v-5c0-.6-.4-1-1-1H11c-.6 0-1 .4-1 1v5H8v-5c0-1.7 1.3-3 3-3h28c1.7 0 3 1.3 3 3v5z"/><path d="M37 40H13c-1.7 0-3-1.3-3-3V20h2v17c0 .6.4 1 1 1h24c.6 0 1-.4 1-1V20h2v17c0 1.7-1.3 3-3 3z"/><path d="M29 26h-8c-.6 0-1-.4-1-1s.4-1 1-1h8c.6 0 1 .4 1 1s-.4 1-1 1z"/><path d="M8 18h34v2H8z"/></svg>
}
export function Dumbbell({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M28.6 29.4c3-2.3 7.4-5.7 7.4-18.4v-1H14v1c0 12.7 4.5 16.1 7.4 18.4 1.7 1.3 2.6 2 2.6 3.6v3c-1.6.2-3.2.8-3.8 2H18c-1.1 0-2 .9-2 2h18c0-1.1-.9-2-2-2h-2.2c-.6-1.2-2.1-1.8-3.8-2v-3c0-1.6.8-2.3 2.6-3.6zm-3.6.5c-.6-.8-1.5-1.5-2.3-2.1-2.7-2.1-6.4-4.9-6.6-15.8h18c-.2 10.8-3.9 13.7-6.6 15.8-1 .7-1.9 1.3-2.5 2.1z"/><path d="M18.8 27C18.7 27 8 24.7 8 13v-1h7v2h-5c.6 9.2 9.1 11 9.2 11l-.4 2z"/><path d="M31.2 27l-.4-2c.4-.1 8.6-1.9 9.2-11h-5v-2h7v1c0 11.7-10.7 14-10.8 14z"/></svg>
}
export function GraduationCap({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M28.6 29.4c3-2.3 7.4-5.7 7.4-18.4v-1H14v1c0 12.7 4.5 16.1 7.4 18.4 1.7 1.3 2.6 2 2.6 3.6v3c-1.6.2-3.2.8-3.8 2H18c-1.1 0-2 .9-2 2h18c0-1.1-.9-2-2-2h-2.2c-.6-1.2-2.1-1.8-3.8-2v-3c0-1.6.8-2.3 2.6-3.6zm-3.6.5c-.6-.8-1.5-1.5-2.3-2.1-2.7-2.1-6.4-4.9-6.6-15.8h18c-.2 10.8-3.9 13.7-6.6 15.8-1 .7-1.9 1.3-2.5 2.1z"/><path d="M18.8 27C18.7 27 8 24.7 8 13v-1h7v2h-5c.6 9.2 9.1 11 9.2 11l-.4 2z"/><path d="M31.2 27l-.4-2c.4-.1 8.6-1.9 9.2-11h-5v-2h7v1c0 11.7-10.7 14-10.8 14z"/></svg>
}
export function HeartPulse({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M25 39.7l-.6-.5C11.5 28.7 8 25 8 19c0-5 4-9 9-9 4.1 0 6.4 2.3 8 4.1 1.6-1.8 3.9-4.1 8-4.1 5 0 9 4 9 9 0 6-3.5 9.7-16.4 20.2l-.6.5zM17 12c-3.9 0-7 3.1-7 7 0 5.1 3.2 8.5 15 18.1 11.8-9.6 15-13 15-18.1 0-3.9-3.1-7-7-7-3.5 0-5.4 2.1-6.9 3.8L25 17.1l-1.1-1.3C22.4 14.1 20.5 12 17 12z"/></svg>
}
export function House({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M42 20h-2v-5c0-.6-.4-1-1-1H11c-.6 0-1 .4-1 1v5H8v-5c0-1.7 1.3-3 3-3h28c1.7 0 3 1.3 3 3v5z"/><path d="M37 40H13c-1.7 0-3-1.3-3-3V20h2v17c0 .6.4 1 1 1h24c.6 0 1-.4 1-1V20h2v17c0 1.7-1.3 3-3 3z"/><path d="M29 26h-8c-.6 0-1-.4-1-1s.4-1 1-1h8c.6 0 1 .4 1 1s-.4 1-1 1z"/><path d="M8 18h34v2H8z"/></svg>
}
export function LayoutGrid({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M10 12h30v4H10z"/><path d="M10 22h30v4H10z"/><path d="M10 32h30v4H10z"/></svg>
}
export function UserRound({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M25.1 42c-9.4 0-17-7.6-17-17s7.6-17 17-17 17 7.6 17 17-7.7 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.8-15-15-15z"/><path d="M15.3 37.3l-1.8-.8c.5-1.2 2.1-1.9 3.8-2.7 1.7-.8 3.8-1.7 3.8-2.8v-1.5c-.6-.5-1.6-1.6-1.8-3.2-.5-.5-1.3-1.4-1.3-2.6 0-.7.3-1.3.5-1.7-.2-.8-.4-2.3-.4-3.5 0-3.9 2.7-6.5 7-6.5 1.2 0 2.7.3 3.5 1.2 1.9.4 3.5 2.6 3.5 5.3 0 1.7-.3 3.1-.5 3.8.2.3.4.8.4 1.4 0 1.3-.7 2.2-1.3 2.6-.2 1.6-1.1 2.6-1.7 3.1V31c0 .9 1.8 1.6 3.4 2.2 1.9.7 3.9 1.5 4.6 3.1l-1.9.7c-.3-.8-1.9-1.4-3.4-1.9-2.2-.8-4.7-1.7-4.7-4v-2.6l.5-.3s1.2-.8 1.2-2.4v-.7l.6-.3c.1 0 .6-.3.6-1.1 0-.2-.2-.5-.3-.6l-.4-.4.2-.5s.5-1.6.5-3.6c0-1.9-1.1-3.3-2-3.3h-.6l-.3-.5c0-.4-.7-.8-1.9-.8-3.1 0-5 1.7-5 4.5 0 1.3.5 3.5.5 3.5l.1.5-.4.5c-.1 0-.3.3-.3.7 0 .5.6 1.1.9 1.3l.4.3v.5c0 1.5 1.3 2.3 1.3 2.4l.5.3v2.6c0 2.4-2.6 3.6-5 4.6-1.1.4-2.6 1.1-2.8 1.6z"/></svg>
}
export function UsersRound({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M25.1 42c-9.4 0-17-7.6-17-17s7.6-17 17-17 17 7.6 17 17-7.7 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.8-15-15-15z"/><path d="M15.3 37.3l-1.8-.8c.5-1.2 2.1-1.9 3.8-2.7 1.7-.8 3.8-1.7 3.8-2.8v-1.5c-.6-.5-1.6-1.6-1.8-3.2-.5-.5-1.3-1.4-1.3-2.6 0-.7.3-1.3.5-1.7-.2-.8-.4-2.3-.4-3.5 0-3.9 2.7-6.5 7-6.5 1.2 0 2.7.3 3.5 1.2 1.9.4 3.5 2.6 3.5 5.3 0 1.7-.3 3.1-.5 3.8.2.3.4.8.4 1.4 0 1.3-.7 2.2-1.3 2.6-.2 1.6-1.1 2.6-1.7 3.1V31c0 .9 1.8 1.6 3.4 2.2 1.9.7 3.9 1.5 4.6 3.1l-1.9.7c-.3-.8-1.9-1.4-3.4-1.9-2.2-.8-4.7-1.7-4.7-4v-2.6l.5-.3s1.2-.8 1.2-2.4v-.7l.6-.3c.1 0 .6-.3.6-1.1 0-.2-.2-.5-.3-.6l-.4-.4.2-.5s.5-1.6.5-3.6c0-1.9-1.1-3.3-2-3.3h-.6l-.3-.5c0-.4-.7-.8-1.9-.8-3.1 0-5 1.7-5 4.5 0 1.3.5 3.5.5 3.5l.1.5-.4.5c-.1 0-.3.3-.3.7 0 .5.6 1.1.9 1.3l.4.3v.5c0 1.5 1.3 2.3 1.3 2.4l.5.3v2.6c0 2.4-2.6 3.6-5 4.6-1.1.4-2.6 1.1-2.8 1.6z"/></svg>
}
export function Utensils({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M35 34H13c-.3 0-.6-.2-.8-.4s-.2-.6-.1-.9l1.9-4.8L12.1 10H6V8h7c.5 0 .9.4 1 .9l2 19c0 .2 0 .3-.1.5L14.5 32H36l-1 2z"/><path d="M15.2 29l-.4-2L38 22.2V14H14v-2h25c.6 0 1 .4 1 1v10c0 .5-.3.9-.8 1l-24 5z"/><path d="M36 40c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M12 40c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
}
export function Zap({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z"/><path d="M24 32h2v2h-2z"/><path d="M25.6 30h-1.2l-.4-8v-6h2v6z"/></svg>
}
export function HomeIcon({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M42 20h-2v-5c0-.6-.4-1-1-1H11c-.6 0-1 .4-1 1v5H8v-5c0-1.7 1.3-3 3-3h28c1.7 0 3 1.3 3 3v5z"/><path d="M37 40H13c-1.7 0-3-1.3-3-3V20h2v17c0 .6.4 1 1 1h24c.6 0 1-.4 1-1V20h2v17c0 1.7-1.3 3-3 3z"/><path d="M29 26h-8c-.6 0-1-.4-1-1s.4-1 1-1h8c.6 0 1 .4 1 1s-.4 1-1 1z"/><path d="M8 18h34v2H8z"/></svg>
}
export function EntryIcon({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M9.6 40.4l2.5-9.9L27 15.6l7.4 7.4-14.9 14.9-9.9 2.5zm4.3-8.9l-1.5 6.1 6.1-1.5L31.6 23 27 18.4 13.9 31.5z"/><path d="M17.8 37.3c-.6-2.5-2.6-4.5-5.1-5.1l.5-1.9c3.2.8 5.7 3.3 6.5 6.5l-1.9.5z"/><path d="M29.298 19.287l1.414 1.414-13.01 13.02-1.414-1.41z"/><path d="M11 39l2.9-.7c-.3-1.1-1.1-1.9-2.2-2.2L11 39z"/><path d="M35 22.4L27.6 15l3-3 .5.1c3.6.5 6.4 3.3 6.9 6.9l.1.5-3.1 2.9zM30.4 15l4.6 4.6.9-.9c-.5-2.3-2.3-4.1-4.6-4.6l-.9.9z"/></svg>
}
export function CalendarIcon({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M37 38H13c-1.7 0-3-1.3-3-3V13c0-1.7 1.1-3 2.5-3H14v2h-1.5c-.2 0-.5.4-.5 1v22c0 .6.4 1 1 1h24c.6 0 1-.4 1-1V13c0-.6-.3-1-.5-1H36v-2h1.5c1.4 0 2.5 1.3 2.5 3v22c0 1.7-1.3 3-3 3z"/><path d="M17 14c-.6 0-1-.4-1-1V9c0-.6.4-1 1-1s1 .4 1 1v4c0 .6-.4 1-1 1z"/><path d="M33 14c-.6 0-1-.4-1-1V9c0-.6.4-1 1-1s1 .4 1 1v4c0 .6-.4 1-1 1z"/><path d="M20 10h10v2H20z"/><path d="M12 16h26v2H12z"/><path d="M34 20h2v2h-2z"/><path d="M30 20h2v2h-2z"/><path d="M26 20h2v2h-2z"/><path d="M22 20h2v2h-2z"/><path d="M18 20h2v2h-2z"/><path d="M34 24h2v2h-2z"/><path d="M30 24h2v2h-2z"/><path d="M26 24h2v2h-2z"/><path d="M22 24h2v2h-2z"/><path d="M18 24h2v2h-2z"/><path d="M14 24h2v2h-2z"/><path d="M34 28h2v2h-2z"/><path d="M30 28h2v2h-2z"/><path d="M26 28h2v2h-2z"/><path d="M22 28h2v2h-2z"/><path d="M18 28h2v2h-2z"/><path d="M14 28h2v2h-2z"/><path d="M30 32h2v2h-2z"/><path d="M26 32h2v2h-2z"/><path d="M22 32h2v2h-2z"/><path d="M18 32h2v2h-2z"/><path d="M14 32h2v2h-2z"/></svg>
}
export function PlanIcon({ size = 24, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M18 36h-2V26h-4v10h-2V24h8z"/><path d="M28 36h-2V20h-4v16h-2V18h8z"/><path d="M38 36h-2V14h-4v22h-2V12h8z"/><path d="M8 36h32v2H8z"/></svg>
}
