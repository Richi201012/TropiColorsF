import type { HomeBlob } from "./types";

type HomeBackgroundProps = {
  blobs: HomeBlob[];
};

export default function HomeBackground({ blobs }: HomeBackgroundProps) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {blobs.map((blob) => (
          <div
            key={blob.className}
            className={blob.className}
            style={
              blob.animationDelay
                ? { animationDelay: blob.animationDelay }
                : undefined
            }
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.22),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.08)_24%,rgba(255,255,255,0.02)_46%,rgba(255,255,255,0.1)_100%)]" />
    </>
  );
}
