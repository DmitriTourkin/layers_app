import Router from 'express';
import { Request, Response } from 'express';
import * as projectService from './project.service';
import { AuthedRequest, requireAuth } from '../auth/auth.middleware';

export const projectRouter = Router();

projectRouter.post('/', requireAuth, createProjectHandler);
projectRouter.get("/", requireAuth, listProjectsHandler);
projectRouter.get('/:id', requireAuth, getProjectHandler);
projectRouter.patch('/:id', requireAuth, renameProjectHandler);
projectRouter.delete('/:id', requireAuth, deleteProjectHandler);

function handleServiceError(e: unknown, res: Response) {
  if (e instanceof Error && e.message === 'NOT_FOUND') {
    res.status(404).json({ error: e.message});
  } else if (e instanceof Error && e.message === 'FORBIDDEN') {
    res.status(403).json({ error: e.message});
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



