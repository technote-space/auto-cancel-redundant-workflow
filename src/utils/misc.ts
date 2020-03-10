import { Context } from '@actions/github/lib/context';
import { Octokit } from '@octokit/rest';
import { Utils, ApiHelper } from '@technote-space/github-action-helper';

export const getRunId = (): number => Number(process.env.GITHUB_RUN_ID);

export const getTargetBranch = async(octokit: Octokit, context: Context): Promise<string> => {
	if (context.payload.pull_request) {
		return context.payload.pull_request.head.ref;
	}

	const helper        = new ApiHelper(octokit, context);
	const defaultBranch = await helper.getDefaultBranch();
	if (defaultBranch !== Utils.getBranch(context)) {
		const pull = await helper.findPullRequest(context.ref);
		if (pull) {
			return pull.head.ref;
		}
	}

	return defaultBranch;
};
