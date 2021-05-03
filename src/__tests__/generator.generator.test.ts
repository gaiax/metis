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
  '<h1 id="test">test</h1>\n\
<p>testtest<br>TESTTESTAAAAAAAA<br>BBBBBBBB</p>\n'
test('generateHtml', () => {
  expect(generateHtml(md)).toBe(corectHtml)
})
