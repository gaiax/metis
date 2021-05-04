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
  md = formatMD(md)
  const mds = md.split('---')
  let html =
    '<link rel="stylesheet" href="http://yandex.st/highlightjs/8.0/styles/default.min.css"><script src="http://yandex.st/highlightjs/8.0/highlight.min.js"></script>\n'
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
const formatMD = (md: string) => {
  //無駄な行を前行に統合
  md = md.replace('\r', '')
  const mds = md.split('\n')
  for (let i = 1; i < mds.length; i++) {
    if (
      !checkSpecialLine(mds[i - 1]) &&
      !checkSpecialLine(mds[i]) &&
      !checkIncludeReturn(mds[i - 1])
    ) {
      mds[i - 1] += mds[i]
      mds.splice(i, 1)
    }
  }
  md = ''
  mds.forEach((m) => {
    md = md + m + '\n'
  })
  return md
}
const checkIncludeReturn: { (target: string): boolean } = (target: string) => {
  //改行する行か確認する
  if (target.length < 2) return false
  if (target.substring(target.length - 2) === '  ') return true
  return false
}

export const checkSpecialLine = (target: string) => {
  // h1やリストなどか確認する
  if (target.length === 0) return false
  const withoutSpaceTarget = target.replace(' ', '').replace('\t', '')
  const checkTag = /^#|^-|^>/g
  if (checkTag.test(withoutSpaceTarget)) return true
  const checkList = /\d. /g
  if (checkList.test(withoutSpaceTarget)) return true
  return false
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
