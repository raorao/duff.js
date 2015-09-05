ReactDSL = {
  h1:    React.DOM.h1,
  label: React.DOM.label,
  textarea: React.DOM.textarea,
  input: React.DOM.input,
  ul:    React.DOM.ul,
  li:    React.DOM.li,
  div:   React.DOM.div,
  pre:   React.DOM.pre,
  span:  React.DOM.span

}

parse = function(jsonString) {
  try {
    return parse(JSON.parse(jsonString))
  }
  catch (e) {
    return jsonString
  }
}

addErrorMarkup = function(errorMessage) {
  return errorMessage.split("").map(function(string) {
    return (this.span)
  })
}


Page = React.createFactory(React.createClass({
  mixins: [ReactDSL],

  getInitialState: function() {
    return { targetObject: null, originalObject: null, ignoreOrder: false }
  },

  handleInput: function(objectType) {
    return function(event) {
      var targetAttributes = {}
      targetAttributes[objectType] = parse(event.target.value)
      this.setState(targetAttributes);
    }.bind(this)
  },

  toggleIgnoreOrder: function() {
    this.setState({ignoreOrder: !this.state.ignoreOrder})
  },

  getErrors: function(originalObject,targetObject, ignoreOrder) {
    var errors = []

    if(typeof originalObject === "string") {
      errors.push("Could not parse original object as valid JSON.")
    }

    if (typeof targetObject === "string") {
      errors.push("Could not parse target object as valid JSON.")
    }

    if (errors.length === 0) {
      errors = Duff.duff(originalObject,targetObject, {ignoreOrder: ignoreOrder}).errors
    }

    return errors
  },

  renderResult: function(message, index) {
    var currentChunkQuoted = false

    renderChunk = function(chunkText, chunkIndex) {
      if(chunkText === '"') {
        currentChunkQuoted = !currentChunkQuoted
        return null
      } else {
        var tagName = currentChunkQuoted ? this.pre : this.span
        return tagName({key: "chunk-" + chunkIndex}, chunkText)
      }
    }

    return (
      this.li({key: "error-" + index},
        message.split(/(")/).map(renderChunk.bind(this))
      )
    )
  },

  renderResults: function() {
    var originalObject = this.state.originalObject;
    var targetObject   = this.state.targetObject;
    var ignoreOrder    = this.state.ignoreOrder;

    var errors = this.getErrors(originalObject, targetObject, ignoreOrder)

    return (
      this.div({className: 'results'},
        this.ul({},
          errors.map(this.renderResult)
        )
      )
    )
  },

  render: function() {
    return (
      this.div({},
        this.h1({}, 'Duff.js'),
        this.label({}, "Original Object"),
        this.textarea({onBlur: this.handleInput('originalObject')}),
        this.label({}, "Target Object"),
        this.textarea({onBlur: this.handleInput('targetObject')}),
        this.label({}, "Ignore Order?"),
        this.input({onChange: this.toggleIgnoreOrder, type: 'checkbox'}),
        this.renderResults()
      )
    )
  }
}));


React.render(Page({}),document.getElementById("page"))