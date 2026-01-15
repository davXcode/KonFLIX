
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDetail, getSources, generateStream } from "../services/api";

export default function Detail() {
  const { id } = useParams();
  const [detail, setDetail] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [streamUrl, setStreamUrl] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    getDetail(id).then(res => setDetail(res.data.subject));
    getSources(id).then(res => setSources(res.data.processedSources || []));
  }, [id]);

  const play = async (url: string) => {
    const res = await generateStream(url);
    setStreamUrl(res.data.streamUrl);
  };

  if (!detail) return <div className="pt-24 p-6">Loading...</div>;

  return (
    <div className="pt-24 p-6">
      <div className="flex gap-8">
        <img src={detail.cover.url} className="h-[400px] rounded" />
        <div>
          <h1 className="text-4xl font-bold mb-4">{detail.title}</h1>
          <p className="mb-4">{detail.description}</p>
          <div className="flex gap-2">
            {sources.map(s => (
              <button key={s.id} onClick={() => play(s.directUrl)} className="bg-red-600 px-4 py-2 rounded">
                {s.quality}p
              </button>
            ))}
          </div>
        </div>
      </div>

      {streamUrl && (
        <div className="mt-8">
          <video src={streamUrl} controls className="w-full max-w-5xl" />
        </div>
      )}
    </div>
  );
}
