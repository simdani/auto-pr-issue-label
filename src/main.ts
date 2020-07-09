import * as core from '@actions/core'
import * as github from '@actions/github'
import {parseIssueNumber} from './helpers/issueNumberParser'

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github-token')
    const octokit = github.getOctokit(githubToken)

    const context = github.context

    if (context.issue.number !== undefined) {
      const res = await octokit.issues.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number
      })

      const issueNumberFromBody = parseIssueNumber(
        context.repo.owner,
        context.repo.repo,
        res.data.body
      )

      process.stdout.write(issueNumberFromBody)
      process.stdout.write(res.data.title)
      process.stdout.write(res.data.body)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
