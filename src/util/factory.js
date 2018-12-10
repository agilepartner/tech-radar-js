const d3 = require('d3');
const _ = {
    map: require('lodash/map'),
    uniqBy: require('lodash/uniqBy'),
    capitalize: require('lodash/capitalize'),
    each: require('lodash/each')
};

const InputSanitizer = require('./inputSanitizer');
const Radar = require('../models/radar');
const Quadrant = require('../models/quadrant');
const Ring = require('../models/ring');
const Blip = require('../models/blip');
const GraphingRadar = require('../graphing/radar');
const MalformedDataError = require('../exceptions/malformedDataError');
const ContentValidator = require('./contentValidator');
const ExceptionMessages = require('./exceptionMessages');

const CSVBuilder = function (url) {
    var self = {};

    self.build = function () {
        d3.csv(url, createBlips);
    }

    var createBlips = function (data) {
        try {
            var columnNames = data['columns'];
            delete data['columns'];
            var contentValidator = new ContentValidator(columnNames);
            contentValidator.verifyContent();
            contentValidator.verifyHeaders();
            var blips = _.map(data, new InputSanitizer().sanitize);
            plotRadar('Tech-radar', blips);
            loadBuddy();
        } catch (exception) {
            plotErrorMessage(exception);
        }
    }

    self.init = function () {
        plotLoading();
        return self;
    };

    return self;
};

const plotRadar = function (title, blips) {
    document.title = title;
    d3.selectAll(".loading").remove();

    var rings = _.map(_.uniqBy(blips, 'ring'), 'ring');
    var ringMap = {};
    var maxRings = 4;

    _.each(rings, function (ringName, i) {
        if (i == maxRings) {
            throw new MalformedDataError(ExceptionMessages.TOO_MANY_RINGS);
        }
        ringMap[ringName] = new Ring(ringName, i);
    });

    var quadrants = {};
    _.each(blips, function (blip) {
        if (!quadrants[blip.quadrant]) {
            quadrants[blip.quadrant] = new Quadrant(_.capitalize(blip.quadrant));
        }
        quadrants[blip.quadrant].add(new Blip(blip.name, ringMap[blip.ring], blip.isNew.toLowerCase() === 'true', blip.topic, blip.description))
    });

    var radar = new Radar();
    _.each(quadrants, function (quadrant) {
        radar.addQuadrant(quadrant)
    });

    var size = (window.innerHeight - 133) < 620 ? 620 : window.innerHeight - 133;

    new GraphingRadar(size, radar).init().plot();
}

function plotLoading(content) {
    var content = d3.select('radar')
        .append('div')
        .attr('class', 'loading')
        .append('div')
        .attr('class', 'input-sheet');

    document.title = "Building...";
}

function plotErrorMessage(exception) {
    d3.selectAll(".loading").remove();
    var message = 'Oops! It seems like there are some problems with loading your data. ';

    if (exception instanceof MalformedDataError) {
        message = message.concat(exception.message);
    } else {
        console.error(exception);
    }

    d3.select('radar')
        .append('div')
        .attr('class', 'error-container')
        .append('div')
        .attr('class', 'error-container__message')
        .append('p')
        .html(message);
}

module.exports = CSVBuilder;
