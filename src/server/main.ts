import path from 'path'
import { app, BrowserWindow } from 'electron'
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer'

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  mainWindow.loadFile('dist/index.html')
}

app.whenReady().then(async () => {
  if (process.env.NODE_ENV === 'development') {
    // await installExtension([REACT_DEVELOPER_TOOLS], {
    //   forceDownload: true,
    // })
    // .then((name) => console.log(`Added Extension:  ${name}`))
    // .catch((err) => console.log('An error occurred: ', err))

    // hot reload
    require('electron-reload')(__dirname, {
      electron: path.join(
        __dirname,
        '..',
        '..',
        'node_modules',
        '.bin',
        'electron'
      ),
      forceHardReset: true,
      hardResetMethod: 'exit',
    })
  }

  createWindow()
})

app.once('window-all-closed', () => app.quit())
