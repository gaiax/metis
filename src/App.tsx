import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import 'codemirror/theme/material.css'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import './App.global.css'
import { ipcRenderer } from 'electron'

const Hello = () => {
  const [value, setValue] = useState('<h1>I ♥ react-codemirror2</h1>')

  useEffect(() => {
    const onStartFileSave = async () => {
      await ipcRenderer.invoke('file-save', {
        text: value,
      })
    }

    ipcRenderer.on('start-file-save', onStartFileSave)

    return () => {
      ipcRenderer.removeListener('start-file-save', onStartFileSave)
    }
  }, [value])

  return (
    <CodeMirror
      value={value}
      options={{
        mode: 'markdown',
        theme: 'material',
        lineNumbers: true,
      }}
      onChange={(_editor, _data, newValue) => {
        setValue(newValue)
      }}
    />
  )
}

export default function App(): React.ReactElement {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
        <Route path="/config" component={Hello} />
      </Switch>
    </Router>
  )
}
