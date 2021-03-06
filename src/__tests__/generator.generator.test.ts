import { generateHtml } from '../generator/generator'

const md = '# test\n\
testtest  \n\
TESTTEST\n\
AAAAAAAA  \n\
---\n\
BBBBBBBB\n'
const corectHtml =
  '<link rel="stylesheet" href="http://yandex.st/highlightjs/8.0/styles/default.min.css"><script src="http://yandex.st/highlightjs/8.0/highlight.min.js"></script><main><h1 id="test">test</h1>\n\
<p>testtest<br>TESTTESTAAAAAAAA<br>BBBBBBBB</p>\n</main>\n'
const option = {
  marginTop: 10,
  marginBottom: 10,
  marginRightLeft: 10,
  contents: [],
}
test('generateHtml', () => {
  expect(generateHtml(md, option)).toBe(corectHtml)
})
