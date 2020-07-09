import * as core from '@actions/core'
import * as github from '@actions/github'
import {parseIssueNumber} from './helpers/issueNumberParser'

// import * as handler from './handler'

export async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token')
    const octokit = github.getOctokit(token)

    process.stdout.write('auto pr issue label has started...')

    const context = github.context
    if (context.issue.number === undefined) {
      return
    }

    const inReviewLabel = 'In-Review'
    const resolvedTestItLabel = 'Resolved (test it)'

    const owner = context.repo.owner
    const repo = context.repo.repo

    const issue = await octokit.issues.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number
    })

    const issueNumberFromBody = parseIssueNumber(owner, repo, issue.data.body)

    process.stdout.write(issueNumberFromBody)

    if (!Number(issueNumberFromBody)) {
      return
    }

    //   const responseLabels = await octokit.issues.listLabelsForRepo({
    //     owner: owner,
    //     repo: repo
    //   })

    const isMerged = context.payload.pull_request && context.payload.pull_request['merged']

    const issueLabelsResponse = await octokit.issues.listLabelsOnIssue({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: Number(issueNumberFromBody)
    })

    if (isMerged) {
      const issueLabel = issueLabelsResponse.data.find(
        (l: {name: string}) => l.name === inReviewLabel
      )

      if (issueLabel !== undefined) {
        await octokit.issues.removeLabel({
          owner: owner,
          repo: repo,
          issue_number: Number(issueNumberFromBody),
          name: inReviewLabel
        })
      }

      const resolvedTestIt = issueLabelsResponse.data.find(
        (l: {name: string}) => l.name === resolvedTestItLabel
      )

      if (resolvedTestIt === undefined) {
        await octokit.issues.addLabels({
          owner: owner,
          repo: repo,
          issue_number: Number(issueNumberFromBody),
          labels: [resolvedTestItLabel]
        })
      }
    } else {
      const issueLabel = issueLabelsResponse.data.find(
        (l: {name: string}) => l.name === inReviewLabel
      )
      if (issueLabel === undefined) {
        await octokit.issues.addLabels({
          owner: owner,
          repo: repo,
          issue_number: Number(issueNumberFromBody),
          labels: [inReviewLabel]
        })
      }
    }

    // await handler.handle(octokit, github.context)
  } catch (error) {
    core.setFailed(error.message)
  }
}
