
export default function(nSQL) {
  nSQL("device").model([                  // describes a slave device
    {key:"id", type:"int", props:["pk"]}, // a unique ID number for the device
    {key:"name", type:"string"},          // a user friendly name for the device
    {key:"ports", type:"int[]"},          // the channels to which the devices physical ports are assigned
    {key:"indices", type:"int[]"},        // the index within the channel associated channel that a port is assigned to
    {key:"tune", type:"int[]"}            // tuning for each port
  ]);
  // Note: ports, indices, and tune should all be the same length

  nSQL("channel").model([                   // a logical channel to write data to
    {key:"addr", type:"int", props:["pk"]}, // the address of the channel
    {key:"name", type:"string"},            // a user-friendly name for the channel
    {key:"size", type:"int"}                // the number of values in the channel (ie 3 for RGB, 4 for RGBW)
  ]);

  nSQL("color").model([                     // stores colors for later use
    {key:"id", type:"int", props:["pk"]},   // an ID for the color
    {key:"name", type:"string"},            // a user-friendly name for the color
    {key:"color", type:"float[]"}           // the value of the color
  ]);

  /*
   * Note:
   *  The term "channel index" does not reffer to a channel address,
   *  but to the argument index of the target channels passed to the
   *  parent timeline.
   */

  nSQL("timeline").model([                      // a sequence of timelineEntries
    {key:"id", type:"int", props:["pk", "ai"]}, // ID for the timeline
    {key:"name", type:"string"},                // a friendly name for the timeline
    {key:"duration", type:"int"},               // the duration of this timeline
    {key:"channels", type:"int[]"},             // the sizes of the channels that the timeline controls
    {key:"stops", type:"string"}                // JSON string of color stops in the timeline
  ]);

  /* timeline color stop schema:
   * {
   *   target: number, // the target channel index
   *   offset: number, // the offset in ms from the start of the timeline
   *   color: number[] // the color at this stop
   * }
  */

  nSQL("schedule").model([                      // a schedule that runs a timeline at a defined time
    {key:"id", type:"int", props:["pk", "ai"]}, // ID of the schedule
    {key:"name", type:"string"},                // friendly name of the schedule
    {key:"tab", type:"string"},                 // a cron-tab on which the timeline is run
    {key:"timeline", type:"int"},               // ID of the timeline to run
    {key:"channels", type:"int[]"},             // list of channels to run the timeline on
    {key:"enabled", type:"bool"}                // whether the schedule is enabled or not
  ]);
}
