import {parseIssueNumber} from './helpers/issueNumberParser'
import {Context} from '@actions/github/lib/context'
import {GitHub} from '@actions/github/lib/utils'

export async function handle(
  octokit: InstanceType<typeof GitHub>,
  context: Context
): Promise<void> {
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
}
