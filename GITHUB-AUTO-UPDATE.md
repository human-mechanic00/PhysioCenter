# PhysioCenter — GitHub Auto Update

1. Create a GitHub repository, for example: `PhysioCenter`.
2. In `package.json`, replace:
   - `YOUR_GITHUB_USERNAME` with your GitHub username.
   - `PhysioCenter` with the exact repository name.
3. Push the project to GitHub.
4. The Windows GitHub Actions workflow builds the installer.
5. For a real update, publish a GitHub Release with a higher semantic version (for example 1.0.1, 1.1.0).
6. The installed app checks GitHub Releases and notifies the user.
7. The updater downloads and installs the new app files only.

IMPORTANT:
- The SQLite database is stored in Electron's userData directory, outside the installed application files.
- Updates do not replace that database.
- Keep database migrations backward-compatible.
- The app has `deleteAppDataOnUninstall=false`, so normal uninstall does not intentionally delete user data.
