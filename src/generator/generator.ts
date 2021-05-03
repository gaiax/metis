import marked from 'marked'
import highlightjs from 'highlightjs'
import jq from 'jquery'
import { JSDOM } from 'jsdom'
marked.setOptions({
  highlight: function (code) {
    return highlightjs.highlightAuto(code).value
  },
})

export const generateHtml: generateHtmlType = (md: string) => {
  md = formatMD(md)
  const html = marked(md)
  //あとでここに分割したり、いろいろ書く！
  return html
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
  (md: string): string
}
