import * as projectRepository from './project.repository';
import * as userRepository from '../auth/user.repository';
import type { Project, ProjectMember } from 'shared';

export async function listMyProjects(userId: string): Promise<Project[]> {
    return await projectRepository.getProjectsForUser(userId);
}

export async function getProject(id: string, reqUserId: string): Promise<Project> {
  const project = await getProjectById(id);
  if (project.ownerId !== reqUserId && !(await projectRepository.isMember(id, reqUserId))) {
    throw new Error("FORBIDDEN");
  }

  return project;
}

async function getOwnedProject(id: string, reqUserId: string): Promise<Project> {
  const project = await getProjectById(id);
  if (project.ownerId !== reqUserId) throw new Error("FORBIDDEN");

  return project;
}

export async function createProject(name: string, ownerId: string): Promise<Project> {
  return await projectRepository.createProject(ownerId, name);
}

export async function removeProject(id: string, reqUserId: string): Promise<void> {
  await getOwnedProject(id, reqUserId);
  await projectRepository.deleteProject(id);
}

export async function renameProject(id: string, name: string, reqUserId: string): Promise<Project> {
  await getOwnedProject(id, reqUserId);

  return projectRepository.updateProjectName(id, name);
}

export async function getProjectById(id: string): Promise<Project> {
  let project = await projectRepository.getProjectById(id);
  if (!project) throw new Error("NOT_FOUND");

  return project;
}

export async function assertProjectAccess(projectId: string, userId: string): Promise<void> {
  await getProject(projectId, userId);
}

export async function listMembers(projectId: string, reqUserId: string): Promise<ProjectMember[]> {
  const project = await getProject(projectId, reqUserId);
  const owner = await userRepository.getUserById(project.ownerId);
  const members = await projectRepository.getMembers(projectId);

  if (!owner) return members;
  return [{ id: owner.id, name: owner.name, email: owner.email, role: 'owner' }, ...members];
}

export async function inviteMember(projectId: string, email: string, reqUserId: string): Promise<ProjectMember> {
  const project = await getOwnedProject(projectId, reqUserId);

  const user = await userRepository.getUserByEmail(email);
  if (!user) throw new Error("USER_NOT_FOUND");
  if (user.id === project.ownerId) throw new Error("ALREADY_OWNER");

  await projectRepository.addMember(projectId, user.id, 'editor');
  return { id: user.id, name: user.name, email: user.email, role: 'editor' };
}
