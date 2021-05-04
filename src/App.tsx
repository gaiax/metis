import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import 'codemirror/theme/material.css'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import './App.global.css'
import { ipcRenderer } from 'electron'
import { MarkdownPreview } from './component/MarkdownPreview'

const Hello = () => {
  const [filename, setFilename] = useState<string | null>(null)
  const [initialValue, setInitialValue] = useState(
    '<h1>I ♥ react-codemirror2</h1>'
  )
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    const onStartFileSave = async () => {
      await ipcRenderer.invoke('file-save-as', {
        text: value,
      })
    }

    ipcRenderer.on('start-file-save-as', onStartFileSave)

    return () => {
      ipcRenderer.removeListener('start-file-save-as', onStartFileSave)
    }
  }, [value])

  useEffect(() => {
    const onSetFilename = async () => {
      if (filename === null) {
        await ipcRenderer.invoke('file-save-as', {
          text: value,
        })
      } else {
        await ipcRenderer.invoke('file-save', {
          path: filename,
          text: value,
        })
      }
    }

    ipcRenderer.on('start-file-save', onSetFilename)

    return () => {
      ipcRenderer.removeListener('start-file-save', onSetFilename)
    }
  }, [filename, value])

  ipcRenderer.on('file-open', async (_event, value) => {
    setInitialValue(value)
  })

  ipcRenderer.on('set-filename', async (_event, filename) => {
    setFilename(filename)
  })
  const halfStyle = {
    width: '50%',
  }
  return (
    <div style={{ display: 'flex' }}>
      <div style={halfStyle}>
        <CodeMirror
          value={initialValue}
          options={{
            mode: 'markdown',
            theme: 'material',
            lineNumbers: true,
          }}
          onChange={(_editor, _data, newValue) => {
            setValue(newValue)
          }}
        />
      </div>

      <div style={halfStyle}>
        <MarkdownPreview md={value} />
      </div>
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
