import { Router } from 'express';
import { Response } from 'express';
import * as projectService from './project.service';
import { AuthedRequest, requireAuth } from '../auth/auth.middleware';

export const projectRouter = Router();

projectRouter.post('/', requireAuth, createProjectHandler);
projectRouter.get("/", requireAuth, listProjectsHandler);
projectRouter.get('/:id', requireAuth, getProjectHandler);
projectRouter.patch('/:id', requireAuth, renameProjectHandler);
projectRouter.delete('/:id', requireAuth, deleteProjectHandler);
projectRouter.get('/:id/members', requireAuth, listMembersHandler);
projectRouter.post('/:id/members', requireAuth, inviteMemberHandler);

function handleServiceError(e: unknown, res: Response) {
  if (e instanceof Error && (e.message === 'NOT_FOUND' || e.message === 'USER_NOT_FOUND')) {
    res.status(404).json({ error: e.message});
  } else if (e instanceof Error && e.message === 'FORBIDDEN') {
    res.status(403).json({ error: e.message});
  } else if (e instanceof Error && e.message === 'ALREADY_OWNER') {
    res.status(409).json({ error: e.message});
  } else {
    res.status(500).json({ error: 'INTERNAL_ERROR'});
  }
}

async function createProjectHandler(req: AuthedRequest<{ id: string }>, res: Response) {
  const { name } = req.body;
  const project = await projectService.createProject(name, req.user!.userId);
  res.status(201).json(project);
}

async function listProjectsHandler(req: AuthedRequest<{ id: string }>, res: Response) {
  const projectList = await projectService.listMyProjects(req.user!.userId);
  res.json(projectList);
}

async function getProjectHandler(req: AuthedRequest<{ id: string }>, res: Response) {
  try {
    res.json(await projectService.getProject(req.params.id, req.user!.userId));
  } catch (e) {
    handleServiceError(e, res);
  }
}

async function renameProjectHandler(req: AuthedRequest<{ id: string }>, res: Response) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const { userId } = req.user!;

    const project = await projectService.renameProject(id, name, userId);
    res.json(project);
  } catch (e) {
    handleServiceError(e, res);
  }
}

async function deleteProjectHandler(req: AuthedRequest<{ id: string }>, res: Response) {
  try {
    await projectService.removeProject(req.params.id, req.user!.userId);
    res.status(204).send();
  } catch (e) {
    handleServiceError(e, res);
  }
}

async function listMembersHandler(req: AuthedRequest<{ id: string }>, res: Response) {
  try {
    res.json(await projectService.listMembers(req.params.id, req.user!.userId));
  } catch (e) {
    handleServiceError(e, res);
  }
}

async function inviteMemberHandler(req: AuthedRequest<{ id: string }>, res: Response) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  if (!email) {
    res.status(400).json({ error: 'INVALID_REQUEST' });
    return;
  }

  try {
    const member = await projectService.inviteMember(req.params.id, email, req.user!.userId);
    res.status(201).json(member);
  } catch (e) {
    handleServiceError(e, res);
  }
}



