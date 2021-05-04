/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from 'react'
import { Switch, Route, HashRouter } from 'react-router-dom'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import './App.global.css'
import { ipcRenderer } from 'electron'
import { ConfigSchema } from './types/ConfigSchema'
import { Button, Card, CardContent, TextField } from '@material-ui/core'
import { MarkdownPreview } from './component/MarkdownPreview'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/lint/javascript-lint'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/hint/javascript-hint'

// @ts-ignore
import createValidator from 'codemirror-textlint'
// @ts-ignore
import noTodo from 'textlint-rule-no-todo'
// @ts-ignore
import rulePrh from 'textlint-rule-prh'

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
  const validator = createValidator({
    rules: {
      'no-todo': noTodo,
      prh: rulePrh,
    },
    rulesConfig: {
      prh: { rulePaths: ['./prh-rules/WEB+DB_PRESS.yml'] },
    },
  })
  return (
    <div style={{ display: 'flex' }}>
      <div style={halfStyle}>
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
      </div>

      <div style={halfStyle}>
        <MarkdownPreview md={value} />
      </div>
    </div>
  )
}

const ConfigForm = () => {
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<ConfigSchema>()

  const [keys] = useState<(keyof ConfigSchema)[]>([
    'author',
    'backCover',
    'contact',
    'frontCover',
    'isdn',
    'printShop',
    'publishedAt',
    'publisher',
    'title',
    'version',
  ])

  const setItem = <K extends keyof ConfigSchema>(
    key: K,
    value: ConfigSchema[K]
  ) => {
    setConfig((config) => {
      if (!config) {
        return config
      }

      return {
        ...config,
        [key]: value,
      }
    })
  }

  useEffect(() => {
    const onUpdateConfig = async (_, config: ConfigSchema) => {
      setLoading(false)
      setConfig(config)
    }

    ipcRenderer.on('update-config', onUpdateConfig)

    ipcRenderer.invoke('request-config')

    return () => {
      ipcRenderer.removeListener('update-config', onUpdateConfig)
    }
  }, [])

  const save = () => {
    ipcRenderer.invoke('set-config', config)
  }

  return (
    <>
      <h1>Preference</h1>
      {!config ? (
        <div>Loading...</div>
      ) : (
        <Card>
          <CardContent>
            {keys.map((key) => (
              <TextField
                key={key}
                label={key}
                value={config[key]}
                onChange={({ target: { value } }) => setItem(key, value)}
                variant="outlined"
              />
            ))}
            <Button onClick={save}>save</Button>
          </CardContent>
        </Card>
      )}
    </>
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
