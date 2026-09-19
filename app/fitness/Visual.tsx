import Image from "next/image";
import { equipmentImages, exerciseImages } from "@/lib/fitness/images";
import s from "./fitness.module.css";

export function ExerciseVisual({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const visual = exerciseImages[id];
  if (!visual) return null;
  if (visual.composite) {
    return (
      <div className={s.photoComposite}>
        <Image
          src={visual.composite}
          alt={`${visual.name}: movement positions`}
          fill
          sizes={compact ? "96px" : "(max-width: 700px) 90vw, 600px"}
          style={{ objectFit: "contain" }}
        />
      </div>
    );
  }
  const frames = compact ? visual.frames?.slice(-1) : visual.frames;
  return (
    <div className={compact ? s.photoSingle : s.photoPair}>
      {frames?.map((frame) => (
        <figure key={frame.src}>
          <div className={s.photoFrame}>
            <Image
              src={frame.src}
              alt={`${visual.name}: ${frame.label.toLowerCase()} position`}
              fill
              sizes={compact ? "96px" : "(max-width: 700px) 45vw, 300px"}
              style={{ objectFit: "contain" }}
            />
          </div>
          {!compact && <figcaption>{frame.label}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

export function EquipmentVisual({ gear }: { gear: string }) {
  const photo = equipmentImages[gear];
  if (!photo) return null;
  return (
    <div className={s.equipmentPhoto}>
      <Image
        src={photo.src}
        alt={photo.name}
        fill
        sizes="72px"
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
