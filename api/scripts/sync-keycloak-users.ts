// scripts/sync-keycloak-users.ts
import { PrismaClient, Status } from '@prisma/client'

const prisma = new PrismaClient()

// Keycloak realm exportból származó adatok
const keycloakUsers = [
    {
        username: 'admin',
        email: 'admin@teamdashboard.com',
        firstName: 'Admin',
        lastName: 'User',
        attributes: {
            department: ['IT'],
            position: ['System Administrator'],
            access_level: ['full']
        },
        realmRoles: ['admin']
    },
    {
        username: 'teamlead1',
        email: 'teamlead1@teamdashboard.com',
        firstName: 'John',
        lastName: 'TeamLead',
        attributes: {
            department: ['Development'],
            position: ['Team Lead'],
            team_id: ['dev-team-1']
        },
        realmRoles: ['team-lead']
    },
    {
        username: 'member1',
        email: 'john.doe@teamdashboard.com',
        firstName: 'John',
        lastName: 'Doe',
        attributes: {
            department: ['Development'],
            position: ['Senior Developer'],
            team_id: ['dev-team-1']
        },
        realmRoles: ['member']
    },
    {
        username: 'member2',
        email: 'jane.smith@teamdashboard.com',
        firstName: 'Jane',
        lastName: 'Smith',
        attributes: {
            department: ['Design'],
            position: ['UX Designer']
        },
        realmRoles: ['member']
    }
]

async function syncKeycloakUsers() {
    console.log('🔄 Szinkronizálás indítása...')

    try {
        // 1. Admin felhasználó létrehozása először (mivel createdBy szükséges)
        console.log('👤 Admin felhasználó létrehozása...')

        const adminUser = await prisma.user.upsert({
            where: { email: 'admin@teamdashboard.com' },
            update: {
                firstName: 'Admin',
                lastName: 'User'
            },
            create: {
                keycloakId: 'admin-keycloak-id',
                email: 'admin@teamdashboard.com',
                firstName: 'Admin',
                lastName: 'User'
            }
        })

        console.log(`✅ Admin felhasználó: ${adminUser.id}`)

        // 2. Csapatok létrehozása
        console.log('📋 Csapatok létrehozása...')

        const teams = [
            {
                id: 'dev-team-1',
                name: 'Development Team 1',
                description: 'Frontend and Backend Development',
                createdBy: adminUser.id
            },
            {
                id: 'design-team',
                name: 'Design Team',
                description: 'UX/UI Design Team',
                createdBy: adminUser.id
            },
            {
                id: 'unassigned',
                name: 'Unassigned',
                description: 'Users without team assignment',
                createdBy: adminUser.id
            }
        ]

        const createdTeams: { [key: string]: any } = {}

        for (const team of teams) {
            const createdTeam = await prisma.team.upsert({
                where: { name: team.name },
                update: {
                    description: team.description
                },
                create: {
                    id: team.id,
                    name: team.name,
                    description: team.description,
                    createdBy: team.createdBy
                }
            })

            createdTeams[team.id] = createdTeam
            console.log(`✅ Csapat létrehozva/frissítve: ${team.name}`)
        }

        // 3. Felhasználók szinkronizálása (admin kivételével)
        console.log('👥 Felhasználók szinkronizálása...')

        for (const kcUser of keycloakUsers) {
            if (kcUser.username === 'admin') continue // Admin már létrehozva

            // User létrehozása/frissítése
            const user = await prisma.user.upsert({
                where: { email: kcUser.email },
                update: {
                    firstName: kcUser.firstName,
                    lastName: kcUser.lastName
                },
                create: {
                    keycloakId: `${kcUser.username}-keycloak-id`,
                    email: kcUser.email,
                    firstName: kcUser.firstName,
                    lastName: kcUser.lastName
                }
            })

            console.log(`✅ Felhasználó szinkronizálva: ${kcUser.username}`)

            // 4. Csapattagság beállítása
            const teamId = kcUser.attributes.team_id?.[0]

            if (teamId && createdTeams[teamId]) {
                // Egyszerű csapattagság beállítása - jogosultságok Keycloak-ból jönnek
                await prisma.teamMember.upsert({
                    where: {
                        userId_teamId: {
                            userId: user.id,
                            teamId: createdTeams[teamId].id
                        }
                    },
                    update: {
                        // Nincs role mező - minden jogosultság Keycloak-ból
                    },
                    create: {
                        userId: user.id,
                        teamId: createdTeams[teamId].id
                    }
                })

                console.log(`✅ Csapattagság beállítva: ${kcUser.username} → ${teamId}`)
            } else {
                // Ha nincs team_id, akkor unassigned csapatba
                await prisma.teamMember.upsert({
                    where: {
                        userId_teamId: {
                            userId: user.id,
                            teamId: createdTeams['unassigned'].id
                        }
                    },
                    update: {},
                    create: {
                        userId: user.id,
                        teamId: createdTeams['unassigned'].id
                    }
                })

                console.log(`✅ Felhasználó hozzáadva az unassigned csapathoz: ${kcUser.username}`)
            }
        }

        // 5. Admin hozzáadása minden csapathoz (kivéve unassigned)
        console.log('🔑 Admin tagság beállítása...')

        for (const [teamKey, team] of Object.entries(createdTeams)) {
            if (teamKey !== 'unassigned') {
                await prisma.teamMember.upsert({
                    where: {
                        userId_teamId: {
                            userId: adminUser.id,
                            teamId: team.id
                        }
                    },
                    update: {},
                    create: {
                        userId: adminUser.id,
                        teamId: team.id
                    }
                })
            }
        }

        console.log('✅ Admin tagság beállítva minden csapatban')
        console.log('🎉 Felhasználók szinkronizálása sikeresen befejezve!')

    } catch (error) {
        console.error('❌ Hiba a szinkronizálás során:', error)
        throw error
    }
}

