// Supabase Data Storage - Replaces Firebase Firestore
// This file uses Supabase for all data storage (users, projects, shared projects)
// Authentication is handled by Supabase (see src/lib/supabase.ts)
import { supabase } from "./supabase";
import { Project } from "../types";

// User profile functions
export async function saveUserToSupabase(uid: string, data: { name: string; username: string; email: string; onboarded: boolean; avatarUrl?: string; preferences?: any }) {
  const { error } = await supabase
    .from('users')
    .upsert({ 
      id: uid,
      ...data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  
  if (error) throw error;
}

export async function getUserFromSupabase(uid: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', uid)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data;
}

// Project functions
export async function saveProjectToSupabase(uid: string, project: Project) {
  const { id, ...projectData } = project;
  const { error } = await supabase
    .from('projects')
    .upsert({
      id: project.id,
      user_id: uid,
      ...projectData,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  
  if (error) throw error;
}

export async function loadProjectsFromSupabase(uid: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', uid);
  
  if (error) throw error;
  
  return data || [];
}

export async function deleteProjectFromSupabase(projectId: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
  
  if (error) throw error;
}

// Share project snapshots
export async function shareProjectSnapshotSupabase(project: Project, userId: string): Promise<string> {
  const sharedId = "shared_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
  const { id, ...projectData } = project;
  
  const { error } = await supabase
    .from('shared_projects')
    .insert({
      id: sharedId,
      ...projectData,
      user_id: userId,
      shared_at: new Date().toISOString()
    });
  
  if (error) throw error;
  
  return sharedId;
}

// Fetch a shared project snapshot
export async function getSharedProjectSnapshotSupabase(sharedId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('shared_projects')
    .select('*')
    .eq('id', sharedId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data as Project;
}

// Complete cleanup of user data in Supabase
export async function deleteUserAccountAndDataSupabase(uid: string) {
  // 1. Delete all projects associated with user
  const { error: projectsError } = await supabase
    .from('projects')
    .delete()
    .eq('user_id', uid);
  
  if (projectsError) console.error("Failed to delete user projects:", projectsError);
  
  // 2. Delete user profile
  const { error: userError } = await supabase
    .from('users')
    .delete()
    .eq('id', uid);
  
  if (userError) console.error("Failed to delete user profile:", userError);
}

// Complaints/Feedback functions
export async function submitComplaintToSupabase(data: { email: string; category: string; message: string; timestamp: string }) {
  const { error } = await supabase
    .from('complaints')
    .insert(data);
  
  if (error) throw error;
}

export async function loadComplaintsFromSupabase() {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  
  return data || [];
}

export async function deleteComplaintFromSupabase(id: string) {
  const { error } = await supabase
    .from('complaints')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
