// Measured from Lineups vector 1892:7859 and Intent vector 2:29.
export const blurRadii = [0.19125, 0.3825, 1.33875, 2.6775, 4.59, 8.0325];
export function cornerGlowSvg({id='corner-glow', color='#FF7A24', scale=1}={}) {
  if(!/^[a-zA-Z][\w-]*$/.test(id)||!/^#[\da-fA-F]{6}$/.test(color)||!Number.isFinite(scale)||scale<=0) throw new Error('Invalid glow parameters');
  const rgb=[1,3,5].map(n=>parseInt(color.slice(n,n+2),16)/255);
  const matrix=`0 0 0 0 ${rgb[0]} 0 0 0 0 ${rgb[1]} 0 0 0 0 ${rgb[2]} 0 0 0 1 0`;
  const branches=blurRadii.map((r,i)=>`<feGaussianBlur in="hardAlpha" stdDeviation="${r/2}" result="blur${i}"/><feColorMatrix in="blur${i}" type="matrix" values="${matrix}" result="glow${i}"/>`).join('');
  const merge=blurRadii.map((_,i)=>`<feMergeNode in="glow${i}"/>`).join('');
  return `<svg width="${260*scale}" height="${260*scale}" viewBox="-12 -12 260 260" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><filter id="${id}" x="-12" y="-12" width="260" height="260" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>${branches}<feMerge>${merge}<feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path d="M 234.875 0.05054725706577301 L 29.375 0.05091531574726105 C 9.875 -0.5136718600988388 1.5 3.486186981201172 1.5 18.630313873291016 L 0 234.0509033203125" stroke="${color}" stroke-width="3" filter="url(#${id})"/></svg>`;
}
