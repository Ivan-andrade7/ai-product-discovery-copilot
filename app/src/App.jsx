import { useState } from 'react'
import { defaultProject, initialProposals, initialSources } from './data/demoData'
import { NewProjectScreen } from './screens/NewProjectScreen'
import { OverviewScreen } from './screens/OverviewScreen'
import { ProjectsScreen } from './screens/ProjectsScreen'
import { WorkScreen } from './screens/WorkScreen'
import { DecisionsScreen } from './screens/DecisionsScreen'
import { ActivityScreen } from './screens/ActivityScreen'
import { DeliverablesScreen } from './screens/DeliverablesScreen'
import { SourcesScreen } from './screens/SourcesScreen'
import './App.css'

function App() {
  const [screen, setScreen] = useState('projects')
  const [currentProject, setCurrentProject] = useState(defaultProject)
  const [proposals, setProposals] = useState(initialProposals)
  const [decisions, setDecisions] = useState([])

  function openProjects() {
    setScreen('projects')
  }

  function createProject(project) {
    setCurrentProject(project)
    setProposals(initialProposals)
    setDecisions([])
    setScreen('overview')
  }

  function updateProposal(id, changes, action) {
    const previous = proposals.find((proposal) => proposal.id === id)
    if (!previous) return

    const updated = { ...previous, ...changes }
    setProposals((current) =>
      current.map((proposal) => (proposal.id === id ? updated : proposal)),
    )
    setDecisions((history) => [
      ...history,
      {
        id: `decision-${history.length + 1}`,
        sequence: history.length + 1,
        proposalId: id,
        proposalType: previous.type,
        proposalTitle: previous.title,
        action,
        previousStatus: previous.status,
        currentStatus: updated.status,
        originalContent: initialProposals.find((proposal) => proposal.id === id)?.content ?? previous.content,
        previousContent: previous.content,
        currentContent: updated.content,
      },
    ])
  }

  if (screen === 'new-project') {
    return <NewProjectScreen onCancel={openProjects} onCreate={createProject} />
  }

  if (screen === 'overview') {
    return (
      <OverviewScreen
        project={currentProject}
        proposals={proposals}
        onHome={openProjects}
        onNavigate={setScreen}
      />
    )
  }

  if (screen === 'work') {
    return (
      <WorkScreen
        project={currentProject}
        proposals={proposals}
        onHome={openProjects}
        onNavigate={setScreen}
        onUpdateProposal={updateProposal}
      />
    )
  }

  if (screen === 'decisions') {
    return (
      <DecisionsScreen
        project={currentProject}
        proposals={proposals}
        decisions={decisions}
        onHome={openProjects}
        onNavigate={setScreen}
      />
    )
  }

  if (screen === 'sources') {
    return (
      <SourcesScreen
        project={currentProject}
        proposals={proposals}
        sources={initialSources}
        onHome={openProjects}
        onNavigate={setScreen}
      />
    )
  }

  if (screen === 'deliverables') {
    return (
      <DeliverablesScreen
        project={currentProject}
        proposals={proposals}
        onHome={openProjects}
        onNavigate={setScreen}
      />
    )
  }

  if (screen === 'activity') {
    return (
      <ActivityScreen
        project={currentProject}
        proposals={proposals}
        decisions={decisions}
        onHome={openProjects}
        onNavigate={setScreen}
      />
    )
  }

  return (
    <ProjectsScreen
      onNewProject={() => setScreen('new-project')}
      onOpenProject={() => {
        setCurrentProject(defaultProject)
        setProposals(initialProposals)
        setDecisions([])
        setScreen('overview')
      }}
    />
  )
}

export default App
