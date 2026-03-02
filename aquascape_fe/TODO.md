# TODO: Integrate Sidebar and Item Management into Aquarium3D

## Overview
Add sidebar UI for selecting fish, plants, and hardscape items. Allow adding items to 3D scene where fish swim and others remain static. Include transform toolbar for selected items.

## Steps
- [x] Update Aquarium3D.tsx: Add sidebar, overlay, transform toolbar UI and state management.
- [x] Modify useTankSetup.ts: Add support for multiple items (fish swimmers, static meshes), raycasting, transform controls, item addition, scene clearing.
- [x] Add item database to Aquarium3D.tsx.
- [x] Implement event handlers: toggleSidebar, switchTab, addItemToScene, clearScene, setTransformMode, deleteSelected.
- [x] Update animation loop in useTankSetup.ts to handle static items looking at camera.
- [x] Test integration: Ensure fish swim, static items are placed correctly, tank size adjustment works.
