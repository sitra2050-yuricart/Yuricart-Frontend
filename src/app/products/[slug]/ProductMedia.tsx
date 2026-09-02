import ProductImage from "@/components/ProductImage";
import { cn } from "@/lib/utils";
import { PlayIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";

export interface ProductMediaItem {
  _id?: string;
  image?: { url?: string; altText?: string };
  video?: {
    files?: Array<{ url?: string; format?: string; altText?: string }>;
    stillFrameMediaId?: string;
  };
  thumbnail?: { url?: string };
}

interface ProductMediaProps {
  media: ProductMediaItem[] | undefined;
}

export default function ProductMedia({ media }: ProductMediaProps) {
  const [selectedMedia, setSelectedMedia] = useState(media?.[0]);

  useEffect(() => {
    setSelectedMedia(media?.[0]);
  }, [media]);

  if (!media?.length) return null;

  const selectedImage = selectedMedia?.image;
  const selectedVideo = selectedMedia?.video?.files?.[0];

  return (
    <div className="h-fit basis-2/5 space-y-5 md:sticky md:top-10">
      <div className="aspect-[4/5] overflow-hidden bg-secondary">
        {selectedImage?.url ? (
          <Zoom key={selectedImage.url}>
            <ProductImage
              src={selectedImage.url}
              alt={selectedImage.altText}
              width={800}
              height={1000}
              sizes="(max-width: 768px) 100vw, 40vw"
              className="h-full w-full object-cover"
              priority
            />
          </Zoom>
        ) : selectedVideo?.url ? (
          <div className="flex size-full items-center justify-center bg-black">
            <video
              key={selectedVideo.url}
              controls
              playsInline
              preload="metadata"
              poster={selectedMedia?.thumbnail?.url}
              className="max-h-full max-w-full"
            >
              <source
                src={selectedVideo.url}
                type={
                  selectedVideo.format
                    ? `video/${selectedVideo.format}`
                    : "video/mp4"
                }
              />
            </video>
          </div>
        ) : null}
      </div>
      {media.length > 1 && (
        <div className="flex flex-wrap gap-5">
          {media.map((mediaItem, index) => (
            <MediaPreview
              key={
                mediaItem._id ||
                mediaItem.image?.url ||
                mediaItem.video?.files?.[0]?.url ||
                `media-${index}`
              }
              mediaItem={mediaItem}
              isSelected={mediaItem === selectedMedia}
              onSelect={() => setSelectedMedia(mediaItem)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface MediaPreviewProps {
  mediaItem: ProductMediaItem;
  isSelected: boolean;
  onSelect: () => void;
}

function MediaPreview({ mediaItem, isSelected, onSelect }: MediaPreviewProps) {
  const imageUrl = mediaItem.image?.url;
  const videoUrl = mediaItem.video?.files?.[0]?.url;
  const stillFrameMediaId = mediaItem.video?.stillFrameMediaId;
  const thumbnailUrl = mediaItem.thumbnail?.url;
  const resolvedThumbnailUrl =
    stillFrameMediaId && thumbnailUrl
      ? thumbnailUrl.split(stillFrameMediaId)[0] + stillFrameMediaId
      : imageUrl || thumbnailUrl;

  return (
    <div
      className={cn(
        "relative size-[100px] cursor-pointer bg-secondary",
        isSelected && "outline outline-1 outline-primary",
      )}
      onMouseEnter={onSelect}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect();
      }}
    >
      {resolvedThumbnailUrl ? (
        <ProductImage
          src={resolvedThumbnailUrl}
          alt={mediaItem.image?.altText || mediaItem.video?.files?.[0]?.altText}
          width={100}
          height={100}
          className="size-full object-cover"
        />
      ) : videoUrl ? (
        <div className="flex size-full items-center justify-center bg-black">
          <video
            src={videoUrl}
            muted
            playsInline
            preload="metadata"
            className="size-full object-cover"
          />
        </div>
      ) : (
        <div className="size-full bg-muted" />
      )}
      {videoUrl ? (
        <span className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40">
          <PlayIcon className="size-5 text-white/60" />
        </span>
      ) : null}
    </div>
  );
}
