/**
 * 🔧 Development Adapters - محولات التطوير
 * GitHub, GitLab, Jira, Notion, Linear
 */

import { IntegrationAdapter, Integration, IntegrationType } from '../integration_manager';

// ═══════════════════════════════════════════════════════════════════════════════
// GitHub Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class GitHubAdapter implements IntegrationAdapter {
  type = IntegrationType.GITHUB;
  private baseUrl = 'https://api.github.com';

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: this.getHeaders(integration),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: {
    action: 'create_issue' | 'create_pr' | 'comment' | 'webhook' | 'create_repo';
    owner?: string;
    repo?: string;
    title?: string;
    body?: string;
    issueNumber?: number;
    head?: string;
    base?: string;
  }): Promise<any> {
    let endpoint = this.baseUrl;
    const method = 'POST';
    let payload: any = {};

    switch (data.action) {
      case 'create_issue':
        endpoint += `/repos/${data.owner}/${data.repo}/issues`;
        payload = { title: data.title, body: data.body };
        break;
      case 'create_pr':
        endpoint += `/repos/${data.owner}/${data.repo}/pulls`;
        payload = { title: data.title, body: data.body, head: data.head, base: data.base || 'main' };
        break;
      case 'comment':
        endpoint += `/repos/${data.owner}/${data.repo}/issues/${data.issueNumber}/comments`;
        payload = { body: data.body };
        break;
      case 'create_repo':
        endpoint += '/user/repos';
        payload = { name: data.title, description: data.body, private: true };
        break;
    }

    const response = await fetch(endpoint, {
      method,
      headers: this.getHeaders(integration),
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`GitHub error: ${result.message}`);
    }
    return result;
  }

  private getHeaders(integration: Integration): Record<string, string> {
    return {
      'Authorization': `Bearer ${integration.credentials.accessToken}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GitLab Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class GitLabAdapter implements IntegrationAdapter {
  type = IntegrationType.GITLAB;

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const baseUrl = integration.credentials.url || 'https://gitlab.com';
      const response = await fetch(`${baseUrl}/api/v4/user`, {
        headers: {
          'PRIVATE-TOKEN': integration.credentials.accessToken!,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: {
    action: 'create_issue' | 'create_mr' | 'comment';
    projectId: number;
    title?: string;
    description?: string;
    issueIid?: number;
    sourceBranch?: string;
    targetBranch?: string;
    body?: string;
  }): Promise<any> {
    const baseUrl = integration.credentials.url || 'https://gitlab.com';
    let endpoint = `${baseUrl}/api/v4`;
    let payload: any = {};

    switch (data.action) {
      case 'create_issue':
        endpoint += `/projects/${data.projectId}/issues`;
        payload = { title: data.title, description: data.description };
        break;
      case 'create_mr':
        endpoint += `/projects/${data.projectId}/merge_requests`;
        payload = {
          title: data.title,
          description: data.description,
          source_branch: data.sourceBranch,
          target_branch: data.targetBranch || 'main',
        };
        break;
      case 'comment':
        endpoint += `/projects/${data.projectId}/issues/${data.issueIid}/notes`;
        payload = { body: data.body };
        break;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'PRIVATE-TOKEN': integration.credentials.accessToken!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`GitLab error: ${result.message || result.error}`);
    }
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Jira Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class JiraAdapter implements IntegrationAdapter {
  type = IntegrationType.JIRA;

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch(`${integration.credentials.domain}/rest/api/3/myself`, {
        headers: this.getHeaders(integration),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: {
    action: 'create_issue' | 'update_issue' | 'add_comment' | 'transition';
    projectKey?: string;
    issueType?: string;
    summary?: string;
    description?: string;
    issueKey?: string;
    body?: string;
    transitionId?: string;
    fields?: Record<string, any>;
  }): Promise<any> {
    const baseUrl = integration.credentials.domain;
    let endpoint = `${baseUrl}/rest/api/3`;
    let method = 'POST';
    let payload: any = {};

    switch (data.action) {
      case 'create_issue':
        endpoint += '/issue';
        payload = {
          fields: {
            project: { key: data.projectKey },
            summary: data.summary,
            description: {
              type: 'doc',
              version: 1,
              content: [{ type: 'paragraph', content: [{ type: 'text', text: data.description || '' }] }],
            },
            issuetype: { name: data.issueType || 'Task' },
            ...data.fields,
          },
        };
        break;
      case 'update_issue':
        endpoint += `/issue/${data.issueKey}`;
        method = 'PUT';
        payload = { fields: data.fields };
        break;
      case 'add_comment':
        endpoint += `/issue/${data.issueKey}/comment`;
        payload = {
          body: {
            type: 'doc',
            version: 1,
            content: [{ type: 'paragraph', content: [{ type: 'text', text: data.body || '' }] }],
          },
        };
        break;
      case 'transition':
        endpoint += `/issue/${data.issueKey}/transitions`;
        payload = { transition: { id: data.transitionId } };
        break;
    }

    const response = await fetch(endpoint, {
      method,
      headers: this.getHeaders(integration),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Jira error: ${JSON.stringify(error.errors || error)}`);
    }
    
    return method === 'PUT' ? { success: true } : await response.json();
  }

  private getHeaders(integration: Integration): Record<string, string> {
    const auth = Buffer.from(`${integration.credentials.email}:${integration.credentials.apiToken}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Notion Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class NotionAdapter implements IntegrationAdapter {
  type = IntegrationType.NOTION;
  private baseUrl = 'https://api.notion.com/v1';

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: this.getHeaders(integration),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: {
    action: 'create_page' | 'update_page' | 'append_blocks' | 'create_database';
    databaseId?: string;
    pageId?: string;
    properties?: Record<string, any>;
    children?: any[];
    title?: string;
  }): Promise<any> {
    let endpoint = this.baseUrl;
    let method = 'POST';
    let payload: any = {};

    switch (data.action) {
      case 'create_page':
        endpoint += '/pages';
        payload = {
          parent: { database_id: data.databaseId },
          properties: data.properties,
          children: data.children || [],
        };
        break;
      case 'update_page':
        endpoint += `/pages/${data.pageId}`;
        method = 'PATCH';
        payload = { properties: data.properties };
        break;
      case 'append_blocks':
        endpoint += `/blocks/${data.pageId}/children`;
        method = 'PATCH';
        payload = { children: data.children };
        break;
      case 'create_database':
        endpoint += '/databases';
        payload = {
          parent: { page_id: data.pageId },
          title: [{ type: 'text', text: { content: data.title || 'New Database' } }],
          properties: data.properties,
        };
        break;
    }

    const response = await fetch(endpoint, {
      method,
      headers: this.getHeaders(integration),
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Notion error: ${result.message}`);
    }
    return result;
  }

  private getHeaders(integration: Integration): Record<string, string> {
    return {
      'Authorization': `Bearer ${integration.credentials.accessToken}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Linear Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class LinearAdapter implements IntegrationAdapter {
  type = IntegrationType.LINEAR;
  private baseUrl = 'https://api.linear.app/graphql';

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(integration),
        body: JSON.stringify({
          query: '{ viewer { id name } }',
        }),
      });
      const data = await response.json();
      return !!data.data?.viewer?.id;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: {
    action: 'create_issue' | 'update_issue' | 'create_comment';
    teamId?: string;
    title?: string;
    description?: string;
    issueId?: string;
    body?: string;
    priority?: number;
    stateId?: string;
    assigneeId?: string;
  }): Promise<any> {
    let mutation = '';
    let variables: Record<string, any> = {};

    switch (data.action) {
      case 'create_issue':
        mutation = `
          mutation CreateIssue($teamId: String!, $title: String!, $description: String, $priority: Int, $assigneeId: String) {
            issueCreate(input: { 
              teamId: $teamId, 
              title: $title, 
              description: $description,
              priority: $priority,
              assigneeId: $assigneeId
            }) {
              success
              issue { id identifier title url }
            }
          }
        `;
        variables = {
          teamId: data.teamId,
          title: data.title,
          description: data.description,
          priority: data.priority,
          assigneeId: data.assigneeId,
        };
        break;
      case 'update_issue':
        mutation = `
          mutation UpdateIssue($issueId: String!, $title: String, $description: String, $stateId: String, $priority: Int) {
            issueUpdate(id: $issueId, input: { 
              title: $title, 
              description: $description,
              stateId: $stateId,
              priority: $priority
            }) {
              success
              issue { id identifier title state { name } }
            }
          }
        `;
        variables = {
          issueId: data.issueId,
          title: data.title,
          description: data.description,
          stateId: data.stateId,
          priority: data.priority,
        };
        break;
      case 'create_comment':
        mutation = `
          mutation CreateComment($issueId: String!, $body: String!) {
            commentCreate(input: { issueId: $issueId, body: $body }) {
              success
              comment { id body createdAt }
            }
          }
        `;
        variables = { issueId: data.issueId, body: data.body };
        break;
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(integration),
      body: JSON.stringify({ query: mutation, variables }),
    });

    const result = await response.json();
    if (result.errors) {
      throw new Error(`Linear error: ${result.errors[0].message}`);
    }
    return result.data;
  }

  private getHeaders(integration: Integration): Record<string, string> {
    return {
      'Authorization': integration.credentials.apiKey!,
      'Content-Type': 'application/json',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Export all adapters
// ═══════════════════════════════════════════════════════════════════════════════

export const developmentAdapters = [
  new GitHubAdapter(),
  new GitLabAdapter(),
  new JiraAdapter(),
  new NotionAdapter(),
  new LinearAdapter(),
];
