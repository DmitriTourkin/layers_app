import * as projectRepository from './project.repository';
import { Project } from 'shared';

export async function listMyProjects(ownerId: string): Promise<Project[]> {
    return await projectRepository.getProjectsByOwner(ownerId);
}

export async function getProject(id: string, reqUserId: string): Promise<Project> {
  const project = await projectRepository.getProjectById(id);
  if (!project) throw new Error("NOT_FOUND");
  if (project.ownerId !== reqUserId) throw new Error("FORBIDDEN");
  
  return project;
}

export async function createProject(name: string, ownerId: string): Promise<Project> {
  return await projectRepository.createProject(ownerId, name);
}

export async function removeProject(id: string, reqUserId: string): Promise<void> {
  await getProject(id, reqUserId);
  await projectRepository.deleteProject(id);
}

export async function renameProject(id: string, name: string, reqUserId: string): Promise<Project> {
  await getProject(id, reqUserId);
  
  return projectRepository.updateProjectName(id, name);
}

export async function getProjectById(id: string): Promise<Project> {
  let project = await projectRepository.getProjectById(id);
  if (!project) throw new Error("NOT_FOUND");
 
  return project;
}