#!/usr/bin/env bash

set -e

if [[ $(uname -s) == 'Darwin' ]]; then
  if [[ $(sed --version 2> /dev/null || : | grep -c "gsed") == 0 ]]; then
    echo "Please setup to use gsed instead of sed"
    echo ">> brew install gnu-sed"
    echo ">> alias sed='gsed'"
    exit
  fi
fi

echo "Owner: [= technote-space]"
read -r OWNER
if [[ -z "${OWNER}" ]]; then
  OWNER=technote-space
fi

readonly DIR=$(cd "$(dirname "$0")/.."; pwd)
readonly DEFAULT_REPO=${DIR##*/}
readonly DEFAULT_TITLE=$(echo "${DEFAULT_REPO}" | sed 's/[-_]/ /g' | tr "[:upper:]" "[:lower:]" | sed 's/\b\(.\)/\u\1/g')

echo "Repo: [= ${DEFAULT_REPO}]"
read -r REPO
if [[ -z "${REPO}" ]]; then
  REPO=${DEFAULT_REPO}
fi

echo "Title: [= ${DEFAULT_TITLE}]"
read -r TITLE
if [[ -z "${TITLE}" ]]; then
  TITLE=${DEFAULT_TITLE}
fi

echo "DESCRIOTION: [= ]"
read -r DESCRIOTION

echo ""
echo "=================================="
echo "Repository:  ${OWNER}/${REPO}"
echo "Title:       ${TITLE}"
echo "Description: ${DESCRIOTION}"
echo "=================================="
# shellcheck disable=SC2162
read -n1 -p "ok? (y/N): " yn
if [[ $yn != [yY] ]]; then
  exit
fi

sed -i "s/technote-space/${OWNER}/g" .github/CODEOWNERS
sed -i "s/technote-space/${OWNER}/g" README.md
sed -i "s/gh-actions-template/${REPO}/g" README.md
sed -i "s/technote-space\/gh-actions-template/${OWNER}\/${REPO}/g" package.json
sed -i "s/Template for GitHub actions\./${DESCRIOTION}/g" README.md
sed -i "s/Template for GitHub actions\./${DESCRIOTION}/g" package.json
sed -i "s/Template for GitHub actions\./${DESCRIOTION}/g" action.yml
sed -i "s/GitHub Actions Template/${TITLE}/g" README.md
sed -i "s/GitHub Actions Template/${TITLE}/g" action.yml

if [[ "${OWNER}" != 'technote-space' ]]; then
  rm -f .github/FUNDING.yml
  rm -f .github/workflows/sync-workflows.yml
  rm -f _config.yml
  sed -i '/[tT]echnote/d' README.md
fi

sed -i '/setup.sh/d' package.json
touch __DELETE__

cat <<EOS


Please edit package.json
  - version
  - description
  - author
  - license
  - keywords
  - etc.
EOS
