import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import 'codemirror/theme/material.css'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import './App.global.css'
import { ipcRenderer } from 'electron'

const Hello = () => {
  ipcRenderer.on('hoge', async (_event, _arg) => {
    alert('message')
    const retval = await ipcRenderer.invoke('file-save', {
      text: 'hello',
    })
  })

  return (
    <CodeMirror
      value="<h1>I ♥ react-codemirror2</h1>"
      options={{
        mode: 'markdown',
        theme: 'material',
        lineNumbers: true,
      }}
    />
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
