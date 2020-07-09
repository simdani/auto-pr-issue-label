import * as core from '@actions/core'
import * as github from '@actions/github'
import * as handler from './handler'

export async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github-token')
    const octokit = github.getOctokit(githubToken)

    const context = github.context

    await handler.handle(octokit, context)
  } catch (error) {
    core.setFailed(error.message)
  }
}
