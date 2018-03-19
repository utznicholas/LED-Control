import { nSQL } from 'nsql';
import Express from 'express';
import ExpressWs from 'express-ws';
import { createStore } from 'redux';

import Models from '/lib/db/models';
import Load from '/lib/db/load';

import * as Actions from './lib/actions';
import Reducer from '/lib/reducer';

import WebApi from '/lib/net/api';
import DeviceServer from '/lib/net/DeviceServer';

// initialize nSQL database
console.log("[init] Defining nSQL DB models");
Models(nSQL);
console.log("[init] Connecting Database");
let prmDB = nSQL().connect();

// initialize Redux Store
console.log("[init] Creating Redux Store");
var reducer = new Reducer();
var store = createStore(reducer);

// load everything
let prmLoad;
prmDB.then(() => {
  console.log("[init] DB ready, loading data");
  prmLoad = Load(nSQL, store);
});

// initialize tcp control server
let prmDSrv;
let deviceServer = new DeviceServer(store);
prmLoad.then(() => {
  console.log("[init] Data loaded");
  console.log("[init] Initializing device server");
  prmDSrv = deviceServer.listen(12321);
});

// initialize Express web server
var app = Express();
var ws = ExpressWs(app);
var api = new WebApi(app);
prmDSrv.then(() => {
  console.log("[init] Device server ready");
  console.log("[init] Initializing web server");
  app.listen(80);
});
