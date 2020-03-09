# GitHub Actions Template

[![CI Status](https://github.com/technote-space/gh-actions-template/workflows/CI/badge.svg)](https://github.com/technote-space/gh-actions-template/actions)
[![codecov](https://codecov.io/gh/technote-space/gh-actions-template/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/gh-actions-template)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/gh-actions-template/badge)](https://www.codefactor.io/repository/github/technote-space/gh-actions-template)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/gh-actions-template/blob/master/LICENSE)

Template for GitHub actions.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [Setup](#setup)
  - [yarn](#yarn)
  - [npm](#npm)
- [Workflows](#workflows)
  - [ci.yml](#ciyml)
  - [add-version-tag.yml](#add-version-tagyml)
  - [toc.yml](#tocyml)
  - [issue-opened.yml](#issue-openedyml)
  - [pr-opened.yml](#pr-openedyml)
  - [pr-updated.yml](#pr-updatedyml)
  - [project-card-moved.yml](#project-card-movedyml)
  - [broken-link-check.yml](#broken-link-checkyml)
  - [update-dependencies.yml](#update-dependenciesyml)
  - [add-test-tag.yml](#add-test-tagyml)
  - [Secrets](#secrets)
- [Test release](#test-release)
- [Helpers](#helpers)
- [Author](#author)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Setup
### yarn
- `yarn setup`
### npm
- `npm run setup`

## Workflows

Some `workflows` are included by default.  

### ci.yml
CI Workflow

1. ESLint
1. Jest
   - Send coverage report to codecov if `CODECOV_TOKEN` is set.
1. Release GitHub Actions
   - if tag is added.
1. Publish package
   - if tag is added and `NPM_AUTH_TOKEN` is set.
1. Publish release
   - if 3 and 4 jobs are succeeded.
1. Notify by slack
   - if workflow is failure

[ACCESS_TOKEN](#access_token) is required.  
[SLACK_WEBHOOK_URL](#slack_webhook_url) is required.  

### add-version-tag.yml
Add the release tag when pull request is merged.

1. Get next version from commits histories.  
   see [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
1. Add tag.
1. Create branch for next version.

[ACCESS_TOKEN](#access_token) is required.

### toc.yml
Create TOC (Table of contents)

[ACCESS_TOKEN](#access_token) is required.

### issue-opened.yml
- Assign the issue to project  
   default setting:  
   ```
   Project: Backlog
   Column: To do
   ```
- Assign author to issue

### pr-opened.yml
- Assign the PR to project  
   default setting:  
   ```
   Project: Backlog
   Column: In progress
   ```
   [ACCESS_TOKEN](#access_token) is required.
- Assign author to PR
- Add labels by branch  
   [setting](.github/pr-labeler.yml)

### pr-updated.yml
- Add labels by changed files
   [setting](.github/labeler.yml)
- Create PR histories
- Manage PR by release type  
   [ACCESS_TOKEN](#access_token) is required.
- Check version in package.json  
   [ACCESS_TOKEN](#access_token) is required.
- Check if it can be published to npm  
   if `NPM_AUTH_TOKEN` is set

### project-card-moved.yml
Manage labels by moving project cards

### broken-link-check.yml
Check broken link in README

### update-dependencies.yml
Update package dependencies

- schedule
- PR opened, closed
- repository dispatch

### add-test-tag.yml
Add tag for test release

### Secrets
#### ACCESS_TOKEN
[Personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) with the public_repo or repo scope  
(repo is required for private repositories)

#### SLACK_WEBHOOK_URL
https://api.slack.com/messaging/webhooks

## Test release
[![technote-space/release-github-actions-cli - GitHub](https://gh-card.dev/repos/technote-space/release-github-actions-cli.svg)](https://github.com/technote-space/release-github-actions-cli)

1. Create `.env`  
   Set [Personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line)
   ```dotenv
   token=1234567890abcdef1234567890abcdef12345678
   ```
1. Run `yarn release`
   - Dry run: `yarn release -n`
   - Help: `yarn release -h`

![cli](https://github.com/technote-space/gh-actions-template/raw/images/cli.gif)

Then, you can use your `GitHub Actions` like follows:

```yaml
on: push
name: Test
jobs:
  toc:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: owner/repo@gh-actions
```

## Helpers
[![technote-space/github-action-helper - GitHub](https://gh-card.dev/repos/technote-space/github-action-helper.svg)](https://github.com/technote-space/github-action-helper)

[![technote-space/github-action-test-helper - GitHub](https://gh-card.dev/repos/technote-space/github-action-test-helper.svg)](https://github.com/technote-space/github-action-test-helper)

[![technote-space/filter-github-action - GitHub](https://gh-card.dev/repos/technote-space/filter-github-action.svg)](https://github.com/technote-space/filter-github-action)

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
