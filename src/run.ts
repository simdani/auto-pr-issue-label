import * as core from '@actions/core'
import * as github from '@actions/github'
import * as handler from './handler'
import {label} from './interfaces/label'
import {configuration} from './interfaces/configuration'

export async function run(): Promise<void> {
  try {
    const configuration = getConfiguration()
    const octokit = github.getOctokit(configuration.githubToken)

    await handler.handle(octokit, github.context, configuration)
  } catch (error) {
    core.setFailed(error.message)
  }
}

function getConfiguration(): configuration {
  const githubToken = core.getInput('github-token')
  const inReviewLabel: label = JSON.parse(core.getInput('in-review-label'))
  const doneLabel: label = JSON.parse(core.getInput('done-label'))

  return {
    githubToken,
    inReviewLabel,
    doneLabel
  }
}
