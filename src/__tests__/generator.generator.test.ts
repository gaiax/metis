import { generateHtml, checkSpecialLine } from '../generator/generator'
const md = '# test\n\
testtest  \n\
TESTTEST\n\
AAAAAAAA  \n\
BBBBBBBB\n'
const corectHtml =
  '<h1>test</h1>\n\
<p>testtest</p>\n\
<p>TESTTESTAAAAAAAA</p>\n\
<p>BBBBBBBB</p>\n'
test('generateHtml', () => {
  expect(generateHtml(md)).toBe(corectHtml)
})
