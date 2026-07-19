import { Router, Response } from 'express';
import * as shapeService from './shape.service';
import { requireAuth, AuthedRequest } from '../auth/auth.middleware';

export const shapeRouter = Router();

shapeRouter.post('/projects/:projectId/shapes', requireAuth, addShapeHandler);
shapeRouter.get('/projects/:projectId/shapes', requireAuth, listShapesHandler);
shapeRouter.patch('/shapes/:id', requireAuth, editShapeHandler);
shapeRouter.delete('/shapes/:id', requireAuth, removeShapeHandler);

function handleServiceError(e: unknown, res: Response) {
  if (e instanceof Error && e.message === 'NOT_FOUND') {
    res.status(404).json({ error: e.message });
  } else if (e instanceof Error && e.message === 'FORBIDDEN') {
    res.status(403).json({ error: e.message });
  } else {
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
}

async function addShapeHandler(req: AuthedRequest<{ projectId: string }>, res: Response) {
  try {
    const { projectId } = req.params;
    const { userId } = req.user!;
    const input = req.body;

    const shape = await shapeService.addShape(projectId, userId, input)
    res.status(201).json(shape);
  } catch (e) {
    handleServiceError(e, res);
  }
}

async function listShapesHandler(req: AuthedRequest<{projectId: string }>, res: Response) {
  try {
    const shapesList = await shapeService.listShapes(req.params.projectId, req.user!.userId);
    res.json(shapesList);
  } catch (e) {
    handleServiceError(e, res);
  }
}

async function editShapeHandler(req: AuthedRequest<{ id: string }>, res: Response) {
  try {
    const shape = await shapeService.editShape(req.params.id, req.user!.userId, req.body);
    res.json(shape);
  } catch (e) {
    handleServiceError(e, res);
  }
}

async function removeShapeHandler(req: AuthedRequest<{ id: string }>, res: Response) {
  try {
    await shapeService.removeShape(req.params.id, req.user!.userId);
    res.status(204).send();
  } catch (e) {
    handleServiceError(e, res);
  }
}
