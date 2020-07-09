export function parseIssueNumber(owner: string, repo: string, description: string): string {
  const parseFull = parseFullIssue(owner, repo, description)
  if (parseFull) {
    return parseFull
  }

  const parseDirect = parseDirectIssue(description)
  if (parseDirect) {
    return parseDirect
  }

  return ''
}

function parseFullIssue(owner: string, repo: string, description: string): string | null {
  const issueTemplate = `${owner}/${repo}/issues/`
  const issueTemplateIndex = description.indexOf(issueTemplate)

  let result = ''

  if (issueTemplateIndex !== -1) {
    const remainingDescription = description.substring(
      issueTemplateIndex + issueTemplate.length,
      description.length
    )

    for (const value of remainingDescription.split('')) {
      if (Number(value)) {
        result += value
      } else {
        break
      }
    }
  }

  return result.length > 0 ? result : null
}

function parseDirectIssue(description: string): string | null {
  const issueRegex = /#[1-9]\d*\b/g

  const issue = description.match(issueRegex)

  return issue && issue.length > 0 ? issue[0].substr(1) : null
}
