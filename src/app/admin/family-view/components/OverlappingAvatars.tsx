type OverlappingAvatarsProps = {
  images: string[];
  size?: number; // in pixels
  overlapRatio?: number; // 0 to 1, how much to overlap (e.g., 0.3 means 30% overlap)
};

export default function OverlappingAvatars({
  images,
  size = 48,
  overlapRatio = 0.3,
}: OverlappingAvatarsProps) {
  const overlap = size * overlapRatio;

  return (
    <div className="flex items-center">
      {images.map((src, index) => (
        <div
          key={index}
          className="rounded-full border-2 border-white shadow"
          style={{
            width: size,
            height: size,
            overflow: "hidden",
            zIndex: index,
            marginLeft: index === 0 ? 0 : `-${overlap}px`,
          }}
        >
          <img
            src={src}
            alt={`Avatar ${index + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ))}
    </div>
  );
}
