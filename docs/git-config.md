# Git Configuration & Productivity Tips for Proxymity

This document provides recommendations for configuring your Git environment to improve productivity while working on the Proxymity repository.

## 1. Convenient Aliases

Run the following commands in your terminal to set up useful git aliases. These will allow you to type `git st` instead of `git status`, or `git lg` for a beautiful log graph.

### Global Aliases (Apply to all your repositories)

```bash
git config --global alias.st status && \
git config --global alias.co checkout && \
git config --global alias.cb "checkout -b" && \
git config --global alias.ci commit && \
git config --global alias.cm "commit -m" && \
git config --global alias.br branch && \
git config --global alias.df diff && \
git config --global alias.dc "diff --cached" && \
git config --global alias.lg "log --oneline --graph --decorate --all" && \
git config --global alias.lgun "log --oneline --graph --decorate --all --max-count=10" && \
git config --global alias.ps push && \
git config --global alias.pl pull
```

### Local Aliases (Apply ONLY to this repository)

If you prefer to configure these aliases only for **Proxymity**, navigate to the project root and run:

```bash
git config alias.st status && \
git config alias.co checkout && \
git config alias.cb "checkout -b" && \
git config alias.ci commit && \
git config alias.cm "commit -m" && \
git config alias.br branch && \
git config alias.df diff && \
git config alias.dc "diff --cached" && \
git config alias.lg "log --oneline --graph --decorate --all" && \
git config alias.lgun "log --oneline --graph --decorate --all --max-count=10" && \
git config alias.ps push && \
git config alias.pl pull
```

## 2. Core Editor

Set your preferred editor for commit messages and interactive rebases.

```bash
# Set VS Code as default editor
git config --global core.editor "code --wait"

# Set Nano
git config --global core.editor "nano"

# Set Vim
git config --global core.editor "vim"
```

## 3. Pull Strategy

Avoid unnecessary merge commits when pulling changes by defaulting to rebase.

```bash
git config --global pull.rebase true
```

## 4. Pruning

Automatically prune remote tracking branches that no longer exist on the remote.

```bash
git config --global fetch.prune true
```

## 5. Credential Helper

Cache your credentials so you don't have to type your password/token every time (if using HTTPS).

```bash
# Cache for 1 hour (3600 seconds)
git config --global credential.helper "cache --timeout=3600"

# Store permanently (use with caution)
git config --global credential.helper store
```

## 6. Ignore File Mode Changes

If you are facing issues with file permissions changing (e.g., chmod 755 vs 644), you can tell git to ignore them locally.

```bash
git config core.fileMode false
```

## 7. Interactive Rebase & Visualization (GitLens)

For a better experience when handling rebases, merge conflicts, and code history, we highly recommend using the **GitLens** extension in VS Code.

### Why use GitLens?
- **Interactive Rebase Editor**: It provides a visual interface for interactive rebases (`git rebase -i`), allowing you to drag-and-drop commits to reorder, squash, or drop them, instead of editing a text file in the CLI.
- **Visual Merge Arguments**: Simplifies conflict resolution by showing incoming vs. current changes side-by-side with clear actions.
- **File History & Blame**: Easily trace when and why code was changed directly in the editor.

### Installation
Search for `eamodio.gitlens` in the VS Code Extensions Marketplace and install it.
