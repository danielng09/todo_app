'use strict';

var React = require('react/addons');
var Firebase = require('firebase');

const firebaseURL = 'todo-ap.firebaseIO.com';
// CSS
require('normalize.css');
require('../styles/main.css');

var ListItem = React.createClass({

  getInitialState: function() {
    return (
      { edit: false, text: this.props.item.text }
    );
  },

  handleEdit: function() {
    this.setState({ edit: true });
  },

  handleTextEdit: function(event) {
    var text = event.target.value;
    this.setState({ text: text });
  },

  handleSubmitEdit: function(event) {
    event.preventDefault();
    this.setState({ edit: false });
    this.props.handleSubmitEdit(this.props.item.id, this.state.text);
  },

  render: function() {
    var item = this.props.item;
    var textStyle = {};
    if (item.completed) {
      textStyle = {textDecoration: 'line-through'};
    }

    var viewStyle = {}, editStyle = {};
    if (this.state.edit === true) {
      viewStyle={display: 'none'};
    } else {
      editStyle={display: 'none'};
    }

    return (
      <div>
        <div style={viewStyle}>
          <input
            type='checkbox'
            checked={item.completed}
            onChange={this.props.handleCheck.bind(null, item.id)} />
          <span style={textStyle} onDoubleClick={this.handleEdit}>
            {item.text}
          </span>
          <button
            className={'btn btn-xs btn-default'}
            onClick={this.props.handleDelete.bind(null, item.id)}>
              <span className={"glyphicon glyphicon-remove"}/>
          </button>
        </div>

        <div style={editStyle}>
          <form onSubmit={this.handleSubmitEdit}>
            <input
              type='text'
              ref="itemTextInput"
              value={this.state.text}
              onChange={this.handleTextEdit}/>
          </form>
        </div>
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
          handleCheck={this.props.handleCheck}
          handleSubmitEdit={this.props.handleSubmitEdit}/>
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
      items: [],
      viewType: null,
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

  handleChangeView: function(view) {
    this.setState({ viewType: view });
  },

  handleSubmitEdit: function(id, text) {
    this.firebase.child(id).update({ text: text });
    var items = this.state.items;
    var item = items.filter(function(ele) {
      return ele.id === id;
    })[0];
    item.text = text;
    this.setState({ items: items});
  },

  render: function() {
    var items = this.state.items;
    if (this.state.viewType !== null) {
      items = this.state.items.filter(function(item) {
        return item.completed === this.state.viewType;
      }.bind(this))
    }

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
          items={items}
          handleDelete={this.handleDelete}
          handleCheck={this.handleCheck}
          handleSubmitEdit={this.handleSubmitEdit}/>

        <span>{items.length} items left</span>
        <button
          className={'btn btn-xs btn-default'}
          onClick={this.handleChangeView.bind(null, null)}>
          All
        </button>
        <button
          className={'btn btn-xs btn-default'}
          onClick={this.handleChangeView.bind(null, false)}>
          Active
        </button>
        <button
          className={'btn btn-xs btn-default'}
          onClick={this.handleChangeView.bind(null, true)}>
          Completed
        </button>
      </div>
    );
  }
});

React.render(<App />, document.getElementById('todoapp')); // jshint ignore:line

module.exports = App;
