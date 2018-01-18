# LED Control Server

Redux store state:
```
{
  devices: {
    {id}: {
      id: number,
      name: string,
      ports: number[],
      indices: number[],
      tune: number[]
    },
    devices: number[]
  },
  channels: {
    {addr}: {
      addr: number,
      name: string,
      size: number,
      state: number[]
    },
    channels: number[]
  },
  colors: {
    {id}: {
      id: id,
      name: string,
      color: number[]
    },
    colors: number[]
  },
  timelines: {
    {id}: {
      id: number,
      name: string,
      channels: number[],
      duration: number,
      stops: {
        {target}: {
          offset: number,
          color: number[]
        }[]
      }
    },
    timelines: number[]
  },
  schedules: {
    {id}: {
      id: number,
      name: string,
      tab: string,
      timeline: number,
      enabled: boolean,
      channels: number[]
      task: CronTask
    },
    schedules: number[]
  },
  instances: {
    {id}: {
      id: number,
      progress: number,
      running: boolean,
      timeline: number,
      channels: number[]
    },
    instances: number[]
  }
}
```

## Future Ideas
* some system for 'scripting' as opposed to explicit timelining (for things like randomization)
* 
