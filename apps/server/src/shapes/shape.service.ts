import * as shapeRepository from './shape.repository';
import type { Shape, ShapeInput } from 'shared';
import { assertProjectAccess } from '../projects/project.service';


export async function addShape(projectId: string, userId: string, input: ShapeInput): Promise<Shape>{
  await assertProjectAccess(projectId, userId);

  return shapeRepository.createShape(projectId, userId, input);
}

export async function listShapes(projectId: string, userId: string): Promise<Shape[]> {
  await assertProjectAccess(projectId, userId);
  return shapeRepository.getShapesByProject(projectId)
}

export async function editShape(shapeId: string, userId: string, input: Partial<ShapeInput>): Promise<Shape>{
  const shape = await shapeRepository.getShapeById(shapeId);
  if (!shape) throw new Error('NOT_FOUND');
  await assertProjectAccess(shape.projectId, userId);
  return shapeRepository.updateShape(shapeId, input);
}

export async function removeShape(shapeId: string, userId: string): Promise<string> {
  const shape = await shapeRepository.getShapeById(shapeId);

  if (!shape) throw new Error('NOT_FOUND');

  await assertProjectAccess(shape.projectId, userId);
  await shapeRepository.deleteShape(shapeId);

  return shape.projectId;
}