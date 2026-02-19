# opencode Configuration

⚠️ **Personal Configuration

Personal repository to manage and version [opencode](https://opencode.ai) configuration. This contains personal agent prompts and conventions

## Structure

```
.
├── opencode.json          # Master config (models, agents, tools, permissions)
├── package.json           # Bun workspace
├── bun.lock              # Lockfile (reproducibility)
├── prompts/              # Custom prompts per agent
│   ├── build-light.txt
│   ├── mini.txt
│   └── ...
├── skills/               # Reusable skill packs
│   ├── api-design/
│   ├── code-review/
│   ├── git-commit/
│   ├── security-checklist/
│   └── test-strategy/
└── README.md             # This file
```

## Usage

- **Edit config** → JSON editor (`opencode.json`)
- **Add agent** → create `prompts/<name>.txt`, declare in `opencode.json`
- **Add skill** → create `skills/<name>/SKILL.md` + resources
- **Validate** → reload opencode (`ctrl+x n`)

## Slash Commands

| Command | Agent | Purpose |
|---------|-------|---------|
| `/commit` | @mini | Generate Conventional Commits message |
| `/review` | @build | Full code review pipeline |
| `/test` | @build | Test coverage analysis |
| `/debug` | @build | Debug pipeline |
| `/refactor` | @build | Guided refactoring |

## Notes

- `package.json` and `bun.lock` must stay in git (reproducible dependencies)
- `node_modules/` is ignored (`.gitignore`)
- No test suite — validate changes by opening opencode
- All files in **English** except local documentation

## Links

- [opencode](https://opencode.ai)
- [Conventional Commits](https://www.conventionalcommits.org/)

## License

This project is licensed under the Apache License 2.0. See [LICENSE](./LICENSE) for details.
