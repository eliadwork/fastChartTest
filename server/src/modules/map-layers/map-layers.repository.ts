import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';

import {
  MAP_FALLBACK_COLOR,
  USER_ROOT_FALLBACK_ID,
  USER_ROOT_NAME,
} from './map-layers.constants';
import {
  createDeterministicBaseId,
  createRuntimeId,
  deepClone,
  isLeafNode,
} from './map-layers.helpers';
import type { RawMapLayerNode, UserStorePayload } from './map-layers.types';

@Injectable()
export class MapLayersRepository {
  private readonly baseDataPath = path.resolve(__dirname, '../../../../public/data/bus-stops-israel.json');
  private readonly userDataPath = path.resolve(__dirname, '../../../data/user-layers.store.json');
  private readonly baseRootNode: RawMapLayerNode;

  constructor() {
    this.baseRootNode = this.loadBaseTreeFromDisk();
  }

  readBaseTree(): RawMapLayerNode {
    return deepClone(this.baseRootNode);
  }

  readUserStore(): UserStorePayload {
    this.ensureDataDirectory();

    if (!fs.existsSync(this.userDataPath)) {
      const defaultStore: UserStorePayload = {
        revision: Date.now(),
        userRoot: this.createDefaultUserRoot(),
      };
      this.saveUserStore(defaultStore);
      return deepClone(defaultStore);
    }

    const storeText = fs.readFileSync(this.userDataPath, 'utf-8');
    const parsedStore = JSON.parse(storeText) as UserStorePayload | RawMapLayerNode;
    const maybeStorePayload = parsedStore as Partial<UserStorePayload>;

    if (maybeStorePayload.userRoot != null && typeof maybeStorePayload.userRoot === 'object') {
      return {
        revision: typeof maybeStorePayload.revision === 'number' ? maybeStorePayload.revision : Date.now(),
        userRoot: this.normalizeUserNode(maybeStorePayload.userRoot as RawMapLayerNode),
      };
    }

    return {
      revision: Date.now(),
      userRoot: this.normalizeUserNode(parsedStore as RawMapLayerNode),
    };
  }

  saveUserStore(payload: UserStorePayload) {
    this.ensureDataDirectory();
    const normalizedPayload: UserStorePayload = {
      revision: payload.revision,
      userRoot: this.normalizeUserNode(payload.userRoot),
    };

    const tempPath = `${this.userDataPath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(normalizedPayload, null, 2), 'utf-8');
    fs.renameSync(tempPath, this.userDataPath);
  }

  private loadBaseTreeFromDisk(): RawMapLayerNode {
    const rawBaseText = fs.readFileSync(this.baseDataPath, 'utf-8');
    const parsedBaseNode = JSON.parse(rawBaseText) as RawMapLayerNode;
    return this.normalizeBaseNode(parsedBaseNode, ['root']);
  }

  private normalizeBaseNode(rawNode: RawMapLayerNode, pathTokens: string[]): RawMapLayerNode {
    const normalizedId =
      typeof rawNode.id === 'string' && rawNode.id.trim() !== ''
        ? rawNode.id
        : createDeterministicBaseId(rawNode.name, pathTokens);

    if (isLeafNode(rawNode)) {
      return {
        ...rawNode,
        id: normalizedId,
        source: 'mock',
      };
    }

    const children = Array.isArray(rawNode.children) ? rawNode.children : [];
    return {
      ...rawNode,
      id: normalizedId,
      source: 'mock',
      allowEdits: false,
      children: children.map((childNode, childIndex) =>
        this.normalizeBaseNode(childNode, [...pathTokens, `${childIndex}`])
      ),
    };
  }

  private normalizeUserNode(rawNode: RawMapLayerNode): RawMapLayerNode {
    const nodeId =
      typeof rawNode.id === 'string' && rawNode.id.trim() !== '' ? rawNode.id : createRuntimeId(rawNode.name);

    if (isLeafNode(rawNode)) {
      return {
        ...rawNode,
        id: nodeId,
        source: 'user',
        color: rawNode.color ?? MAP_FALLBACK_COLOR,
      };
    }

    const normalizedChildren = (rawNode.children ?? []).map((childNode) => this.normalizeUserNode(childNode));
    return {
      ...rawNode,
      id: nodeId,
      source: 'user',
      allowEdits: rawNode.allowEdits ?? true,
      children: normalizedChildren,
    };
  }

  private createDefaultUserRoot(): RawMapLayerNode {
    return {
      id: USER_ROOT_FALLBACK_ID,
      name: USER_ROOT_NAME,
      source: 'user',
      allowEdits: true,
      children: [],
    };
  }

  private ensureDataDirectory() {
    const dataDirectory = path.dirname(this.userDataPath);
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory, { recursive: true });
    }
  }
}
