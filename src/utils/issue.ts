import { Context } from '@actions/github/lib/context';
import { Octokit } from '@octokit/rest';

export const getIssues = async(octokit: Octokit, context: Context): Promise<Array<Octokit.IssuesListForRepoResponseItem>> => (await octokit.paginate(
	octokit.issues.listForRepo.endpoint.merge({
		...context.repo,
	}),
)).filter(item => !('pull_request' in item));
