import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import 'codemirror/theme/material.css'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import './App.global.css'

const Hello = () => {
  return (
    <div className="container">
      <div className="editor">
        <CodeMirror
          value="<h1>I ♥ react-codemirror2</h1>"
          options={{
            mode: 'markdown',
            theme: 'material',
            lineNumbers: true,
          }}
        />
      </div>
      <div className="preview"></div>
    </div>
  )
}

export default function App(): React.ReactElement {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  )
}
