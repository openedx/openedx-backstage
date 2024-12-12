import {
  TechRadarApi,
  TechRadarLoaderResponse,
} from '@backstage/plugin-tech-radar';

export class RemoteJSONTechRadarClient implements TechRadarApi {
  async load(id: string | undefined): Promise<TechRadarLoaderResponse> {
    // if needed id prop can be used to fetch the correct data
    // This file lives in the same repo at the top level.  It will be loaded when Backstage starts
    // It's possible that the running version will be on a different version of main than the catalog
    // file it is running
    const data = await fetch('https://raw.githubusercontent.com/openedx/openedx-backstage/main/tech-radar.json').then(res => res.json());

    // For example, this converts the timeline dates into date objects
    return {
      ...data,
      entries: data.entries.map(entry => ({
        ...entry,
        timeline: entry.timeline.map(timeline => ({
          ...timeline,
          date: new Date(timeline.date),
        })),
      })),
    };
  }
}
