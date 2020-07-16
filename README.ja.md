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

- [使用方法](#%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95)
- [スクリーンショット](#%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88)
  - [キャンセル中](#%E3%82%AD%E3%83%A3%E3%83%B3%E3%82%BB%E3%83%AB%E4%B8%AD)
  - [キャンセルされたジョブ](#%E3%82%AD%E3%83%A3%E3%83%B3%E3%82%BB%E3%83%AB%E3%81%95%E3%82%8C%E3%81%9F%E3%82%B8%E3%83%A7%E3%83%96)
  - [結果](#%E7%B5%90%E6%9E%9C)
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
        # use this GitHub Actions
      - uses: technote-space/auto-cancel-redundant-job@v1
        # Run any steps
      - name: any steps
        run: echo test
```

e.g. 
- [ci.yml](https://github.com/technote-space/toc-generator/blob/master/.github/workflows/ci.yml)
- [update-dependencies.yml](https://github.com/technote-space/toc-generator/blob/master/.github/workflows/update-dependencies.yml)

## スクリーンショット
### キャンセル中
![cancelling](https://raw.githubusercontent.com/technote-space/auto-cancel-redundant-job/images/cancelling.png)

### キャンセルされたジョブ
![cancelled](https://raw.githubusercontent.com/technote-space/auto-cancel-redundant-job/images/cancelled.png)

### 結果
![result](https://raw.githubusercontent.com/technote-space/auto-cancel-redundant-job/images/result.png)

## Outputs
| name | description | e.g. |
|:---:|:---|:---:|
|ids|キャンセルされた Run ID|`1234,2345`|

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