async function initializeProjects() {
    console.log('📁 Projektek inicializálása...')

    try {
        // Felhasználók lekérése
        const users = await prisma.user.findMany({
            where: {
                email: {
                    in: [
                        'teamlead1@teamdashboard.com',
                        'member2-user@teamdashboard.com'  // Ha más email van member2-nek
                    ]
                }
            }
        })

        // Teams lekérése
        const teams = await prisma.team.findMany({
            where: {
                name: {
                    in: ['Development Team 1', 'Design Team']
                }
            }
        })

        const devTeam = teams.find(t => t.name === 'Development Team 1')
        const designTeam = teams.find(t => t.name === 'Design Team')
        const teamLead = users.find(u => u.email === 'teamlead1@teamdashboard.com')
        const designer = users.find(u => u.email === 'jane.smith@teamdashboard.com')

        if (!devTeam || !designTeam || !teamLead) {
            throw new Error('Required teams or users not found for project initialization')
        }

        const projects = [
            {
                id: 'proj-1',
                title: 'Frontend Redesign',
                description: 'Complete redesign of the user interface',
                status: Status.ACTIVE,
                teamId: devTeam.id,
                createdBy: teamLead.id
            },
            {
                id: 'proj-2',
                title: 'API Integration',
                description: 'Integration with third-party APIs',
                status: Status.ACTIVE,
                teamId: devTeam.id,
                createdBy: teamLead.id
            },
            {
                id: 'proj-3',
                title: 'Design System',
                description: 'Create comprehensive design system',
                status: Status.ACTIVE,
                teamId: designTeam.id,
                createdBy: designer?.id || teamLead.id
            },
            {
                id: 'proj-4',
                title: 'Mobile App',
                description: 'Mobile application development',
                status: Status.ACTIVE,
                teamId: devTeam.id,
                createdBy: teamLead.id
            }
        ]

        for (const project of projects) {
            await prisma.project.upsert({
                where: { id: project.id },
                update: {
                    title: project.title,
                    description: project.description,
                    status: project.status
                },
                create: {
                    id: project.id,
                    title: project.title,
                    description: project.description,
                    status: project.status,
                    teamId: project.teamId,
                    createdBy: project.createdBy
                }
            })

            console.log(`✅ Projekt létrehozva/frissítve: ${project.title}`)
        }

        // Projektekhez felhasználók hozzárendelése
        console.log('👤 Projekt assignments beállítása...')

        const allUsers = await prisma.user.findMany()
        const allProjects = await prisma.project.findMany()

        // Projektekhez assignments
        const assignments = [
            // Frontend Redesign - dev team tagjai
            { projectTitle: 'Frontend Redesign', userEmail: 'teamlead1@teamdashboard.com' },
            { projectTitle: 'Frontend Redesign', userEmail: 'john.doe@teamdashboard.com' },
            { projectTitle: 'Frontend Redesign', userEmail: 'jane.smith@teamdashboard.com' }, // Designer is részt vesz
            // API Integration - dev team
            { projectTitle: 'API Integration', userEmail: 'teamlead1@teamdashboard.com' },
            { projectTitle: 'API Integration', userEmail: 'john.doe@teamdashboard.com' },
            // Design System - designer
            { projectTitle: 'Design System', userEmail: 'jane.smith@teamdashboard.com' },
            // Mobile App - team lead
            { projectTitle: 'Mobile App', userEmail: 'teamlead1@teamdashboard.com' }
        ]

        for (const assignment of assignments) {
            const project = allProjects.find(p => p.title === assignment.projectTitle)
            const user = allUsers.find(u => u.email === assignment.userEmail)

            if (project && user) {
                await prisma.projectAssignment.upsert({
                    where: {
                        projectId_userId: {
                            projectId: project.id,
                            userId: user.id
                        }
                    },
                    update: {},
                    create: {
                        projectId: project.id,
                        userId: user.id
                    }
                })

                console.log(`✅ Assignment: ${user.firstName} ${user.lastName} → ${project.title}`)
            }
        }

        console.log('🎉 Projektek inicializálása befejezve!')

    } catch (error) {
        console.error('❌ Hiba a projekt inicializálás során:', error)
        throw error
    }
}

