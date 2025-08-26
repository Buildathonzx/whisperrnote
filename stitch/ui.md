# WhisperNote UI Design Specification

## Project Overview
WhisperNote is a collaborative note-taking platform with blockchain integration, encryption, and extensibility features. The application supports secure note creation, sharing, commenting, and collaborative editing with Web3 wallet connectivity.

## Core Data Architecture

### Primary Entities
- **Users**: Account management with Web3 wallet integration, profile data
- **Notes**: Encrypted content with hierarchical structure, collaboration support, attachments
- **Tags**: Organizational system with color coding and usage analytics
- **Comments**: Threaded discussions on notes with reactions
- **Collaborators**: Permission-based sharing (read/write/admin) with invitation system
- **Extensions**: Plugin architecture for customizable functionality
- **Blog Posts**: Public content publishing with media support
- **API Keys**: Developer access management with scoped permissions
- **Activity Log**: User action tracking and audit trail
- **Settings**: User preferences and configuration

### Storage Buckets
- Profile pictures
- Note attachments (encrypted)
- Blog media assets
- Extension assets
- Backup storage
- Temporary uploads

## Page Structure & Components

### Authentication Flow
- **Login Page**: Email/password, magic link, phone, anonymous options
- **Signup Page**: Account creation with wallet connection option
- **Verification Page**: Email/phone verification
- **Password Reset**: Recovery flow

### Main Application Shell
- **Navigation**: Sidebar with note tree, tags, search, settings access
- **App Shell**: Responsive layout with collapsible sidebar, header with user menu
- **Global Search**: Cross-content search with filters (notes, tags, collaborators)
- **Keyboard Shortcuts**: Command palette and hotkey system

### Core Note Management
- **Notes Dashboard**: Grid/list view of user notes with filtering by status, tags, date
- **Note Editor**: Rich text editor with real-time collaboration, attachment support
- **Note Viewer**: Read-only display with comment threads, reactions
- **Note Card**: Preview component showing title, excerpt, tags, collaboration status
- **Tag Manager**: Create, edit, organize tags with color coding and descriptions

### Collaboration Features
- **Collaborators Panel**: Manage note sharing, permission levels, invitation system
- **Comments System**: Threaded discussions with reactions, mentions
- **Activity Feed**: Recent actions and changes across shared notes
- **Notification Center**: Collaboration updates, mentions, permission changes

### Content Organization
- **Shared Notes**: View notes shared with user, grouped by permission level
- **Tag Organization**: Hierarchical tag structure with usage statistics
- **Note Hierarchy**: Parent-child note relationships, folder-like organization
- **Archive View**: Manage archived notes and restore functionality

### Blog & Public Content
- **Blog Listing**: Public blog posts with cover images, excerpts, tags
- **Blog Post View**: Full post display with comments, social sharing
- **Blog Editor**: Rich content creation with media upload, SEO metadata

### Extension System
- **Extensions Marketplace**: Browse, install, configure plugins
- **Extension Settings**: Individual extension configuration panels
- **Extension Manager**: Enable/disable, update, uninstall extensions

### Settings & Administration
- **Profile Settings**: User information, avatar, wallet management
- **Privacy Settings**: Encryption preferences, sharing defaults
- **API Management**: Create, manage, revoke API keys with scope configuration
- **Security Settings**: Two-factor auth, session management, activity monitoring
- **Notification Preferences**: Email, in-app, mobile push settings
- **Data Export/Import**: Backup creation, data portability
- **Billing & Subscription**: Plan management, usage analytics

### Developer Features
- **API Documentation**: Interactive docs for developers
- **Webhook Configuration**: Event subscriptions for integrations
- **Integration Management**: Third-party service connections

## UI Component Categories

### Layout Components
- Responsive grid system
- Modal overlays for forms and confirmations
- Sidebar navigation with collapsible sections
- Breadcrumb navigation for note hierarchy
- Tab interfaces for multi-panel views

### Data Display
- Virtualized lists for large note collections
- Card-based layouts for note previews
- Timeline views for activity feeds
- Table views for collaboration management
- Chart components for analytics and usage

### Form Elements
- Rich text editor with toolbar
- File upload with drag-drop and progress
- Tag input with autocomplete
- Date/time pickers
- Permission selector components
- Search interfaces with faceted filtering

### Interactive Elements
- Context menus for note actions
- Tooltip system for feature explanations
- Notification toasts and alerts
- Confirmation dialogs
- Loading states and skeleton screens

### Collaboration UI
- Real-time cursors and user presence
- Comment threads with threading UI
- Reaction picker and display
- Invitation flow modals
- Permission matrix interfaces

### Security & Privacy
- Encryption status indicators
- Privacy level badges
- Audit trail displays
- Session management interface
- Two-factor authentication setup

## Technical Considerations
- End-to-end encryption for sensitive content
- Real-time collaboration with WebSocket connections
- Offline capability with sync indicators
- Progressive web app features
- Responsive design for mobile/tablet/desktop
- Accessibility compliance (WCAG)
- Dark/light theme support
- Performance optimization for large note collections
- Blockchain transaction status indicators
- Web3 wallet integration flows

