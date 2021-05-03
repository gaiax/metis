import React, { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import 'codemirror/theme/material.css'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import './App.global.css'
import { ipcRenderer } from 'electron'

const Hello = () => {
  const [value, setValue] = useState('<h1>I ♥ react-codemirror2</h1>')

  ipcRenderer.on('start-file-save', async (_event, _arg) => {
    const retval = await ipcRenderer.invoke('file-save', {
      text: value,
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
      onChange={(_editor, _data, value) => {
        setValue(value)
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
