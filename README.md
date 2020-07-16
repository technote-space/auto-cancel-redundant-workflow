# Auto Cancel Redundant Job

[![CI Status](https://github.com/technote-space/auto-cancel-redundant-job/workflows/CI/badge.svg)](https://github.com/technote-space/auto-cancel-redundant-job/actions)
[![codecov](https://codecov.io/gh/technote-space/auto-cancel-redundant-job/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/auto-cancel-redundant-job)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/auto-cancel-redundant-job/badge)](https://www.codefactor.io/repository/github/technote-space/auto-cancel-redundant-job)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/auto-cancel-redundant-job/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

GitHub Actions to automatically cancel redundant jobs.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [Usage](#usage)
- [Screenshots](#screenshots)
  - [Cancelling jobs](#cancelling-jobs)
  - [Cancelled job](#cancelled-job)
  - [Result](#result)
- [Author](#author)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage
```yaml
on:
  repository_dispatch:
    types: [test]
  # push:
  # ...

name: Broken Link Check
jobs:
  check:
    name: Broken Link Check
    runs-on: ubuntu-latest
    steps:
        # use this GitHub Actions
      - uses: technote-space/auto-cancel-redundant-job@v1
        # Run any steps
      - name: any steps
        run: echo test
```

e.g. 
- [ci.yml](https://github.com/technote-space/toc-generator/blob/master/.github/workflows/ci.yml)
- [update-dependencies.yml](https://github.com/technote-space/toc-generator/blob/master/.github/workflows/update-dependencies.yml)

## Screenshots
### Cancelling jobs
![cancelling](https://raw.githubusercontent.com/technote-space/auto-cancel-redundant-job/images/cancelling.png)

### Cancelled job
![cancelled](https://raw.githubusercontent.com/technote-space/auto-cancel-redundant-job/images/cancelled.png)

### Result
![result](https://raw.githubusercontent.com/technote-space/auto-cancel-redundant-job/images/result.png)

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
