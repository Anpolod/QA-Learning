type AiImageHistoryProps = {
  history: string[];
  onSelect: (url: string) => void;
};

export function AiImageHistory({ history, onSelect }: AiImageHistoryProps) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {history.map((item) => (
        <button key={item} type="button" onClick={() => onSelect(item)} className="aspect-square overflow-hidden rounded-md border">
          <img src={item} alt="Generated image history item" className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  );
}

