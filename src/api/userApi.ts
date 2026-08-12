import type {  User } from "../features/requests/types";
import { apiFetch } from "./client";
import { mapApiUser } from "./mappers";
import type {  ApiUserDto } from "./types";

export async function getUsers(): Promise<User[]> {
    
  const apiUsers = await apiFetch<ApiUserDto[]>("/users");

  return apiUsers.map(mapApiUser);
}