import {GitHub} from '@actions/github/lib/utils'
import * as core from '@actions/core'
import {Context} from '@actions/github/lib/context'
import {parseIssueNumber} from '../helpers/issue_number_parser'
import {Label} from '../interfaces/label'

export class Issue {
  private octokit: InstanceType<typeof GitHub>
  private context: Context

  constructor(octokit: InstanceType<typeof GitHub>, context: Context) {
    this.octokit = octokit
    this.context = context
  }

  async getLinkedIssueToPrNumber(): Promise<number | null> {
    const {owner, repo} = this.context.repo

    try {
      const issue = await this.octokit.issues.get({
        owner,
        repo,
        issue_number: this.context.issue.number
      })

      const parsedIssueNumberFromBody = Number(parseIssueNumber(owner, repo, issue.data.body))
      const extractedIssue = await this.octokit.issues.get({
        owner,
        repo,
        issue_number: parsedIssueNumberFromBody
      })

      return !extractedIssue.data.pull_request ? extractedIssue.data.number : null
    } catch (e) {
      core.warning(e)
      return null
    }
  }

  async createLabel(label: Label): Promise<void> {
    const {owner, repo} = this.context.repo

    await this.octokit.issues.createLabel({
      owner,
      repo,
      name: label.name,
      color: label.color
    })
  }

  async addLabel(issueNumber: number, label: string): Promise<void> {
    const {owner, repo} = this.context.repo

    await this.octokit.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: [label]
    })
  }

  async removeLabel(issueNumber: number, label: string): Promise<void> {
    const {owner, repo} = this.context.repo

    await this.octokit.issues.removeLabel({
      owner,
      repo,
      issue_number: issueNumber,
      name: label
    })
  }

  async containsGivenLabel(issueNumber: number, label: string): Promise<boolean> {
    const {owner, repo} = this.context.repo

    const issueLabels = await this.octokit.issues.listLabelsOnIssue({
      owner,
      repo,
      issue_number: issueNumber
    })

    return issueLabels.data.some(l => l.name == label)
  }

  async listLabelsInRepo(): Promise<string[]> {
    const {owner, repo} = this.context.repo

    const repoLabels = await this.octokit.issues.listLabelsForRepo({
      owner,
      repo
    })

    return repoLabels.data.map(label => label.name)
  }
}
