## Testing Guidelines with Playwright MCP

### IMPORTANT: Always Test Changes with Playwright MCP
When working on this application, you MUST use the Playwright MCP tools to test your changes thoroughly. This is critical for ensuring code quality and catching issues early.

#### Testing Workflow
1. **Before Making Changes**: Take baseline screenshots and document current behavior
2. **After Making Changes**: Test the affected functionality extensively
3. **Iterative Testing**: Use test findings to refine and correct your changes
4. **Comprehensive Validation**: Test related workflows that might be impacted

#### Required Testing Steps
```bash
# The development server is already running on port 3000
# Simply use Playwright MCP tools to:
# - Navigate to http://localhost:3000 for testing
# - Take screenshots for visual verification
# - Test form submissions and user interactions
# - Verify API responses and error handling
# - Check console for errors or warnings
```

#### Testing Best Practices
- **Test Critical User Flows**: Lead Creation → Quotation → PO → DO1 → DO2 → Invoice
- **Verify Data Integrity**: Ensure changes don't break existing functionality
- **Check Error States**: Test invalid inputs and network failures
- **Validate UI/UX**: Ensure responsive design and accessibility
- **Monitor Console**: Watch for JavaScript errors, API failures, and warnings

#### When to Test
- **Always**: After fixing bugs or adding features
- **Required**: Before marking any TODO item as complete
- **Critical**: When modifying:
  - API endpoints or database schemas
  - Form validation or submission logic
  - Navigation or routing components
  - Data fetching or state management

#### Test Documentation
- Take screenshots of before/after states
- Document any issues found during testing
- Update APP_ISSUES.md if new problems are discovered
- Include test results in commit messages when applicable

#### Failure Response
If Playwright testing reveals issues:
1. **Stop immediately** - Do not proceed with other changes
2. **Analyze the root cause** of the failure
3. **Fix the underlying issue** - don't just patch symptoms
4. **Re-test thoroughly** to ensure the fix works
5. **Test related functionality** that might be affected

### Git Commit Guidelines
After successfully testing changes with Playwright MCP:

#### When to Commit
- **REQUIRED**: After Playwright testing confirms changes work correctly
- **REQUIRED**: Before marking any TODO item as complete
- **ALWAYS**: Include test results in commit verification

#### Terminal Workflow for Testing and Committing
```bash
# Development server is already running on http://localhost:3000
# Use terminal for git commands and other operations:
git status
git diff
git add .
git commit -m "..."
```

#### Commit Message Format
```bash
git commit -m "$(cat <<'EOF'
[Component/Feature]: Brief description of changes

- Specific change 1
- Specific change 2
- Specific change 3

✅ Tested with Playwright MCP:
- [Test scenario 1 result]
- [Test scenario 2 result]
- Screenshots verified in: [location]

Fixes: [Related TODO item if applicable]

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

#### Git Commands - IMPORTANT RESTRICTIONS
**✅ ALLOWED Git Operations:**
- `git status` - Check working tree status
- `git diff` - View changes made
- `git add` - Stage files for commit
- `git commit` - Create commits with detailed messages
- `git log` - View commit history

**❌ FORBIDDEN Git Operations:**
- `git push` - NEVER push to remote repository
- `git checkout` - NEVER change branches
- `git merge` - NEVER merge branches
- `git rebase` - NEVER rebase commits
- Any commands that modify remote state or branch structure

#### Example Complete Workflow
```bash
# 1. Make code changes
# 2. Test with Playwright MCP (navigate to http://localhost:3000)
# 3. Check TODO.md and mark task complete if applicable
# 4. Commit changes:

git status
git diff
git add .
git commit -m "$(cat <<'EOF'
Fix: Update product categories to steel tube industry specific

- Replace generic categories (Electronics, Clothing) with steel tube products
- Add Square Tubes, Rectangular Tubes, Round Tubes, Oval Tubes, Custom Steel Products
- Update LeadCreation.jsx product dropdown options
- Ensure form validation accepts new categories

✅ Tested with Playwright MCP:
- Verified new categories appear in Lead Creation form
- Tested form submission with new product types
- Screenshots confirmed UI displays correctly

Fixes: TODO.md - Update product categories task

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Development Server Management
**IMPORTANT**: The development server is already running and managed for you:

1. **Application URL**: Always available at `http://localhost:3000`
2. **No server management needed**: Server is automatically maintained
3. **Direct testing access**: Use Playwright MCP to navigate to localhost:3000
4. **Consistent environment**: Server stays running for reliable testing

This ensures a stable testing environment without server management overhead during development.

### Individual Testing
```bash
# Test specific API endpoints using curl or Postman
curl http://localhost:5001/api/health

# Test SMS functionality
curl -X POST http://localhost:5001/api/sms/test \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "message": "Test message"}'
```

