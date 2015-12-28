var _ = require("lodash");
var JSZip = require("JSZip");
var Highlight = require('react-highlight');
var React = window.React = require('react');
var ReactDOM = require("react-dom");
var update = require('react-addons-update');

var mountNode = document.getElementById("app");

// TODO move constants into separate file
var CSS_BASE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.9.1/styles/';
var THEMES = [
  'default',
  'color-brewer',
  'github',
  'monokai',
  'mono-blue',
  'railscasts',
  'solarized',
  'tomorrow',
  'zenburn'
];
// TODO [Tomas, 12-27-2015] : Make this accept drag and drops (http://www.html5rocks.com/en/tutorials/file/dndfiles/)

var App = React.createClass({
  getInitialState: function () {
    return {
      files: [{
        name: 'Example.js',
        contents:
          "function welcome() {\n" +
          "  // To syntax highlight your code: \n" +
          "  //   1. Click select files top left, and select the file(s) to upload (or a single zip file) \n" +
          "  //   2. (optional) Select a color scheme on the top right \n" +
          "  //   3. (optional) Print the page (or save to PDF) \n" +
          "  console.log('Hello, World!');\n" +
          "  return;\n" +
          "}\n"
      }],
      theme: 'default'
    }
  },

  waitOns: [],

  _addNameWithContents: function (name, contents) {
    this.setState({
      'files': update(this.state.files, {
        $push: [{
          'name': name,
          'contents': contents
        }]
      })
    });
  },

  addFileWithName: function (name) {
    var _this = this;
    return function (evt) {
      _this._addNameWithContents(name, evt.target.result);
    };
  },

  addZipFileWithName: function (name) {
    var _this = this;
    return function (evt) {
      var zip = JSZip(evt.target.result);
      _.each(zip.files, function (zipEntry) {
        _this._addNameWithContents(zipEntry.name, zipEntry.asText());
      });
    };
  },

  handleSubmit: function (evt) {
    evt.preventDefault()

    // drop previous files
    _.each(this.waitOns, function (waitOn) {
      if (waitOn.readyState != FileReader.DONE) {
        waitOn.abort();
      }
    })
    this.waitOns = [];
    this.setState({'files': []});

    // load the new file(s)
    var raw_files = this.refs['fileField'].files;
    var real_files = []
    if (raw_files.length == 1 && raw_files[0].name.length > 4 && raw_files[0].name.slice(-4).toLowerCase() == '.zip') {
      // zip file
      var reader = new FileReader();
      reader.onload = this.addZipFileWithName(raw_files[0].name);
      reader.readAsArrayBuffer(raw_files[0]);
      this.waitOns.push(reader);
    } else {
      // regular files
      var _this = this;
      _.each(raw_files, function (raw_file) {
        var reader = new FileReader();
        reader.onload = _this.addFileWithName(raw_file.name);
        reader.readAsText(raw_file);
        _this.waitOns.push(reader);
      });
    }

    this.setState({
      'files': real_files
    })
  },

  _onSelectTheme: function(newTheme) {
    this.setState({
      theme: newTheme.target.value
    });
  },

  _renderColorCodedFile: function(file, index) {
    var extension = file.name.split('.').pop();

    return (
      <div className="fileBox" key={index}>
        <div className="fileName">
          {file.name}
        </div>
        <div className="fileContents">
          <Highlight className={extension}>
            {file.contents}
          </Highlight>
        </div>
      </div>
    );
  },

  // TODO [Tomas, 12-27-2015] : Make this prettier
  render: function() {
    var colorCodedFiles = _.map(this.state.files, this._renderColorCodedFile);

    return (
      <div>
        <div dangerouslySetInnerHTML={ {__html:
        // Hack to embed the stylesheet theme in the DOM
          '<link rel="stylesheet" href="'+ CSS_BASE_URL + this.state.theme + '.min.css" >'
        } } />
        <div className='nav'>
          <form onSubmit={this.handleSubmit}>
            <div className="left">
              Files (or .zip):
              <input type="file" className='navFiles' id="files" ref="fileField" onChange={this.handleSubmit} multiple />
              <input type="submit" value="Syntax Highlight Files"/>
            </div>

            <div className="right">
              Color Scheme:
              <select
                className='navSelect'
                onChange={this._onSelectTheme}
                value={this.state.theme}>
                {THEMES.map(function(theme, index) {
                  return <option key={index} value={theme}>{theme}</option>;
                })}
              </select>
            </div>
          </form>
        </div>

        <div className='contents'>
          {colorCodedFiles}
        </div>

        <div className='footer'>
          <hr />
          Made with &#10084; by <a href="https://twitter.com/tomasreimers" target="_blank">@tomasreimers</a> &amp; <a href="https://twitter.com/zurawiki" target="_blank">@zurawiki</a>
        </div>
      </div>
    );
  }
});


ReactDOM.render(<App />, mountNode);
