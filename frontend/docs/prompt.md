For every UI-related task, the Stitch UI Specialist review is mandatory.
If Stitch MCP is available, you MUST inspect the reference design before implementing any UI.
If Stitch MCP is available, inspect the reference design before implementing the UI.
Do not rely on assumptions.
Match the reference layout, spacing, typography, colors, and component structure as closely as possible.

The Stitch UI Specialist must verify:

- Stitch Design System compliance
- Design token reuse
- Typography
- Spacing
- Colors
- Component consistency
- Responsive behavior
- Accessibility
- Loading, Empty, Error and Skeleton states

The review result must be:

PASS

or

CHANGES REQUIRED

If CHANGES REQUIRED:

- Fix all issues.
- Re-run the Stitch review.
- Continue only after PASS.

A UI task is not complete until the Stitch UI Specialist approves it.

---

Manual Verification (Mandatory)

After implementing a UI sprint:

- Run the application.
- Visit every new route introduced in the sprint.
- Verify every page renders correctly.
- Verify navigation between pages.
- Verify there are no 404 routes.
- Verify there are no hydration errors.
- Verify there are no runtime errors in the browser console.
- Verify the implemented UI matches the approved Sprint requirements and the Stitch Design System.

A UI sprint is not complete until all manual verification passes.

Never claim a verification step was completed unless you actually executed it.

If a verification step cannot be executed, explicitly state why and mark it as NOT VERIFIED.

Do not assume success.