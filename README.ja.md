# Auto Cancel Redundant Workflow

---

**Please note:** This repository is currently unmaintained by a team of developers at GitHub. The
repository is here and you can use it as an example, or in Actions. However please be aware that
we are not going to be updating issues or pull requests on this repository.

**注意:** このリポジトリはもうメンテナンスされません。  
代わりに公式から提供されている [concurrency](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#concurrency) を使用してください。

### 移行例

```yaml
on: push
jobs:
  test:
    steps:
      - uses: technote-space/auto-cancel-redundant-workflow@v1
      - run: echo step1
      - run: echo step2
      # ...
```

↓

```yaml
on: push
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
#  cancel-in-progress: true
jobs:
  test:
    steps:
      - run: echo step1
      - run: echo step2
      # ...
```

---

[![CI Status](https://github.com/technote-space/auto-cancel-redundant-workflow/workflows/CI/badge.svg)](https://github.com/technote-space/auto-cancel-redundant-workflow/actions)
[![codecov](https://codecov.io/gh/technote-space/auto-cancel-redundant-workflow/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/auto-cancel-redundant-workflow)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/auto-cancel-redundant-workflow/badge)](https://www.codefactor.io/repository/github/technote-space/auto-cancel-redundant-workflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/auto-cancel-redundant-workflow/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

冗長ビルドを自動キャンセルする `GitHub Actions` です。

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [使用方法](#%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95)
- [スクリーンショット](#%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88)
  - [キャンセル中](#%E3%82%AD%E3%83%A3%E3%83%B3%E3%82%BB%E3%83%AB%E4%B8%AD)
  - [キャンセルされたワークフロー](#%E3%82%AD%E3%83%A3%E3%83%B3%E3%82%BB%E3%83%AB%E3%81%95%E3%82%8C%E3%81%9F%E3%83%AF%E3%83%BC%E3%82%AF%E3%83%95%E3%83%AD%E3%83%BC)
  - [結果](#%E7%B5%90%E6%9E%9C)
- [Outputs](#outputs)
- [Author](#author)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## 使用方法
```yaml
on:
  repository_dispatch:
    types: [test]
  # push:
  # ...

name: Example
jobs:
  firstJob:
    name: First Job
    runs-on: ubuntu-latest
    steps:
        # この GitHub Actions をこの workflow の中でできるだけ早く少なくとも一度は使用してください。
      - uses: technote-space/auto-cancel-redundant-workflow@v1
        # Run any steps
      - name: any steps
        run: echo test
      # ...

  # Run any jobs
  secondJob:
    name: Second Job
    needs: firstJob
    runs-on: ubuntu-latest
    steps:
      - run: echo test

  # ...
```

e.g. 
- [ci.yml](https://github.com/technote-space/toc-generator/blob/master/.github/workflows/ci.yml)
- [update-dependencies.yml](https://github.com/technote-space/toc-generator/blob/master/.github/workflows/update-dependencies.yml)

## スクリーンショット
### キャンセル中
![cancelling](https://raw.githubusercontent.com/technote-space/auto-cancel-redundant-workflow/images/cancelling.png)

### キャンセルされたワークフロー
![cancelled](https://raw.githubusercontent.com/technote-space/auto-cancel-redundant-workflow/images/cancelled.png)

### 結果
![result](https://raw.githubusercontent.com/technote-space/auto-cancel-redundant-workflow/images/result.png)

## Outputs
| name | description | e.g. |
|:---:|:---|:---:|
|ids|キャンセルされたワークフローの Run ID|`1234,2345`|

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
