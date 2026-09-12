export const GIT_CATEGORIES = [
  { id: "setup", label: "Setup" },
  { id: "basics", label: "Basics" },
  { id: "branching", label: "Branching & Merging" },
  { id: "remote", label: "Remote" },
  { id: "undo", label: "Undoing Changes" },
  { id: "stash", label: "Stash" },
  { id: "inspect", label: "Inspecting History" },
];

export const GIT_ENTRIES = [
  { command: "git config --global user.name \"Name\"", category: "setup", description: "Set your commit author name globally" },
  { command: "git config --global user.email \"you@example.com\"", category: "setup", description: "Set your commit author email globally" },
  { command: "git init", category: "setup", description: "Initialize a new Git repository" },
  { command: "git clone <url>", category: "setup", description: "Clone a repository into a new directory" },

  { command: "git status", category: "basics", description: "Show the working tree status" },
  { command: "git add <file>", category: "basics", description: "Stage changes in a file" },
  { command: "git add .", category: "basics", description: "Stage all changed files" },
  { command: "git commit -m \"message\"", category: "basics", description: "Commit staged changes with a message" },
  { command: "git commit -am \"message\"", category: "basics", description: "Stage tracked files and commit in one step" },
  { command: "git diff", category: "basics", description: "Show unstaged changes" },
  { command: "git diff --staged", category: "basics", description: "Show staged changes" },

  { command: "git branch", category: "branching", description: "List local branches" },
  { command: "git branch <name>", category: "branching", description: "Create a new branch" },
  { command: "git switch <branch>", category: "branching", description: "Switch to an existing branch" },
  { command: "git switch -c <branch>", category: "branching", description: "Create and switch to a new branch" },
  { command: "git merge <branch>", category: "branching", description: "Merge a branch into the current branch" },
  { command: "git rebase <branch>", category: "branching", description: "Reapply commits on top of another branch" },
  { command: "git branch -d <branch>", category: "branching", description: "Delete a local branch" },

  { command: "git remote -v", category: "remote", description: "List remote repositories" },
  { command: "git remote add origin <url>", category: "remote", description: "Add a new remote" },
  { command: "git fetch", category: "remote", description: "Download objects and refs from a remote" },
  { command: "git pull", category: "remote", description: "Fetch and merge changes from a remote" },
  { command: "git push", category: "remote", description: "Upload local commits to a remote" },
  { command: "git push -u origin <branch>", category: "remote", description: "Push a branch and set its upstream" },

  { command: "git restore <file>", category: "undo", description: "Discard unstaged changes in a file" },
  { command: "git restore --staged <file>", category: "undo", description: "Unstage a file, keeping its changes" },
  { command: "git reset --soft HEAD~1", category: "undo", description: "Undo the last commit, keep changes staged" },
  { command: "git reset --hard HEAD~1", category: "undo", description: "Undo the last commit and discard changes" },
  { command: "git revert <commit>", category: "undo", description: "Create a new commit that undoes another commit" },
  { command: "git commit --amend", category: "undo", description: "Modify the most recent commit" },

  { command: "git stash", category: "stash", description: "Temporarily shelve uncommitted changes" },
  { command: "git stash pop", category: "stash", description: "Reapply the most recent stash and remove it" },
  { command: "git stash list", category: "stash", description: "List all stashes" },
  { command: "git stash drop", category: "stash", description: "Delete the most recent stash" },

  { command: "git log", category: "inspect", description: "Show commit history" },
  { command: "git log --oneline --graph", category: "inspect", description: "Show a compact, graphical commit history" },
  { command: "git show <commit>", category: "inspect", description: "Show the changes introduced by a commit" },
  { command: "git blame <file>", category: "inspect", description: "Show who last modified each line of a file" },
];

export function filterGitEntries(query, category = "all") {
  const q = query.trim().toLowerCase();
  return GIT_ENTRIES.filter((entry) => {
    if (category !== "all" && entry.category !== category) return false;
    if (!q) return true;
    return `${entry.command} ${entry.description}`.toLowerCase().includes(q);
  });
}
