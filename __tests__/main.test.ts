import {parseIssueNumber} from '../src/helpers/issue_number_parser'

test('test github issue parsing', async () => {
  const description = 'fixes https://github.com/test/test-auto-pr/issues/101 and stuff'
  expect(parseIssueNumber('test', 'test-auto-pr', description)).toEqual('101')
})

test('test direct github issue parsing', async () => {
  const description = 'fixes #3 testing test.'
  expect(parseIssueNumber('test', 'test-auto-pr', description)).toEqual('3')
})
