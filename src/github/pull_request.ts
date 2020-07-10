import {GitHub} from '@actions/github/lib/utils'
import {Context} from '@actions/github/lib/context'

export class PullRequest {
  private octokit: InstanceType<typeof GitHub>
  private context: Context

  constructor(octokit: InstanceType<typeof GitHub>, context: Context) {
    this.octokit = octokit
    this.context = context
  }

  isMerged(): boolean {
    return this.context.payload.pull_request && this.context.payload.pull_request['merged']
  }
}
