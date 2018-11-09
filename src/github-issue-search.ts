import * as sourcegraph from 'sourcegraph'

export function activate(): void {
   sourcegraph.search.registerIssueResultsProvider({provideIssueResults: async (query:string) => {
        const issueResults: sourcegraph.IssueResult[] = []
        await getGitHubIssueResults(query).then(result => {
            for (const res of result) {
                issueResults.push({__typename: 'IssueResult', title: res.title, body: res.body, url: res.url})
            }
        })
        return issueResults
        }
    })
}
// Needs to return null
function getGitHubIssueResults(query: string): Promise<sourcegraph.IssueResult[]> {
    const issuesSearchTriggered = query.match(/\btype:issue\b/)
    if (issuesSearchTriggered) {
        const repo = query.match(/\brepo:([^\s]*)\s/)
        const querySansRepo = query.replace(/^[\srepo:[^\s]*\s]/, '').trim().replace(/\s/g, '+')
        const querySansRepoAndType = querySansRepo.replace(/\btype:issue\b/, '')
        return fetch(`https://api.github.com/search/issues?q=repo:${repo ? repo[1] : null}+${querySansRepoAndType}`).then(response => response.json()).then(json => json.items)
    }
    return Promise.resolve([])

}

// Learn what else is possible by visiting the [Sourcegraph extension documentation](https://github.com/sourcegraph/sourcegraph-extension-docs)

// interface GitHubIssueResult {
//     title: string
//     body: string
//     url: string
// }
