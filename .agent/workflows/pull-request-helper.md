---
description: Workflow to assist in creating Pull Requests with Conventional Commits and generating PR descriptions
---

1. Check the current git status to identify modified files.
   - Run `git status`
2. specific analysis of the changes to understand the context.
   - Run `git diff` for unstaged changes or `git diff --cached` for staged changes.
3. Based on the changes, formulate a Conventional Commit message.
   - **Format**: `<type>(<scope>): <description>`
   - **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
   - **Scope**: (Optional) The module or component affected (e.g., `client`, `server`, `shared`).
   - Present the proposed commit message as a copy-pasteable command.
   - **IMPORTANT**: Do NOT include `git add` in the command. Assume the user has already staged the files they want to commit.
     ```
     git commit -m "feat(client): add new button component"
     ```
   - Suggest a branch name based on the commit type and scope.
     - **Format**: `<type>/<short-description>` (e.g., `feat/add-button-component`, `fix/login-error`).
     - Present the command to create detailed branch:
       ```
       git checkout -b <branch-name>
       ```

4. Read the Pull Request template.
   - Run `view_file .github/pull_request_template.md`
   - Analyze the changes to fill out the template sections:
     - **Summary**: A concise summary of the changes.
     - **Type of Change**: Check the relevant boxes (e.g., `[x]`).
     - **How was it tested?**: Describe the steps to verify the changes based on the modified code.
     - **TODO / Pending Technical Debt**: Note any remaining tasks or technical debt introduced or observed.
     - **Self-Review Checklist**: Ensure all items are checked if applicable.

5. Always create or update the file `PR_DESCRIPTION.md` with the filled content.
   - Run `write_to_file` to save the description to `PR_DESCRIPTION.md` (overwrite if exists).
   - Inform the user that the description has been saved to `PR_DESCRIPTION.md`.
