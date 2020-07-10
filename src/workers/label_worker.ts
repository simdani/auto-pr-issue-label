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
    await this.createLabelsInRepo()

    if (this.pr.isMerged()) {
      await this.removeLabelIfItAlreadyExists(this.configuration.inReviewLabel)
      await this.addLabelIfDoesNotExist(this.configuration.doneLabel)
    } else {
      await this.addLabelIfDoesNotExist(this.configuration.inReviewLabel)
    }
  }

  private async createLabelsInRepo(): Promise<void> {
    await this.issue.createLabel(this.configuration.inReviewLabel)
    await this.issue.createLabel(this.configuration.doneLabel)
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
