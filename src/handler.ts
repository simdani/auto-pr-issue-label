import {Context} from '@actions/github/lib/context'
import {GitHub} from '@actions/github/lib/utils'
import {PullRequest} from './github/pull_request'
import {Issue} from './github/issue'

export async function handle(
  octokit: InstanceType<typeof GitHub>,
  context: Context
): Promise<void> {
  if (context.issue.number === undefined) {
    return
  }
  const pr = new PullRequest(octokit, context)
  const issue = new Issue(octokit, context)

  const inReviewLabel = 'In-Review'
  const resolvedTestItLabel = 'Resolved (test it)'

  const linkedIssueToPRNumber = await issue.getLinkedIssueToPrNumber()

  if (!linkedIssueToPRNumber) {
    return
  }

  if (pr.isMerged()) {
    const containsInReviewLabel = issue.containsGivenLabel(linkedIssueToPRNumber, inReviewLabel)

    if (containsInReviewLabel) {
      await issue.removeLabel(linkedIssueToPRNumber, inReviewLabel)
    }

    const containsResolvedTestItLabel = issue.containsGivenLabel(
      linkedIssueToPRNumber,
      resolvedTestItLabel
    )
    if (!containsResolvedTestItLabel) {
      await issue.addLabel(linkedIssueToPRNumber, resolvedTestItLabel)
    }
  } else {
    const containsInReviewLabel = issue.containsGivenLabel(linkedIssueToPRNumber, inReviewLabel)
    if (!containsInReviewLabel) {
      await issue.addLabel(linkedIssueToPRNumber, inReviewLabel)
    }
  }
}
