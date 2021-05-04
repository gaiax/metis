import marked from 'marked'
import highlightjs from 'highlightjs'
import ejs from 'ejs'
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
    padding: <%= mt %> <%= mrl %> <%= mb %> <%= mrl %>;\n\
    border: solid;\n\
    border-color: black;\n\
    width: 172mm;\n\
    height: 251mm;\n\
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
