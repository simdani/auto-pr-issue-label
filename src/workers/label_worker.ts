import {PullRequest} from '../github/pull_request'
import {Issue} from '../github/issue'
import {Configuration} from '../interfaces/configuration'
import {Label} from '../interfaces/label'

export class LabelWorker {
  private pr: PullRequest
  private issue: Issue
  private linkedIssueToPRNumber: number
  private configuration: Configuration

  constructor(
    pr: PullRequest,
    issue: Issue,
    linkedIssueToPRNumber: number,
    configuration: Configuration
  ) {
    this.pr = pr
    this.issue = issue
    this.linkedIssueToPRNumber = linkedIssueToPRNumber
    this.configuration = configuration
  }

  async proccess(): Promise<void> {
    if (this.pr.isMerged()) {
      this.proccessMergedPR()
    } else {
      this.proccessActivePR()
    }
  }

  private async proccessMergedPR(): Promise<void> {
    await this.removeLabelIfItAlreadyExists(this.configuration.inReviewLabel)
    await this.addLabelIfDoesNotExist(this.configuration.doneLabel)
  }

  private async proccessActivePR(): Promise<void> {
    await this.addLabelIfDoesNotExist(this.configuration.inReviewLabel)
  }

  private async addLabelIfDoesNotExist(label: Label): Promise<void> {
    const containsLabel = await this.issue.containsGivenLabel(
      this.linkedIssueToPRNumber,
      label.name
    )
    if (!containsLabel) {
      await this.issue.addLabel(this.linkedIssueToPRNumber, label.name)
    }
  }

  private async removeLabelIfItAlreadyExists(label: Label): Promise<void> {
    const containsLabel = await this.issue.containsGivenLabel(
      this.linkedIssueToPRNumber,
      label.name
    )

    if (containsLabel) {
      await this.issue.removeLabel(this.linkedIssueToPRNumber, label.name)
    }
  }
}
