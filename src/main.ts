// import {run} from './run'

import * as core from '@actions/core'
import * as github from '@actions/github'
import {parseIssueNumber} from './helpers/issueNumberParser'

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github-token')
    const octokit = github.getOctokit(githubToken)

    const context = github.context

    if (context.issue.number !== undefined) {
      const res = await octokit.issues.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number
      })

      const issueNumberFromBody = parseIssueNumber(
        context.repo.owner,
        context.repo.repo,
        res.data.body
      )

      process.stdout.write(context.repo.owner)
      process.stdout.write(context.repo.repo)
      process.stdout.write(res.data.body.toString())
      process.stdout.write('issue number is' + issueNumberFromBody)
      // process.stdout.write(res.data.title)
      // process.stdout.write(res.data.body)

      const responseLabels = await octokit.issues.listLabelsForRepo({
        owner: context.repo.owner,
        repo: context.repo.repo
      })

      // const isMerged =
      //   context.payload.pull_request &&
      //   context.payload.pull_request['merged'] === true

      process.stdout.write('before check')
      if (Number(issueNumberFromBody)) {
        // add in review label
        const inReviewLabel = 'In-Review'
        const issueLabelsResponse = await octokit.issues.listLabelsOnIssue({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: Number(issueNumberFromBody)
        })
        const issueLabel = issueLabelsResponse.data.find(l => l.name === inReviewLabel)
        if (issueLabel !== undefined) {
          await octokit.issues.removeLabel({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: Number(issueNumberFromBody),
            name: inReviewLabel
          })
        }

        // add resolved label
        process.stdout.write('inside issue')
        const resolvedTestItLabel = 'Resolved (test it)'
        const resolvedTestIt = responseLabels.data.find(l => l.name === resolvedTestItLabel)

        process.stdout.write('before creating checking')
        if (resolvedTestIt === undefined) {
          await octokit.issues.createLabel({
            owner: context.repo.owner,
            repo: context.repo.repo,
            name: resolvedTestItLabel,
            description: 'resolved and test it',
            color: '#000000'
          })
        }
        process.stdout.write('before adding label')
        await octokit.issues.addLabels({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: Number(issueNumberFromBody),
          labels: [resolvedTestItLabel]
        })
        return
      } else {
        // issue not found
        return
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}
run()
