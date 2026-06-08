type AiGeneratedImagePreviewProps = {
  imageUrl: string;
};

export function AiGeneratedImagePreview({ imageUrl }: AiGeneratedImagePreviewProps) {
  return (
    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
      {imageUrl ? (
        <img src={imageUrl} alt="Generated course visual preview" className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm text-slate-500">Preview</span>
      )}
    </div>
  );
}

