#!/bin/bash
# Squashes entire repo history to a single commit with a standard message.
# Safe for GitHub Pages — rewrites and force-pushes main.

BRANCH=$(git rev-parse --abbrev-ref HEAD)
MSG="site update"

git checkout --orphan _temp
git add -A
git commit -m "$MSG"
git branch -D "$BRANCH"
git branch -m "$BRANCH"
git push origin "$BRANCH" --force
