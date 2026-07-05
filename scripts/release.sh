#!/usr/bin/env bash
#
# Cut a new release: bump the version, rebuild the plugins, tag, and push.
#
# Usage: scripts/release.sh <patch|minor|major|x.y.z>

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <patch|minor|major|x.y.z>" >&2
  exit 1
fi

BUMP="$1"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "Error: releases must be cut from 'main' (currently on '$CURRENT_BRANCH')." >&2
  exit 1
fi

# Local commits ahead of origin/main (and uncommitted changes) are fine — they'll
# be pushed along with the release commit and tag. What we can't allow is local
# main missing commits that origin has, since that push would be rejected.
git fetch origin main
if ! git merge-base --is-ancestor origin/main HEAD; then
  echo "Error: local main has diverged from or is behind origin/main. Pull/rebase first." >&2
  exit 1
fi

# Compute the target version ourselves (rather than via `npm version --dry-run`,
# which still writes package.json and attempts a git tag despite the flag) so
# the tag collision check below runs before anything touches the tree.
VERSION="$(node -e "
  const bump = process.argv[1];
  const current = require('./package.json').version;
  if (/^\d+\.\d+\.\d+$/.test(bump)) { console.log(bump); process.exit(0); }
  const [major, minor, patch] = current.split('.').map(Number);
  const next = { patch: [major, minor, patch + 1], minor: [major, minor + 1, 0], major: [major + 1, 0, 0] }[bump];
  if (!next) { console.error('Invalid bump: ' + bump); process.exit(1); }
  console.log(next.join('.'));
" "$BUMP")"
TAG="v$VERSION"

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Error: tag $TAG already exists." >&2
  exit 1
fi

echo "Releasing $TAG"

# Bump package.json + package-lock.json without creating npm's own commit/tag,
# since we create both ourselves once the plugin manifests are in sync too.
npm version "$VERSION" --no-git-tag-version --allow-same-version >/dev/null
git diff --quiet -- package.json && { echo "Error: version unchanged (already at $VERSION)." >&2; exit 1; }

npm run build

for MARKETPLACE in .claude-plugin/marketplace.json .cursor-plugin/marketplace.json; do
  tmp="$(mktemp)"
  jq --arg v "$VERSION" '.plugins[0].version = $v' "$MARKETPLACE" > "$tmp"
  mv "$tmp" "$MARKETPLACE"
done

git add package.json package-lock.json \
  plugins/claude/.claude-plugin/plugin.json \
  plugins/cursor/.cursor-plugin/plugin.json \
  .claude-plugin/marketplace.json \
  .cursor-plugin/marketplace.json

git commit -m "chore: release $TAG"
git tag -a "$TAG" -m "$TAG"

git push origin main
git push origin "$TAG"

echo "Released $TAG and pushed to origin."
