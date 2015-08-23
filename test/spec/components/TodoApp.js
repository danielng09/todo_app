'use strict';

describe('TodoApp', () => {
  let React = require('react/addons');
  let TodoApp, component;

  beforeEach(() => {
    let container = document.createElement('div');
    container.id = 'content';
    document.body.appendChild(container);

    TodoApp = require('components/TodoApp.js');
    component = React.createElement(TodoApp);
  });

  it('should create a new instance of TodoApp', () => {
    expect(component).toBeDefined();
  });
});