// Activity példák létrehozása
async function createSampleActivities() {
    console.log('📝 Mintaaktivitások létrehozása...')

    try {
        const users = await prisma.user.findMany()
        const teams = await prisma.team.findMany()
        const projects = await prisma.project.findMany()

        const admin = users.find(u => u.email === 'admin@teamdashboard.com')
        const teamLead = users.find(u => u.email === 'teamlead1@teamdashboard.com')

        if (!admin || !teamLead) return

        const activities = [
            {
                type: 'team_created',
                actorUserId: admin.id,
                teamId: teams.find(t => t.name === 'Development Team 1')?.id,
                payload: { teamName: 'Development Team 1' }
            },
            {
                type: 'project_created',
                actorUserId: teamLead.id,
                teamId: teams.find(t => t.name === 'Development Team 1')?.id,
                projectId: projects.find(p => p.title === 'Frontend Redesign')?.id,
                payload: { projectTitle: 'Frontend Redesign' }
            },
            {
                type: 'user_joined_team',
                actorUserId: teamLead.id,
                teamId: teams.find(t => t.name === 'Development Team 1')?.id,
                payload: { role: 'MEMBER' }
            }
        ]

        for (const activity of activities) {
            if (activity.teamId || activity.projectId) { // Only create if we have valid references
                await prisma.activity.create({
                    data: activity
                })
            }
        }

        console.log('✅ Mintaaktivitások létrehozva')

    } catch (error) {
        console.error('❌ Hiba az aktivitások létrehozása során:', error)
        // Don't throw, activities are optional
    }
}

// Főfunkció
async function main() {
    try {
        await syncKeycloakUsers()
        await initializeProjects()
        await createSampleActivities()
        console.log('🎉 Teljes inicializálás befejezve!')
    } catch (error) {
        console.error('❌ Hiba az inicializálás során:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

// Script futtatása
if (require.main === module) {
    main()
}

export { syncKeycloakUsers, initializeProjects }