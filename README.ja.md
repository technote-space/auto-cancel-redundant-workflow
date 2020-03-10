# Auto Cancel Redundant Job

[![CI Status](https://github.com/technote-space/auto-cancel-redundant-job/workflows/CI/badge.svg)](https://github.com/technote-space/auto-cancel-redundant-job/actions)
[![codecov](https://codecov.io/gh/technote-space/auto-cancel-redundant-job/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/auto-cancel-redundant-job)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/auto-cancel-redundant-job/badge)](https://www.codefactor.io/repository/github/technote-space/auto-cancel-redundant-job)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/auto-cancel-redundant-job/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

冗長ビルドを自動キャンセルする `GitHub Actions` です。

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

## 使用方法
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
      - uses: technote-space/auto-cancel-redundant-job@v1
      # ...
```

e.g. [update-dependencies.yml](.github/workflows/update-dependencies.yml)

## スクリーンショット
### キャンセル中
![cancelling](https://raw.githubusercontent.com/technote-space/auto-cancel-redundant-job/images/cancelling.png)

### キャンセルされたジョブ
![cancelled](https://raw.githubusercontent.com/technote-space/auto-cancel-redundant-job/images/cancelled.png)

### 結果
![result](https://raw.githubusercontent.com/technote-space/auto-cancel-redundant-job/images/result.png)

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
