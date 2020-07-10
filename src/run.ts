import * as core from '@actions/core'
import * as github from '@actions/github'
import * as handler from './handler'
import {label} from './interfaces/label'

export async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github-token')
    const octokit = github.getOctokit(githubToken)

    const inReviewLabel: label = JSON.parse(core.getInput('in-review-label'))

    core.info('started')
    core.info(inReviewLabel.name)
    core.info(inReviewLabel.color)

    await handler.handle(octokit, github.context)
  } catch (error) {
    core.setFailed(error.message)
  }
}
