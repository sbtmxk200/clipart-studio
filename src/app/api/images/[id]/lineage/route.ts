// Design Ref: §5.4 LineageTree — parents + children up to 3 levels.
// Ancestors chain follows parent_image_id upward, descendants query children per level.
// RLS applies at every step, so anything the caller isn't allowed to see is skipped.

import { apiError, apiOk } from '@/lib/api-error';
import { publicUrl } from '@/services/r2/upload';
import { createSupabaseServerClient } from '@/services/supabase/server';

const MAX_LEVELS = 3;

export interface LineageNode {
  id: string;
  prompt: string;
  thumbnailUrl: string;
  parentImageId: string | null;
}

interface LineageResponse {
  self: LineageNode;
  ancestors: LineageNode[]; // ordered from immediate parent (index 0) to great-grandparent
  descendants: LineageNode[][]; // levels[0] = direct children, levels[1] = grandchildren, ...
  ancestorTruncated: boolean;
  descendantTruncated: boolean;
}

interface RowShape {
  id: string;
  prompt: string;
  r2_key: string;
  thumbnail_r2_key: string | null;
  parent_image_id: string | null;
}

function toNode(row: RowShape): LineageNode {
  return {
    id: row.id,
    prompt: row.prompt,
    thumbnailUrl: publicUrl(row.thumbnail_r2_key ?? row.r2_key),
    parentImageId: row.parent_image_id ?? null,
  };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError('UNAUTHORIZED', '로그인이 필요합니다');

  const { data: selfRow } = await supabase
    .from('images')
    .select('id, prompt, r2_key, thumbnail_r2_key, parent_image_id')
    .eq('id', params.id)
    .maybeSingle();

  if (!selfRow) return apiError('NOT_FOUND', '이미지를 찾을 수 없습니다');
  const self = toNode(selfRow as RowShape);

  // Ancestors: walk parent_image_id up to MAX_LEVELS. Stop when null or truncated.
  const ancestors: LineageNode[] = [];
  let ancestorTruncated = false;
  let currentParentId = self.parentImageId;
  for (let level = 0; level < MAX_LEVELS && currentParentId; level += 1) {
    const { data: row } = await supabase
      .from('images')
      .select('id, prompt, r2_key, thumbnail_r2_key, parent_image_id')
      .eq('id', currentParentId)
      .maybeSingle();
    if (!row) break;
    const node = toNode(row as RowShape);
    ancestors.push(node);
    currentParentId = node.parentImageId;
  }
  if (currentParentId) ancestorTruncated = true;

  // Descendants: BFS by level. Cap each level's fanout to keep the payload small.
  const LEVEL_FANOUT_CAP = 12;
  const descendants: LineageNode[][] = [];
  let descendantTruncated = false;
  let frontier: string[] = [self.id];
  for (let level = 0; level < MAX_LEVELS && frontier.length > 0; level += 1) {
    const { data: rows } = await supabase
      .from('images')
      .select('id, prompt, r2_key, thumbnail_r2_key, parent_image_id')
      .in('parent_image_id', frontier)
      .order('created_at', { ascending: true })
      .limit(LEVEL_FANOUT_CAP);
    const nodes = (rows ?? []).map((r) => toNode(r as RowShape));
    if (nodes.length === 0) break;
    descendants.push(nodes);
    frontier = nodes.map((n) => n.id);
    if (nodes.length === LEVEL_FANOUT_CAP) descendantTruncated = true;
  }

  const body: LineageResponse = {
    self,
    ancestors,
    descendants,
    ancestorTruncated,
    descendantTruncated,
  };
  return apiOk(body);
}
