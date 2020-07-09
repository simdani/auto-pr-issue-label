import {parseIssueNumber} from '../src/helpers/issueNumberParser'

test('test github issue parsing', async () => {
  const description = 'fixes https://github.com/test/test-auto-pr/issues/1 and stuff'
  expect(parseIssueNumber('test', 'test-auto-pr', description)).toEqual('1')
})
