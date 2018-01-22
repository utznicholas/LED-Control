import {
  loadedDevice,
  loadedChannel,
  loadedColor,
  loadedTimeline,
  loadedSchedule,
  BatchAction
} from '/lib/actions';

export default function load(nSQL, store) {
  let promises = [
    nSQL("device").query("select").exec().then((rows) => {
      let batch = new Actions.BatchAction();
      rows.forEach((e) => {
        batch.append(Actions.loadedDevice(e.id, e.name, e.ports.map((e, i) => {
          return [
            e, e.indices[i], e.tune[i]
          ];
        })));
      });
      store.dispatch(batch);
    }),
    nSQL("channel").query("select").exec().then((rows) => {
      let batch = new Actions.BatchAction();
      rows.forEach((e) => {
        batch.append(Actions.loadedChannel(e.addr, e.name, e.size));
      });
      store.dispatch(batch);
    }),
    nSQL("color").query("select").exec().then((rows) => {
      let batch = new Actions.BatchAction();
      rows.forEach((e) => {
        batch.append(Actions.loadedColor(e.id, e.name, e.color));
      });
      store.dispatch(batch);
    }),
    nSQL("timeline").query("select").exec().then((rows) => {
      let batch = new Actions.BatchAction();
      rows.forEach((e) => {
        let stops = {};
        let stopData = JSON.parse(e.stops).stops;
        stopData.forEach((e) => {
          (stops.hasOwnProperty(e.target) ? stops[e.target] : stops[e.target] = []).push({
            offset: e.offset,
            color: e.color
          });
        });
        batch.append(Actions.loadedTimeline(e.id, e.name, e.duration, e.channels, stops));
      });
      store.dispatch(batch);
    }),
    nSQL("schedule").query("select").exec().then((rows) => {
      let batch = new Actions.BatchAction();
      rows.forEach((e) => {
        batch.append(Actions.loadedSchedule(e.id, e.name, e.tab, e.timeline, e.channels, e.enabled));
      });
      store.dispatch(batch);
    })
  ];
  return Promise.all(promises);
}