## App-Like UI Architecture

### Navigation Structure
- **Mobile**: Bottom navigation bar (not touching edges) with 4-5 primary tabs
- **Desktop**: Persistent sidebar with collapsible sections
- **Global**: Floating action buttons for quick note creation
- **Universal**: Command palette accessible via keyboard shortcut

### Overlay-First Approach
Authentication, settings, and detailed forms appear as overlays to maintain context and reduce navigation friction. All authentication flows (login, signup, verification, password reset) are contextual overlays that appear over any protected page.

### Drawer System
Secondary content and tools slide in from edges:
- **Left Drawer**: Extended navigation, tag browser, note tree
- **Right Drawer**: Collaboration tools, comments, activity feed
- **Bottom Drawer**: Quick actions, search results, notifications

## Essential Pages vs Overlays/Drawers

### Essential Pages (Full Navigation Required)
1. **Landing Page** (`/`) - Marketing/welcome page for unauthenticated users
2. **Notes Dashboard** (`/notes`) - Main workspace with note grid/list
3. **Note Editor** (`/notes/[id]`) - Full-screen note editing interface
4. **Blog Listing** (`/blog`) - Public blog posts discovery
5. **Blog Post View** (`/blog/[id]`) - Individual blog post reading
6. **Shared Notes** (`/shared`) - Notes shared with user
7. **Settings Page** (`/settings`) - Unified settings with Profile, Settings, and Preferences tabs

### Overlays (Modal-style, Context Preserving)
- **Authentication Suite**: Login, signup, verification, password reset
- **Note Creation**: Quick note creator with template selection
- **Tag Manager**: Create, edit, organize tags
- **Collaborator Invitation**: Share notes and manage permissions
- **Extension Installation**: Browse and install extensions from marketplace
- **Settings Panels**: All user preferences and configuration
- **API Key Management**: Create and manage developer keys
- **Data Export/Import**: Backup and restore operations
- **Billing Interface**: Subscription and payment management
- **Confirmation Dialogs**: Delete, archive, publish confirmations

### Drawers (Slide-in Panels)
- **Extended Navigation**: Full app navigation with recent items
- **Global Search**: Cross-content search with live results
- **Comments Thread**: Note discussions and reactions
- **Activity Feed**: Recent changes and collaboration updates
- **Notification Center**: All user notifications and alerts
- **Tag Browser**: Navigate and filter by tags
- **Note Tree**: Hierarchical note organization
- **Extension Settings**: Configure individual extension options
- **Quick Actions**: Common tasks and shortcuts
- **User Menu**: Profile, settings, logout options
- **Attachment Viewer**: Preview note attachments and media
- **Collaboration Panel**: Live collaborators and permissions
- **Version History**: Note edit history and restoration
- **Template Gallery**: Note templates and layouts
- **Keyboard Shortcuts**: Help and command reference

### Bottom Navigation Tabs (Mobile)
1. **Notes** - Main note workspace
2. **Search** - Global search and discovery
3. **Create** (+) - Quick note creation
4. **Shared** - Collaborative content
5. **More** - Settings, profile, additional features

### Sidebar Sections (Desktop)
1. **Recent Notes** - Quick access to recent work
2. **My Notes** - Personal note organization
3. **Shared with Me** - Collaborative content
4. **Tags** - Topic-based organization
5. **Extensions** - Plugin management
6. **Settings** - Configuration and preferences

This architecture minimizes full-page navigations by using overlays for forms and settings, drawers for contextual information, and reserving page transitions only for distinct content types or major workflow changes.

## Screen State Templates & Reusable Components

### Global Templates (GT)
- **GT1**: Unauthenticated state (landing page layout)
- **GT2**: Authenticated app shell (sidebar/bottom nav + main content)
- **GT3**: Overlay backdrop (darkened background with modal)
- **GT4**: Drawer backdrop (partial background with slide panel)
- **GT5**: Full-screen editor (minimal chrome, focus mode)

### Navigation States (NS)
- **NS1**: Mobile bottom nav (5 tabs: Notes, Search, Create, Shared, More)
- **NS2**: Desktop sidebar collapsed
- **NS3**: Desktop sidebar expanded
- **NS4**: Mobile with left drawer open
- **NS5**: Mobile with right drawer open

### Content States (CS)
- **CS1**: Empty state (no content, onboarding prompts)
- **CS2**: Loading state (skeleton screens, spinners)
- **CS3**: Grid view (card layout for notes/blog)
- **CS4**: List view (compact rows for notes/blog)
- **CS5**: Detail view (single item focus)
- **CS6**: Error state (network/permission errors)

### Authentication States (AS)
- **AS1**: Login form overlay
- **AS2**: Signup form overlay
- **AS3**: Email verification overlay
- **AS4**: Phone verification overlay
- **AS5**: Password reset overlay
- **AS6**: Magic link sent overlay
- **AS7**: Web3 wallet connection overlay

## Complete Screen State Inventory

