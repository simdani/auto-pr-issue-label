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

      // process.stdout.write(issueNumberFromBody)
      // process.stdout.write(res.data.title)
      // process.stdout.write(res.data.body)

      const responseLabels = await octokit.issues.listLabelsForRepo({
        owner: context.repo.repo,
        repo: context.repo.repo
      })

      if (Number(issueNumberFromBody)) {
        const resolvedTestItLabel = 'Resolved (test it)'
        const resolvedTestIt = responseLabels.data.find(
          l => l.name === resolvedTestItLabel
        )

        if (resolvedTestIt === undefined) {
          await octokit.issues.createLabel({
            owner: context.repo.owner,
            repo: context.repo.repo,
            name: resolvedTestItLabel,
            description: 'resolved and test it',
            color: '#000000'
          })
        }
        await octokit.issues.addLabels({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: Number(issueNumberFromBody),
          labels: [resolvedTestItLabel]
        })
        return
      } else {
        // issue not found
        return
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
