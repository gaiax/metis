/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from 'react'
import { Switch, Route, HashRouter } from 'react-router-dom'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import './App.global.css'
import { ipcRenderer } from 'electron'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/lint/javascript-lint'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/hint/javascript-hint'

// @ts-ignore
import createValidator from 'codemirror-textlint'
// @ts-ignore
import noTodo from 'textlint-rule-no-todo'

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

  const validator = createValidator({
    rules: {
      'no-todo': noTodo,
    },
  })

  return (
    <CodeMirror
      value={initialValue}
      options={{
        mode: 'markdown',
        theme: 'material',
        gutters: ['CodeMirror-lint-markers'],
        lineNumbers: true,
        lint: {
          getAnnotations: validator,
          async: true,
        },
      }}
      onChange={(_editor, _data, newValue) => {
        setValue(newValue)
      }}
    />
  )
}

const ConfigForm = () => {
  const [name, setName] = useState('John')

  return (
    <div>
      <h1>Hello, {name}</h1>
      <input value={name} onChange={(event) => setName(event.target.value)} />
    </div>
  )
}

export default function App(): React.ReactElement {
  return (
    <HashRouter>
      <Switch>
        <Route path="/config" component={ConfigForm} />
        <Route path="/" component={Hello} />
      </Switch>
    </HashRouter>
  )
}