### Essential Pages
1. **Landing Page** 
   - `LP-GT1-CS1`: First visit, unauthenticated
   - `LP-GT1-CS2`: Loading user session
   - `LP-GT1-AS1`: Login overlay active
   - `LP-GT1-AS2`: Signup overlay active

2. **Notes Dashboard**
   - `ND-GT2-NS1-CS1`: Mobile, empty notes
   - `ND-GT2-NS1-CS3`: Mobile, grid view with notes
   - `ND-GT2-NS1-CS4`: Mobile, list view with notes
   - `ND-GT2-NS2-CS3`: Desktop, sidebar collapsed, grid view
   - `ND-GT2-NS3-CS3`: Desktop, sidebar expanded, grid view
   - `ND-GT2-NS1-CS2`: Mobile loading state
   - `ND-GT2-NS4`: Mobile with left drawer (navigation) open
   - `ND-GT2-NS5`: Mobile with right drawer (filters) open

3. **Note Editor**
   - `NE-GT5-CS5`: Full-screen edit mode
   - `NE-GT2-CS5`: Regular edit with chrome
   - `NE-GT2-CS5-RD`: Right drawer open (comments)
   - `NE-GT2-CS5-LD`: Left drawer open (outline/tree)
   - `NE-GT3-CO`: Collaborator overlay active
   - `NE-GT3-SE`: Settings overlay active

4. **Blog Listing**
   - `BL-GT1-CS3`: Public view, grid layout
   - `BL-GT2-CS3`: Authenticated view, grid layout
   - `BL-GT1-CS1`: Empty blog state
   - `BL-GT1-CS2`: Loading blog posts

5. **Blog Post View**
   - `BPV-GT1-CS5`: Public reading view
   - `BPV-GT2-CS5`: Authenticated reading view
   - `BPV-GT2-CS5-RD`: Comments drawer open
   - `BPV-GT3-SH`: Share overlay active

6. **Shared Notes**
   - `SN-GT2-NS1-CS3`: Mobile, shared notes grid
   - `SN-GT2-NS3-CS3`: Desktop, shared notes grid
   - `SN-GT2-NS1-CS1`: No shared notes yet
   - `SN-GT2-NS5`: Mobile, collaboration drawer open

7. **Profile Page**
   - `PP-GT1-CS5`: Public profile view
   - `PP-GT2-CS5`: Own profile view
   - `PP-GT3-ED`: Edit profile overlay

### Key Overlays (Contextual)
- `OV-AS1` through `OV-AS7`: Authentication overlays
- `OV-NC`: Note creation overlay
- `OV-TM`: Tag manager overlay
- `OV-CI`: Collaborator invitation overlay
- `OV-EX`: Extension marketplace overlay
- `OV-ST`: Settings overlay
- `OV-API`: API key management overlay
- `OV-EXP`: Data export overlay
- `OV-BILL`: Billing overlay
- `OV-CONF`: Confirmation dialog overlay

### Key Drawers (Slide Panels)
- `DR-NAV-L`: Left navigation drawer
- `DR-SEARCH-L`: Left search drawer
- `DR-COMM-R`: Right comments drawer
- `DR-ACT-R`: Right activity feed drawer
- `DR-NOTIF-R`: Right notifications drawer
- `DR-TAG-L`: Left tag browser drawer
- `DR-TREE-L`: Left note tree drawer
- `DR-COLLAB-R`: Right collaboration panel drawer
- `DR-QUICK-B`: Bottom quick actions drawer
- `DR-USER-R`: Right user menu drawer

### Multi-State Combinations
- Any page + any overlay: `[PAGE]-[OVERLAY]`
- Any page + any drawer: `[PAGE]-[DRAWER]`
- Any page + overlay + drawer: `[PAGE]-[OVERLAY]-[DRAWER]`

### Special Flow States
- **Onboarding**: `ONB-1`, `ONB-2`, `ONB-3` (welcome steps)
- **Error Recovery**: `ERR-NETWORK`, `ERR-AUTH`, `ERR-PERMISSION`
- **Offline Mode**: `OFF-[any base state]`
- **Collaboration Live**: `COLLAB-[any note state]` (with live cursors)

### Design Context Rules
1. **Consistency**: All GT2 states share same shell layout
2. **Responsiveness**: NS1-NS5 determine navigation appearance
3. **Layering**: Overlays (GT3) always on top, drawers (GT4) slide from edges
4. **Content Priority**: CS1-CS6 determine main content area appearance
5. **Authentication**: AS1-AS7 can appear over any page requiring auth
6. **State Inheritance**: Combined states inherit properties from base states

FINAL NOTES:

### color and feel

dark modes use a very dark shade of brown for foregrounds, light mode uses brownish white for foregrounds. backgrounds use dark shades of ash in dark mode and ash-white in light mode for background (it is allowed to use sun-yellow shades sometimes to avoid an excessively monotonous feeling in some places). make use of 3d feels, as much as possible, expressive design, design that feels solid with 3d look and feel, shadows, border radius on everything, subtle hues. at the same time with muted unobstructive backgrounds where necessary. 