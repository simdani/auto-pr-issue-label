import {Context} from '@actions/github/lib/context'

export class PullRequest {
  private context: Context

  constructor(context: Context) {
    this.context = context
  }

  isMerged(): boolean {
    return this.context.payload.pull_request && this.context.payload.pull_request['merged']
  }
}
