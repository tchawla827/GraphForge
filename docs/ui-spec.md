# GraphForge UI Spec

## Design direction
Premium dark engineering dashboard:
- dark surfaces
- clear contrast
- restrained accent color
- tidy information density
- serious product feel

## Global layout
Most authenticated pages share:
- top navigation
- content area
- toast layer
- command/help access later

## 1. Landing page
### Goals
- explain product quickly
- show the build → run → inspect loop
- convert to demo or sign-in

### Sections
- hero
- visual demo panel
- key features
- algorithm support
- sample public projects
- CTA footer

### Primary actions
- Try demo
- Sign in with Google

## 2. Dashboard
### Goals
- make project management obvious
- surface recent work
- reduce blank-screen friction

### Main regions
- page header with create/import CTA
- recent projects list/grid
- optional filters/search
- empty state card with “Create project” and “Open sample”

### Project card
- title
- updated time
- node/edge count
- last algorithm
- quick actions menu

## 3. Editor workspace
This is the main product surface.

### Layout
- top toolbar
- left tool rail
- center canvas
- right inspector / algorithm panel
- bottom playback timeline panel

### Top toolbar
Include:
- project title
- save status
- import
- export
- share
- fit view
- undo/redo
- run algorithm

### Left tool rail
Keep minimal:
- select
- add node
- connect
- delete
- pan mode if needed

### Center canvas
- React Flow-based graph canvas
- background grid
- zoom controls
- minimap optional if useful
- clear node/edge selection states
- visually distinguish active, visited, finalized, and path nodes/edges

### Right panel tabs
Recommended tabs:
1. Graph
2. Selection
3. Algorithm
4. Help

#### Graph tab
- directed/undirected toggle
- weighted/unweighted toggle
- allow self-loops
- allow parallel edges

#### Selection tab
For node:
- label
- position readout if useful

For edge:
- source
- target
- weight
- label

#### Algorithm tab
- algorithm selector
- source selector
- target selector when required
- heuristic selector for A*
- run button
- validation warnings before run

#### Help tab
- input examples
- algorithm constraints
- keyboard help later

### Bottom playback panel
Must support:
- step back
- play/pause
- step forward
- restart
- speed control
- scrubber
- current step description
- run summary at completion

Optional early region:
- event timeline log
- queue/stack/priority queue inspector for relevant algorithms

## 4. Import modal
### Tabs
- adjacency list
- adjacency matrix
- JSON

### Requirements
- example format visible
- validation preview before commit
- clear errors with line/context when possible

## 5. Share modal
### States
- no share yet
- public share created
- private token share created
- revoked

### Controls
- create public link
- create private link
- copy link
- revoke link

## 6. Shared project page
### Requirements
- read-only badge
- same visual language as editor
- ability to run playback locally
- fork CTA
- no save-to-original actions

## 7. Empty states
### Dashboard
- “Create your first graph project”
- “Open a sample graph”

### Editor
- “Add a node to start building your graph”
- “Or import a graph”

### Playback
- “Select an algorithm and click Run”

## 8. Error states
- invalid graph for selected algorithm
- save failed
- import parse failed
- share revoked
- project not found
- unauthorized

Each error state should explain the next action.

## 9. Motion rules
- motion should explain state change, not decorate the page
- algorithm step changes can animate subtly
- avoid excessive transitions that slow down stepping

## 10. Accessibility notes
- keyboard-accessible controls
- visible focus rings
- readable contrast
- status legend so color is not the only cue
