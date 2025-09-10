# Backend API Endpoints

This document lists the available backend endpoints exposed by the NestJS API.

Base URL: /

Notes:
- Unless marked Public/Unprotected, endpoints require authentication via Keycloak integration and may be subject to guards/roles.
- Guards listed are applied at the route level.


Root Controller
- GET / — Unprotected. Returns hello message.
- GET /health — Unprotected. Returns API and database health status.
- GET /db/test — Requires authentication. Tests database connectivity and returns stats.

Auth Controller (/auth)
- GET /auth/health — Public + Unprotected. Simple health for auth module.
- GET /auth/me — Authenticated. Returns current user basic info.
- GET /auth/profile — Authenticated. Returns full user profile with teams.
- GET /auth/admin — Authenticated. Roles required: realm-admin. Returns admin info.
- POST /auth/test — Authenticated. Echo/test for authentication.

Teams Controller (/teams)
- GET /teams — Authenticated. List teams.
- GET /teams/:teamId — Authenticated. Guards: TeamMembershipGuard. Get team by id.
- POST /teams — Authenticated. Roles required: realm-admin or realm-team-lead. Create team.
- PATCH /teams/:teamId — Authenticated. Guards: TeamRoleGuard. Update team.
- DELETE /teams/:teamId — Authenticated. Guards: TeamRoleGuard. Delete team.
- GET /teams/:teamId/members — Authenticated. Guards: TeamMembershipGuard. List team members.
- POST /teams/:teamId/members — Authenticated. Guards: TeamRoleGuard. Add member to team.
- PATCH /teams/:teamId/members/:userId — Authenticated. Guards: TeamRoleGuard. Update member role.
- DELETE /teams/:teamId/members/:userId — Authenticated. Guards: TeamRoleGuard. Remove member from team.

Projects Controller (/projects)
- GET /projects — Authenticated. Optional query: teamId. List projects (optionally filtered by team).
- GET /projects/:projectId — Authenticated. Guards: ProjectTeamGuard. Get project by id.
- POST /projects — Authenticated. Guards: TeamMembershipGuard. Create project (validates membership using dto.teamId if provided).
- PATCH /projects/:projectId — Authenticated. Guards: ProjectTeamGuard. Update project.
- DELETE /projects/:projectId — Authenticated. Guards: ProjectTeamGuard. Delete project.


Auth/Role references
- Roles decorator uses nest-keycloak-connect with constants from auth/roles (e.g., REALM_ADMIN, REALM_TEAM_LEAD).
- Public decorator marks route as accessible without authentication.
- Unprotected from nest-keycloak-connect disables Keycloak guard on the route.
