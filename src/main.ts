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

      process.stdout.write(res.toString())
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
