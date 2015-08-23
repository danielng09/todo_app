'use strict';

var React = require('react/addons');
var Firebase = require('firebase');

const firebaseURL = 'todo-ap.firebaseIO.com';
// CSS
require('normalize.css');
require('../styles/main.css');


var ListItem = React.createClass({
  render: function() {
    var item = this.props.item;
    var textStyle = {};
    if (item.completed) {
      textStyle = {textDecoration: 'line-through'};
    }

    return (
      <div>
        <input
          type='checkbox'
          onChange={this.props.handleCheck.bind(null, item.id)} />
        <span style={textStyle}>
          {item.text}
        </span>
        <button
          className={'btn btn-xs btn-default'}
          onClick={this.props.handleDelete.bind(null, item.id)}>
            <span className={"glyphicon glyphicon-remove"}/>
        </button>
      </div>
    );
  }
});

var List = React.createClass({
  displayItems: function(item) {
    return (
      <section>
        <ListItem
          item={item}
          key={item.id}
          handleDelete={this.props.handleDelete}
          handleCheck={this.props.handleCheck} />
      </section>
    );
  },

  render: function() {
    return (
      <div>
        {this.props.items.map(this.displayItems)}
      </div>
    );
  }
});

var App = React.createClass({
  componentWillMount: function() {
    this.firebase = new Firebase(firebaseURL)
    this.firebase.on('value', function(data) {
        var obj = data.val();
        if (!obj) {
          return;
        }

        var items = [];
        for (var id in obj) {
          var item = obj[id]
          item.id = id;
          items.push(item)
        }

        this.setState({ items: items });
    }.bind(this))
  },

  getInitialState: function() {
    return {
      items: []
    };
  },

  handleCheck: function(id) {
    var _items = this.state.items;
    var item = _items.filter(function(ele) { return ele.id === id; })[0];
    item.completed = !item.completed;
    this.firebase.child(id).update({ completed: item.completed })
    this.setState({ items: _items });
  },

  handleDelete: function(id) {
    this.firebase.child(id).remove();
    var updatedItems = this.state.items.filter(function(item) { return item.id !== id; });
    this.setState({ items: updatedItems });
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var text = this.refs.itemTextInput.getDOMNode().value;
    var newItem = {text: text, completed: false};

    var id = this.firebase.push(newItem).key();
    newItem.id = id;

    this.state.items.push(newItem);
    this.setState({ items: this.state.items });
    this.refs.itemTextInput.getDOMNode().value = '';
  },

  render: function() {

    return (
      <div>
        <h1>Todos</h1>
        <form onSubmit={this.handleSubmit}>
          <input
            placeholder="Add an item"
            ref="itemTextInput"
            type='text'
          />
        </form>

        <List
          items={this.state.items}
          handleDelete={this.handleDelete}
          handleCheck={this.handleCheck} />

        <button
          className={'btn btn-xs btn-default'}>
          All
        </button>
        <button
          className={'btn btn-xs btn-default'}>
          Active
        </button>
        <button
          className={'btn btn-xs btn-default'}>
          Completed
        </button>
      </div>
    );
  }
});

React.render(<App />, document.getElementById('todoapp')); // jshint ignore:line

module.exports = App;
