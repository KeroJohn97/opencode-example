---
name: commit
description: >-
  Create well-formatted git commits following conventional commit standards.
  Use when the user types /commit or asks to commit staged changes.
---

# Git Commit Skill

Create well-formatted git commits following conventional commit standards.

## Behavior

1. Check for staged changes with `git diff --staged`
2. If nothing is staged, inform the user and stop
3. Analyze the staged changes to determine type and scope
4. Generate a conventional commit message
5. Create the commit with proper formatting

## Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Types

- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting, missing semi-colons, etc.)
- refactor: Code refactoring (neither fixes a bug nor adds a feature)
- test: Adding or modifying tests
- chore: Maintenance tasks (dependencies, CI config, etc.)

## Scope

Scope is optional and should be a noun describing the section of the codebase
affected:

- `feat(auth): add password reset`
- `fix(search): handle empty query`
- `refactor(web): extract PokemonCard component`

## Description Rules

- Use imperative mood ("add feature", not "added feature")
- Don't capitalize first letter
- No period at the end
- Keep under 72 characters

## Body Rules

- Wrap at 72 characters
- Explain _what_ and _why_, not _how_
- Use bullet points for multiple changes

## Example

```
feat(search): add semantic search with pgvector

- Add match_pokemon RPC function for vector similarity search
- Integrate Google Gemini embeddings (3072 dimensions)
- Add debounced search input with loading state
- Fall back to text search for queries under 3 characters
```
