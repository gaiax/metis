/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import path from 'path'
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import MenuBuilder from './menu'
import { writeFileSync } from 'fs'
import Store from 'electron-store'
import { ConfigSchema } from './types/ConfigSchema'
import { exportPdf } from './generator/generator'

const store = new Store<ConfigSchema>()

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info'
    autoUpdater.logger = log
    autoUpdater.checkForUpdatesAndNotify()
  }
}

let mainWindow: BrowserWindow

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')()
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS']

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log)
}

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions()
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets')

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths)
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
  })

  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  mainWindow.on('closed', () => {})

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater()
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.whenReady().then(createWindow).catch(console.log)

const setConfigStoreDeafults = () => {
  const keys: (keyof ConfigSchema)[] = [
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
  ]

  for (const key of keys) {
    if (typeof store.get(key) === 'undefined') {
      store.set(key, '')
    }
  }
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

ipcMain.handle('set-config', (_, data: ConfigSchema) => {
  for (const [key, value] of Object.entries(data)) {
    store.set(key, value)
  }
})

const createConfigObject = () => {
  const config: ConfigSchema = {
    title: store.get('title'),
    publishDate: store.get('publishDate'),
    publisher: store.get('publisher'),
    author: store.get('author'),
    contact: store.get('contact'),
    printShop: store.get('printShop'),
    version: store.get('version'),
    frontCover: store.get('frontCover'),
    backCover: store.get('backCover'),
    isdn: store.get('isdn'),
  }

  return config
}

ipcMain.handle('request-config', (event) => {
  event.sender.send('update-config', createConfigObject())
})

ipcMain.handle('request-update-front-cover', (event) => {
  if (!subWindow) {
    return
  }

  const path = dialog.showOpenDialogSync(subWindow, {
    defaultPath: store.get('frontCover') || '.',
    buttonLabel: '??????',
    filters: [{ name: 'Image files', extensions: ['png', 'jpg', 'gif'] }],
    properties: ['openFile'],
  })

  if (!path) {
    return { status: undefined }
  }

  store.set('frontCover', path[0])

  event.sender.send('update-config', createConfigObject())
})

ipcMain.handle('request-update-back-cover', (event) => {
  if (!subWindow) {
    return
  }

  const path = dialog.showOpenDialogSync(subWindow, {
    defaultPath: store.get('backCover') || '.',
    buttonLabel: '??????',
    filters: [{ name: 'Image files', extensions: ['png', 'jpg', 'gif'] }],
    properties: ['openFile'],
  })

  if (!path) {
    return { status: undefined }
  }

  store.set('backCover', path[0])

  event.sender.send('update-config', createConfigObject())
})

/**
 * [IPC] ?????????????????????????????????
 */
ipcMain.handle('file-save-as', async (event, data) => {
  // ?????????????????????????????????
  const path = dialog.showSaveDialogSync(mainWindow, {
    defaultPath: 'book.md',
    buttonLabel: '??????', // ?????????????????????
    filters: [
      { name: 'Markdown files', extensions: ['md'] },
      { name: 'Text files', extensions: ['txt'] },
    ],
    properties: [
      'createDirectory', // ???????????????????????????????????? (macOS)
    ],
  })
  // ?????????????????????????????????
  if (path === undefined) {
    return { status: undefined }
  }

  // ??????????????????????????????
  try {
    writeFileSync(path, data.text)
    mainWindow.webContents.send('set-filename', path)

    return {
      status: true,
      path: path,
    }
  } catch (error) {
    return { status: false, message: error.message }
  }
})

/**
 * [IPC] ??????????????????????????????????????????
 */
ipcMain.handle('file-save', async (event, data) => {
  // ??????????????????????????????
  try {
    writeFileSync(data.path, data.text)
    mainWindow.webContents.send('set-filename', path)

    return {
      status: true,
      path: path,
    }
  } catch (error) {
    return { status: false, message: error.message }
  }
})

ipcMain.handle('export-pdf', async (event, data) => {
  const path = dialog.showSaveDialogSync(mainWindow, {
    defaultPath: 'output.pdf',
    buttonLabel: '????????????', // ?????????????????????
    filters: [{ name: 'Markdown files', extensions: ['pdf'] }],
    properties: [
      'createDirectory', // ???????????????????????????????????? (macOS)
    ],
  })

  if (path === undefined) {
    return { status: undefined }
  }
  try {
    exportPdf(data.text, path)
    return {
      status: true,
      path: path,
    }
  } catch (error) {
    return { status: false, message: error.message }
  }
})

let subWindow: BrowserWindow | undefined
export const openSubWindow = () => {
  if (typeof subWindow !== 'undefined') {
    subWindow.focus()
    return
  }

  setConfigStoreDeafults()

  subWindow = new BrowserWindow({
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: true,
    },
  })
  subWindow.loadURL(`file://${__dirname}/index.html#/config`)
  subWindow.on('closed', () => (subWindow = undefined))
}
