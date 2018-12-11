require('./common');
require('../src/assets/images/radar/radar_legend.png');

const CSVBuilder = require('./util/factory');

var builder = CSVBuilder('{{site.url}}{{site.baseurl}}/assets/radar.csv');
builder.init().build();