// Session-only state: never included in the persisted v0.3 workspace.
export function hasMeaningfulRequest(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function pendingDrafts(drafts, projectId) {
  return Object.entries(drafts[projectId] ?? {}).filter(([, draft]) => draft.text !== draft.baseContent)
}

export function setReviewDraft(drafts, projectId, proposalId, draft) {
  const projectDrafts = { ...drafts[projectId] }
  if (draft === null) delete projectDrafts[proposalId]
  else projectDrafts[proposalId] = draft
  return { ...drafts, [projectId]: projectDrafts }
}

export function resolveReviewSelection(project, selection) {
  if (!selection) return { proposal: project.proposals.find((p) => p.status === 'pending') ?? project.proposals[0], missing: false }
  const proposal = selection.projectId === project.id ? project.proposals.find((p) => p.id === selection.proposalId) : undefined
  return { proposal, missing: !proposal }
}

export function applyCreationAttempt(workspace, created) {
  const existing = workspace.projects.find((p) => p.id === created.id)
  return { ...workspace, activeProjectId: created.id, projects: existing ? workspace.projects : [...workspace.projects, created] }
}
