import type { PublicUser } from "./user";

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectRole = "owner" | "editor" | "viewer";

export interface ProjectMember extends PublicUser {
  role: ProjectRole;
}
