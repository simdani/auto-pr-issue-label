import {GitHub} from '@actions/github/lib/utils'
import * as core from '@actions/core'
import {Context} from '@actions/github/lib/context'
import {parseIssueNumber} from '../helpers/issueNumberParser'

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
        owner: owner,
        repo: repo,
        issue_number: this.context.issue.number
      })

      const extractedIssueNumber = Number(parseIssueNumber(owner, repo, issue.data.body))
      const extractedIssue = await this.octokit.issues.get({
        owner: owner,
        repo: repo,
        issue_number: extractedIssueNumber
      })
      core.info(JSON.stringify(extractedIssue))
      return extractedIssueNumber
    } catch (e) {
      core.warning(e)
      return null
    }
  }

  async addLabel(issueNumber: number, label: string): Promise<void> {
    const {owner, repo} = this.context.repo

    await this.octokit.issues.addLabels({
      owner: owner,
      repo: repo,
      issue_number: issueNumber,
      labels: [label]
    })
  }

  async removeLabel(issueNumber: number, label: string): Promise<void> {
    const {owner, repo} = this.context.repo

    await this.octokit.issues.removeLabel({
      owner: owner,
      repo: repo,
      issue_number: issueNumber,
      name: label
    })
  }

  async containsGivenLabel(issueNumber: number, label: string): Promise<boolean> {
    const {owner, repo} = this.context.repo

    const issueLabels = await this.octokit.issues.listLabelsOnIssue({
      owner: owner,
      repo: repo,
      issue_number: issueNumber
    })

    return issueLabels.data.some(l => l.name == label)
  }
}
