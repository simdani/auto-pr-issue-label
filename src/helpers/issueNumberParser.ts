export function parseIssueNumber(
  owner: string,
  repo: string,
  description: string
): string {
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

  return result
}
