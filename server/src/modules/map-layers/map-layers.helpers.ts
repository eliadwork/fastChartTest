import { MAP_FALLBACK_COLOR } from './map-layers.constants';
import type { RawMapLayerNode, TreeLookupResult } from './map-layers.types';

export const isLeafNode = (node: RawMapLayerNode) => typeof node.shape === 'string';

export const isGroupNode = (node: RawMapLayerNode) => !isLeafNode(node);

export const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const createRuntimeId = (name: string) => {
  const normalizedName = slugify(name) || 'node';
  return `runtime-${normalizedName}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
};

export const createDeterministicBaseId = (name: string, pathTokens: string[]) => {
  const normalizedName = slugify(name) || 'node';
  return `base-${pathTokens.join('-')}-${normalizedName}`;
};

export const findNodeRecursive = ({
  currentNode,
  targetId,
  parent,
  pathNodes,
}: {
  currentNode: RawMapLayerNode;
  targetId: string;
  parent: RawMapLayerNode | null;
  pathNodes: RawMapLayerNode[];
}): TreeLookupResult | null => {
  if (currentNode.id === targetId) {
    return {
      node: currentNode,
      parent,
      path: [...pathNodes, currentNode],
    };
  }

  if (!isGroupNode(currentNode) || !Array.isArray(currentNode.children)) {
    return null;
  }

  for (const childNode of currentNode.children) {
    const childResult = findNodeRecursive({
      currentNode: childNode,
      targetId,
      parent: currentNode,
      pathNodes: [...pathNodes, currentNode],
    });
    if (childResult != null) {
      return childResult;
    }
  }

  return null;
};

export const pathContainsNode = (pathNodes: RawMapLayerNode[], nodeId: string) =>
  pathNodes.some((pathNode) => pathNode.id === nodeId);

export const cloneNodeAsUserEditable = (rawNode: RawMapLayerNode): RawMapLayerNode => {
  if (isLeafNode(rawNode)) {
    return {
      ...rawNode,
      id: createRuntimeId(rawNode.name),
      source: 'user',
      color: rawNode.color ?? MAP_FALLBACK_COLOR,
    };
  }

  const clonedChildren = (rawNode.children ?? []).map((childNode) => cloneNodeAsUserEditable(childNode));
  return {
    ...rawNode,
    id: createRuntimeId(rawNode.name),
    source: 'user',
    allowEdits: true,
    children: clonedChildren,
  };
};
