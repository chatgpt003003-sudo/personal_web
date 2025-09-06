---
allowed-tools: Bash(gh:*), Bash(git:*), GitHub(*), filesystem(*)
description: Generate comprehensive GitHub issues with PRD structure from feature requests, bugs, or enhancement ideas
---

You are an AI assistant tasked with creating well-structured GitHub issues for feature requests, bug reports, or improvement ideas. Your goal is to turn the provided description into a comprehensive GitHub issue that follows engineering best practices and project conventions.

## Input

<feature_description>
$ARGUMENTS
</feature_description>

## Current Project Context

- **Repository**: !`git remote get-url origin 2>/dev/null || echo "Local repository"`
- **Current Branch**: !`git branch --show-current`
- **Recent Commits**: !`git log --oneline -5`
- **Project Structure**: @.
- **Existing Issues**: !`gh issue list --limit 10 --json number,title,labels 2>/dev/null || echo "No GitHub CLI access"`

## Analysis & Research Phase

First, analyze the input to determine the type:

- **Feature Request**: New functionality or capabilities (like infinite scroll)
- **Bug Report**: Broken functionality, errors, or unexpected behavior
- **Enhancement**: Improvements to existing features
- **Technical Debt**: Refactoring, performance, or code quality improvements

Then research the project context:

1. **Repository Structure**: Examine codebase organization, existing components, and architecture patterns
2. **Existing Issues**: Look for similar features, related bugs, or ongoing work that might conflict or synergize
3. **Project Conventions**: Check for CONTRIBUTING.md, issue templates, labeling conventions, and development workflows
4. **Technical Context**: Identify relevant files, components, and dependencies for this feature

## Planning Phase

Create a comprehensive plan covering:

<plan>
**Issue Classification**: [Feature/Bug/Enhancement/Technical Debt]

**Title Strategy**: Clear, descriptive title following project conventions

**Content Structure**:

- Problem statement and motivation
- Detailed requirements and specifications
- Technical approach and implementation considerations
- Acceptance criteria with testable conditions
- Dependencies and potential blockers

**Project Integration**:

- Appropriate labels (enhancement/bug + component labels)
- Milestone assignment if applicable
- Priority assessment
- Effort estimation

**Implementation Considerations**:

- Breaking down complex features into manageable tasks
- Identifying potential risks or edge cases
- Considering performance and UX implications
- Planning for testing and documentation
  </plan>

## GitHub Issue Creation

Generate a comprehensive issue with the following structure:

### Title Format

`[Type]: [Clear, specific description] - [Component/Area]`

### Content Structure

#### 🎯 Problem Statement

- **Current Situation**: What exists today and limitations
- **User Need**: Why this feature/fix is needed
- **Business Value**: Impact on user experience or development efficiency

#### 💡 Proposed Solution

- **High-level Approach**: Core concept and strategy
- **User Experience**: How users will interact with this feature
- **Technical Strategy**: Implementation approach and architecture decisions

#### 📋 Detailed Requirements

##### Functional Requirements

- **FR1**: [Specific user-facing behavior]
- **FR2**: [Additional functionality details]
- **FR3**: [Edge cases and error handling]

##### Technical Requirements

- **TR1**: [Performance benchmarks and constraints]
- **TR2**: [Integration requirements and dependencies]
- **TR3**: [Security and scalability considerations]

##### UX/UI Requirements (if applicable)

- **UR1**: [Interface design requirements]
- **UR2**: [Accessibility and responsive design needs]
- **UR3**: [Animation and interaction specifications]

#### 🚀 Implementation Approach

##### Phase 1: Foundation ([Timeline])

1. **[Component Setup]**: Core infrastructure and basic functionality
2. **[Integration Points]**: Connect with existing systems
3. **[Initial Testing]**: Unit tests and basic integration validation

##### Phase 2: Enhancement ([Timeline])

4. **[Advanced Features]**: Polish and advanced functionality
5. **[Performance Optimization]**: Ensure scalability and smooth UX
6. **[Documentation]**: User and developer documentation

#### ✅ Acceptance Criteria

- [ ] **Core Functionality**
  - [Specific testable condition 1]
  - [Specific testable condition 2]
  - [Edge case handling verification]

- [ ] **Performance & UX**
  - [Performance benchmark met]
  - [Smooth user experience verified]
  - [Responsive design confirmed]

- [ ] **Quality & Integration**
  - [Code quality standards met]
  - [Tests written and passing]
  - [Documentation updated]

#### 🔗 Additional Context

**Dependencies**:

- [List any prerequisite issues or external dependencies]

**Related Issues**:

- [Link similar or related work]

**Resources**:

- [Relevant documentation, designs, or research]

**Potential Risks**:

- [Technical challenges or unknowns]
- [UX considerations or trade-offs]

#### 📊 Effort Estimation

- **Complexity**: [S/M/L/XL]
- **Estimated Hours**: [Range based on team velocity]
- **Priority**: [High/Medium/Low]

## Final Steps

1. **Create the issue** using GitHub CLI:

   ```bash
   gh issue create --title "[Generated Title]" --body "[Generated Content]" --label "enhancement" --label "[component-label]"
   ```

2. **Assign appropriate labels** based on analysis:
   - Primary type: `enhancement`, `bug`, `feature`, `technical-debt`
   - Component: `frontend`, `backend`, `ui`, `api`, etc.
   - Priority: `high`, `medium`, `low`
   - Size: `small`, `medium`, `large`

## Output Format

Present the complete GitHub issue content in the following format:

<github_issue>
[Complete issue content ready for GitHub, formatted in Markdown with proper headings, checkboxes, and linking syntax]
</github_issue>

After generating the issue content, execute the GitHub CLI command to create the actual issue and provide the issue URL for reference.
