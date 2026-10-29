"use client";
import {useEffect,useLayoutEffect,useRef,useId} from "react";

export default function DurationWheel({label,value,max,step=1,unit,onChange}:{label:string;value:number;max:number;step?:number;unit:string;onChange:(value:number)=>void}){
 const ref=useRef<HTMLDivElement>(null);
 const timer=useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
 const id=useId();
 const current=useRef({value,max,onChange});
 current.current={value,max,onChange};
 useLayoutEffect(()=>{if(ref.current)ref.current.scrollTop=value/step*32;},[value,step]);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 function choose(next:number){onChange(Math.max(0,Math.min(max,next)));}
 return <div className="cc-wheel" role="listbox" aria-label={label} tabIndex={0} ref={ref} aria-activedescendant={`${id}-${value}`}
 onKeyDown={(event)=>{if(["ArrowUp","ArrowDown","Home","End"].includes(event.key)){event.preventDefault();choose(event.key==="Home"?0:event.key==="End"?max:value+(event.key==="ArrowDown"?step:-step));}}}
 onScroll={()=>{clearTimeout(timer.current);timer.current=setTimeout(()=>{const next=Math.min(current.current.max,Math.round((ref.current?.scrollTop??0)/32)*step);if(next!==current.current.value)current.current.onChange(next);},120);}}>
 {Array.from({length:Math.floor(max/step)+1},(_,index)=>index*step).map((option)=><div key={option} id={`${id}-${option}`} role="option" aria-selected={option===value} onClick={()=>choose(option)}>{String(option).padStart(2,"0")} <small>{unit}</small></div>)}
 </div>;
}
