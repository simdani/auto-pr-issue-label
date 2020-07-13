import {PullRequest} from '../github/pull_request'
import {Issue} from '../github/issue'
import {Configuration} from '../interfaces/configuration'
import {Label} from '../interfaces/label'
import {Worker} from './worker'

export class LabelWorker implements Worker {
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

  async run(): Promise<void> {
    const {inReviewLabel, doneLabel} = this.configuration

    await this.createLabelsInRepoIfNeeded()

    if (this.pr.isMerged()) {
      await this.removeLabelIfNeeded(inReviewLabel)
      await this.addLabelIfNeeded(doneLabel)
    } else {
      await this.addLabelIfNeeded(inReviewLabel)
    }
  }

  private async createLabelsInRepoIfNeeded(): Promise<void> {
    const {inReviewLabel, doneLabel} = this.configuration
    const listLabelsInRepo = await this.issue.listLabelsInRepo()

    if (!listLabelsInRepo.find(name => name == inReviewLabel.name)) {
      await this.issue.createLabel(inReviewLabel)
    }
    if (!listLabelsInRepo.find(name => name == doneLabel.name)) {
      await this.issue.createLabel(doneLabel)
    }
  }

  private async addLabelIfNeeded(label: Label): Promise<void> {
    const containsLabel = await this.issue.containsGivenLabel(
      this.linkedIssueToPRNumber,
      label.name
    )

    if (!containsLabel) {
      await this.issue.addLabel(this.linkedIssueToPRNumber, label.name)
    }
  }

  private async removeLabelIfNeeded(label: Label): Promise<void> {
    const containsLabel = await this.issue.containsGivenLabel(
      this.linkedIssueToPRNumber,
      label.name
    )

    if (containsLabel) {
      await this.issue.removeLabel(this.linkedIssueToPRNumber, label.name)
    }
  }
}
