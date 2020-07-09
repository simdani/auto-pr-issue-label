import * as core from '@actions/core'
import * as github from '@actions/github'

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

      const leftParaIndex = res.data.title.indexOf('(')
      const rightParaIndex = res.data.title.indexOf(')')
      const linkIssueStr = res.data.title.substring(
        Number(leftParaIndex) + 2,
        rightParaIndex
      )
      const linkIssueNumber = +linkIssueStr

      process.stdout.write(linkIssueNumber.toString())
      process.stdout.write(res.data.title)
      process.stdout.write(res.data.body)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
