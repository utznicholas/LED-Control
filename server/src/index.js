import { nSQL } from 'nsql';
import Express from 'express';
import ExpressWs from 'express-ws';

import * as Actions from './lib/actions';
import Models from '/lib/models';

// initialize nSQL database
Models(nSQL);

// initialize Redux Store


// initialize tcp control server


// initialize Express web server
var app = Express();
var ws = ExpressWs(app);
