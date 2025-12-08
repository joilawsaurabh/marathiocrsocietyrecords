# .kiro Directory

This directory contains Kiro IDE-specific configurations and guidelines for the Marathi OCR Pro project.

## Directory Structure

```
.kiro/
├── steering/           # Project guidelines and best practices
│   ├── project-context.md
│   ├── coding-standards.md
│   ├── ocr-guidelines.md
│   └── quota-system.md
├── specs/             # Feature specifications (empty - ready for future specs)
├── settings/          # IDE settings and configurations (empty)
├── hooks/             # Automated agent triggers (empty)
└── README.md          # This file
```

## Steering Files

Steering files provide context and guidelines to Kiro AI when working on this project.

### project-context.md
**Purpose**: High-level project overview  
**Contains**:
- Technology stack
- Project structure
- Key features
- Development guidelines
- Common tasks

**When to update**: When adding major features or changing architecture

### coding-standards.md
**Purpose**: Code quality and consistency guidelines  
**Contains**:
- TypeScript standards
- React component patterns
- Styling conventions
- Naming conventions
- File organization

**When to update**: When establishing new coding patterns

### ocr-guidelines.md
**Purpose**: OCR and Gemini API specific guidelines  
**Contains**:
- Prompt engineering strategies
- Model selection guide
- Token optimization
- Cost management
- Devanagari script specifics

**When to update**: When modifying OCR prompts or switching models

### quota-system.md
**Purpose**: Quota logging system documentation  
**Contains**:
- System architecture
- Usage guidelines
- Storage management
- Rate limit detection
- Troubleshooting

**When to update**: When modifying quota logging features

## How Steering Files Work

Steering files are automatically included in Kiro's context when:
- You ask questions about the project
- You request code changes
- You need help debugging

This ensures Kiro always has the right context and follows project conventions.

## Specs Directory

The `specs/` directory is for feature specifications following the spec-driven development workflow:

```
specs/
└── feature-name/
    ├── requirements.md    # User stories and acceptance criteria
    ├── design.md          # Architecture and design decisions
    └── tasks.md           # Implementation task list
```

**Currently empty** - Ready for future feature development.

## Settings Directory

The `settings/` directory is for IDE-specific configurations:

```
settings/
└── mcp.json           # Model Context Protocol configurations
```

**Currently empty** - Add MCP server configurations as needed.

## Hooks Directory

The `hooks/` directory is for automated agent triggers:

```
hooks/
└── hook-name.json     # Hook configuration
```

**Currently empty** - Add hooks for automated workflows as needed.

## Usage Examples

### Adding a New Feature

1. Create a spec in `.kiro/specs/new-feature/`
2. Write requirements.md
3. Get Kiro to help with design.md
4. Generate tasks.md
5. Execute tasks with Kiro

### Updating Guidelines

1. Edit relevant steering file
2. Kiro will automatically use updated guidelines
3. No restart needed

### Configuring MCP Servers

1. Create `.kiro/settings/mcp.json`
2. Add server configurations
3. Restart Kiro or reconnect servers

## Best Practices

### Steering Files
- ✅ Keep them up-to-date
- ✅ Be specific and actionable
- ✅ Include examples
- ✅ Reference external docs
- ❌ Don't make them too long
- ❌ Don't duplicate information

### Specs
- ✅ Follow EARS format for requirements
- ✅ Include acceptance criteria
- ✅ Break down into small tasks
- ✅ Reference requirements in tasks
- ❌ Don't skip the design phase
- ❌ Don't make tasks too large

### Organization
- ✅ One steering file per major topic
- ✅ One spec per feature
- ✅ Clear, descriptive names
- ✅ Regular updates
- ❌ Don't create redundant files
- ❌ Don't let files become outdated

## Maintenance

### Weekly
- [ ] Review steering files for accuracy
- [ ] Update any outdated information
- [ ] Add new patterns or conventions

### Monthly
- [ ] Archive completed specs
- [ ] Clean up unused hooks
- [ ] Review and update guidelines

### Quarterly
- [ ] Major review of all steering files
- [ ] Update technology stack info
- [ ] Refresh examples and references

## Resources

- [Kiro Documentation](https://docs.kiro.ai)
- [Steering Files Guide](https://docs.kiro.ai/steering)
- [Spec-Driven Development](https://docs.kiro.ai/specs)
- [MCP Configuration](https://docs.kiro.ai/mcp)

## Questions?

If you need help with:
- **Steering files**: Check existing files for examples
- **Specs**: See SPEC_DRIVEN_DEVELOPMENT.md in project root
- **Hooks**: See KIRO_HOOKS_USAGE.md in project root
- **General**: See KIRO_USAGE.md in project root

---

**Last Updated**: November 24, 2024  
**Project**: Marathi OCR Pro  
**Version**: 1.0
