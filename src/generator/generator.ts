import marked from 'marked'
import highlightjs from 'highlightjs'
import ejs from 'ejs'
import pdf, { CreateOptions } from 'html-pdf'
import Store from 'electron-store'
import { ConfigSchema } from '../types/ConfigSchema'

const store = new Store<ConfigSchema>()

marked.setOptions({
  highlight: function (code) {
    return highlightjs.highlightAuto(code).value
  },
})

export const generateHtml: generateHtmlType = (
  md: string,
  option: generateHtmlOptionType
) => {
  const mds = md.split('---')
  let html =
    '<link rel="stylesheet" href="http://yandex.st/highlightjs/8.0/styles/default.min.css">\n'
  html += generatePageStyle(option)
  mds.forEach((m) => {
    html += '<div class="page">\n'
    html += marked(m)
    html += '\n</div>\n'
  })
  console.log(html)
  return html
}
const generatePageStyle = (option: generateHtmlOptionType) => {
  const styleTemp =
    '\
  <style>\n\
  .page{\n\
    padding: <%= mt %>mm <%= mrl %>mm <%= mb %>mm <%= mrl %>mm;\n\
    border: solid;\n\
    border-color: black;\n\
    width: 182mm;\n\
    height: 257mm;\n\
  }\n\
  </style>\n'
  return ejs.render(styleTemp, {
    mt: option.marginTop,
    mrl: option.marginRightLeft,
    mb: option.marginBottom,
  })
}

export type generateHtmlType = {
  (md: string, option: generateHtmlOptionType): string
}

export type generateHtmlOptionType = {
  marginTop: number
  marginBottom: number
  marginRightLeft: number
  contents: content[] | undefined
}
export type content = {
  kind: 'img' | 'text' | 'page-number'
  position: vector2
  value: string | undefined
}
export type vector2 = {
  x: number
  y: number
}

export const generateImprintHtml = () => {
  const keys: Array<[string, string]> = [
    ['author', '著者'],
    ['contact', '連絡先'],
    ['isdn', 'ISDN'],
    ['printShop', '印刷所'],
    ['publishedAt', '発行日'],
    ['publisher', '発行元'],
    ['title', 'タイトル'],
    ['version', '版'],
  ]
  let generateHtml = ''

  for (const key of keys) {
    generateHtml += `<p>${key[1]}: ${store.get(key[0])} </p>\n`
  }

  return generateHtml
}

export const exportPdf = (md: string, path: string) => {
  const generateHtmlOption: generateHtmlOptionType = {
    marginTop: 10,
    marginRightLeft: 10,
    marginBottom: 10,
    contents: [],
  }
  const options: CreateOptions = { height: '257mm', width: '182mm' }
  const html = generateHtml(md, generateHtmlOption) + generateImprintHtml()
  pdf.create(html, options).toFile(path, function (err, res) {
    if (err) return console.log(err)
    console.log(res)
  })
}
