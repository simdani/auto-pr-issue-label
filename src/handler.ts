import * as core from '@actions/core'
import {Context} from '@actions/github/lib/context'
import {GitHub} from '@actions/github/lib/utils'
import {PullRequest} from './github/pull_request'
import {Issue} from './github/issue'
import {Configuration} from './interfaces/configuration'

export async function handle(
  octokit: InstanceType<typeof GitHub>,
  context: Context,
  configuration: Configuration
): Promise<void> {
  if (context.issue.number === undefined) {
    return
  }
  const pr = new PullRequest(octokit, context)
  const issue = new Issue(octokit, context)

  const linkedIssueToPRNumber = await issue.getLinkedIssueToPrNumber()

  core.info(`Extracting linked issue from PR: ${linkedIssueToPRNumber?.toString() ?? 'not found'}`)

  if (!linkedIssueToPRNumber) {
    core.info('No issue number was found. Exiting.')
    return
  }

  core.info('Check if label needs to be added.')
  if (pr.isMerged()) {
    const containsInReviewLabel = await issue.containsGivenLabel(
      linkedIssueToPRNumber,
      configuration.inReviewLabel.name
    )

    if (containsInReviewLabel) {
      await issue.removeLabel(linkedIssueToPRNumber, configuration.inReviewLabel.name)
    }

    const containsResolvedTestItLabel = await issue.containsGivenLabel(
      linkedIssueToPRNumber,
      configuration.doneLabel.name
    )
    if (!containsResolvedTestItLabel) {
      await issue.addLabel(linkedIssueToPRNumber, configuration.doneLabel.name)
    }
  } else {
    const containsInReviewLabel = await issue.containsGivenLabel(
      linkedIssueToPRNumber,
      configuration.inReviewLabel.name
    )
    if (!containsInReviewLabel) {
      await issue.addLabel(linkedIssueToPRNumber, configuration.inReviewLabel.name)
    }
  }
}
