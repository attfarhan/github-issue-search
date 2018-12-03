import * as sourcegraph from 'sourcegraph'

export function activate(): void {
   sourcegraph.search.registerIssueResultsProvider({provideIssueResults: async (query:string) => {
        const issueResults: sourcegraph.IssueResult[] = []
        await getGitHubIssueResults(query).then(result => {
            for (const res of result) {
                issueResults.push({__typename: 'IssueResult', icon: '', label: res.title, url: res.url, results: [{url: res.url, body: res.body}]})
            }
        })
        console.log('ISSUE RESULTS', issueResults)
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

// export interface IssueResult {
//     icon: string
//     label: string
//     url: string
//     detail: string
//     results: GenericSearchMatch[]
// }

// export interface GenericSearchMatch {
//     url: string
//     body: string
//     highlights: Highlight
// }

// export interface Highlight {
//     line: number
//     character: number
//     length: number
// }
