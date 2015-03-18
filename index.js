'use strict';

var po2json = require('po2json');
var path    = require('path');
var through = require('through2');
var _       = require('underscore')
var gutil   = require('gulp-util');
var PluginError = gutil.PluginError;
var File        = gutil.File;

module.exports = function(filename, options) {
  options = options || {}

  if (!filename) {
    throw new PluginError('gulp-po2json', 'Missing file name option for gulp-po2json');
  }

  options.stringify = false;

  var combinedFile;
  var combinedJson = {};

  function convertPoToJson(file, encoding, callback) {
    if (!combinedFile) {
      combinedFile = new File({
        path: path.join(file.base, filename),
        base: file.base,
        cwd: file.cwd
      });
    }

    var domainName = path.basename(file.path, path.extname(file.path));
    var domainData = po2json.parse(file.contents, _.extend(options, { domain: domainName }));

    combinedJson[domainName] = domainData.locale_data[domainName];

    callback();
  }

  function flush(callback) {
    var contents = JSON.stringify(combinedJson, null, options.pretty ? '   ' : null);

    combinedFile.contents = new Buffer(contents)

    this.push(combinedFile);

    callback();
  }

  return through.obj(convertPoToJson, flush);
};