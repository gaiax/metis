import { generateHtml, checkSpecialLine } from '../generator/generator'
test('specialLine # test => true', () => {
  expect(checkSpecialLine('# test')).toBe(true)
})

const md = '# test\n\
testtest  \n\
TESTTEST\n\
AAAAAAAA  \n\
BBBBBBBB\n'
const corectHtml =
  '<link rel="stylesheet" href="http://yandex.st/highlightjs/8.0/styles/default.min.css"><script src="http://yandex.st/highlightjs/8.0/highlight.min.js"></script><main><h1 id="test">test</h1>\n\
<p>testtest<br>TESTTESTAAAAAAAA<br>BBBBBBBB</p>\n</main>\n'
test('generateHtml', () => {
  expect(generateHtml(md)).toBe(corectHtml)
})
