require('./common');
require('../src/assets/images/radar/radar_legend.png');

const CSVBuilder = require('./util/factory');
var baseurl = window.location.origin;

var builder = CSVBuilder(baseurl + '/assets/radar.csv');
builder.init().build();