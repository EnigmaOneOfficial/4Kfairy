export interface Song {
    title: string;
    soundCloudUrl: string;
    mp3Url: string;
    duration?: number;
}

export const defaultSongs: Song[] = [
  {
    title: 'sleep dep montanas',
    soundCloudUrl: 'https://soundcloud.com/littlehypersprite/9-21-2020-sleep-dep-montanas?si=630fee90d84346c89fde11e53450ca70&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
    mp3Url: '/audio/sleep dep montanas.mp3',
  },
  {
    title: 'midi attempt',
    soundCloudUrl: 'https://soundcloud.com/littlehypersprite/midi_attempt_6_4_re_routing_mi?si=a7e6874d4ee34e30a6f879baf5852162&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
    mp3Url: '/audio/midi attempt.mp3',
  },
  {
    title: 'Song 3',
    soundCloudUrl: 'https://soundcloud.com/wesurf/playboi_midi_v31-salina-x-treme-machine-learning-edit?si=99b841ec74854b63bebad76e194676d1&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
    mp3Url: '',
  },
  {
    title: 'Song 4',
    soundCloudUrl: 'https://soundcloud.com/4kfairyfantasy/function111?si=f7feba56efd847479185cf262af67be4&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
    mp3Url: '',
  },
  {
    title: 'Song 5',
    soundCloudUrl: 'https://soundcloud.com/amspritzer/young-thug-power-salina-x-treme-nightcore-remix-x-am-spritzer-exclusive?si=380463c444f742aeb914cecbc97d5646&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
    mp3Url: '',
  },
  {
    title: 'Song 6',
    soundCloudUrl: 'https://soundcloud.com/littlehypersprite/stiny-tannis-youre-a-biitch?si=16b497ea0f1a494891bf57de5cd712c1&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
    mp3Url: '',
  },
];