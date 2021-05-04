/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'date-fns'
import DateFnsUtils from '@date-io/date-fns'
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
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers'

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

    const onStartExportPdf = async () => {
      await ipcRenderer.invoke('export-pdf', {
        text: value,
      })
    }

    ipcRenderer.on('start-file-save-as', onStartFileSave)

    ipcRenderer.on('start-export-pdf', onStartExportPdf)

    return () => {
      ipcRenderer.removeListener('start-file-save-as', onStartFileSave)
      ipcRenderer.removeListener('start-export-pdf', onStartExportPdf)
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
  const [config, setConfig] = useState<ConfigSchema>()

  const [publishDate, setPublishDate] = useState<Date | null>(new Date())
  const [keys] = useState<(keyof ConfigSchema)[]>([
    'author',
    'backCover',
    'contact',
    'frontCover',
    'isdn',
    'printShop',
    'publishDate',
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

  const requestUpdateFrontCover = () => {
    ipcRenderer.invoke('request-update-front-cover')
  }

  const requestUpdateBackCover = () => {
    ipcRenderer.invoke('request-update-back-cover')
  }

  useEffect(() => {
    setItem('publishDate', publishDate?.toISOString() ?? '')
  }, [publishDate])

  useEffect(() => {
    const onUpdateConfig = async (_, config: ConfigSchema) => {
      setConfig(config)
      if (config.publishDate !== '') {
        setPublishDate(new Date(config.publishDate))
      }
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
    <div className="config-container">
      <h1>Preference</h1>
      {!config ? (
        <div>Loading...</div>
      ) : (
        <Card>
          <CardContent>
            <div className="config-item">
              <TextField
                label="Title"
                value={config.title}
                onChange={({ target: { value } }) => setItem('title', value)}
                fullWidth
                variant="outlined"
              />
            </div>
            <div className="config-item">
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  disableToolbar
                  variant="inline"
                  margin="normal"
                  label="Publish date"
                  value={publishDate}
                  onChange={(date) => setPublishDate(date)}
                  fullWidth
                />
              </MuiPickersUtilsProvider>
            </div>
            <div className="config-item">
              <TextField
                label="Author"
                value={config.author}
                onChange={({ target: { value } }) => setItem('author', value)}
                fullWidth
                variant="outlined"
              />
            </div>
            <div className="config-item">
              <TextField
                label="Contact"
                value={config.contact}
                onChange={({ target: { value } }) => setItem('contact', value)}
                fullWidth
                variant="outlined"
              />
            </div>
            <div className="config-item">
              <TextField
                label="Print shop"
                value={config.printShop}
                onChange={({ target: { value } }) =>
                  setItem('printShop', value)
                }
                fullWidth
                variant="outlined"
              />
            </div>
            <div className="config-item">
              <TextField
                label="Version"
                value={config.version}
                onChange={({ target: { value } }) => setItem('version', value)}
                fullWidth
                variant="outlined"
              />
            </div>
            <div className="config-item">
              <TextField
                label="ISDN"
                value={config.isdn}
                onChange={({ target: { value } }) => setItem('isdn', value)}
                fullWidth
                variant="outlined"
              />
            </div>
            <Button onClick={save} color="primary" variant="contained">
              save
            </Button>
            <div className="config-item">
              <label htmlFor="front-cover">Front cover image</label>
              <img
                id="front-cover"
                className="cover-image"
                src={config.frontCover}
                onClick={requestUpdateFrontCover}
              />
            </div>
            <div className="config-item">
              <label htmlFor="back-cover">Back cover image</label>
              <img
                id="back-cover"
                className="cover-image"
                src={config.backCover}
                onClick={requestUpdateBackCover}
              />
            </div>
          </CardContent>
        </Card>
      )}
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
