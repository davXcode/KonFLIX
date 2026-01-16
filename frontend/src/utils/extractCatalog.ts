export function extractSubjectsFromHomepage(data: any) {
  const lists = data?.operatingList || [];

  const all = lists
    .filter((x: any) => x.type === 'SUBJECTS_MOVIE')
    .flatMap((x: any) => x.subjects || []);

  // deduplicate by subjectId
  const map = new Map<string, any>();
  for (const item of all) {
    if (item?.subjectId && !map.has(item.subjectId)) {
      map.set(item.subjectId, item);
    }
  }

  return Array.from(map.values());
}

export function extractLiveSports(data: any) {
  const lists = data?.operatingList || [];

  return lists
    .filter((x: any) => x.type === 'SPORT_LIVE')
    .flatMap((x: any) => x.liveList || []);
}

export function extractPlatforms(data: any): string[] {
  return (data?.platformList || []).map((p: any) => p.name);
}
