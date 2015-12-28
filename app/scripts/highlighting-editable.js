var _ = require('lodash');
var React = require('react');
var ReactDOM = require('react-dom');
var hljs = require('highlight.js');

var HighlightingEditable = React.createClass({
  displayName: 'HighlightingEditable',

  propTypes: {
    file: React.PropTypes.shape({
      name: React.PropTypes.string,
      contents: React.PropTypes.string
    }).isRequired
  },

  componentDidMount: function() {
    this.highlightCode();
  },

  componentDidUpdate: function() {
    this.highlightCode();
  },

  highlightCode: function highlightCode() {
    var domNode = ReactDOM.findDOMNode(this);
    var nodes = domNode.querySelectorAll('pre code');

    _.each(nodes, hljs.highlightBlock);
  },

  render: function render() {
    var file = this.props.file;
    var extension = file.name.split('.').pop();

    return (
      <pre>
        <code className={extension}>
          {file.contents}
        </code>
      </pre>
    );
  },
});

module.exports = HighlightingEditable;
