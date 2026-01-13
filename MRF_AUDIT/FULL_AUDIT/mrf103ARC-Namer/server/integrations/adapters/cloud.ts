/**
 * ☁️ Cloud & Infrastructure Adapters - محولات السحابة والبنية التحتية
 * AWS, Vercel, Railway, Supabase
 */

import { IntegrationAdapter, Integration, IntegrationType } from '../integration_manager';
import * as crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════════
// AWS S3 Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class AWSS3Adapter implements IntegrationAdapter {
  type = IntegrationType.AWS;

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      // Test by listing buckets
      const result = await this.signedRequest(integration, {
        method: 'GET',
        service: 's3',
        host: 's3.amazonaws.com',
        path: '/',
      });
      return result.ok;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: {
    action: 'upload' | 'download' | 'delete' | 'list';
    bucket: string;
    key?: string;
    body?: Buffer | string;
    contentType?: string;
  }): Promise<any> {
    const region = integration.config.region || 'us-east-1';
    const host = `${data.bucket}.s3.${region}.amazonaws.com`;

    switch (data.action) {
      case 'upload': {
        const response = await this.signedRequest(integration, {
          method: 'PUT',
          service: 's3',
          host,
          path: `/${data.key}`,
          body: data.body,
          headers: {
            'Content-Type': data.contentType || 'application/octet-stream',
          },
        });
        return { success: response.ok, url: `https://${host}/${data.key}` };
      }
      case 'download': {
        const response = await this.signedRequest(integration, {
          method: 'GET',
          service: 's3',
          host,
          path: `/${data.key}`,
        });
        return response;
      }
      case 'delete': {
        const response = await this.signedRequest(integration, {
          method: 'DELETE',
          service: 's3',
          host,
          path: `/${data.key}`,
        });
        return { success: response.ok };
      }
      case 'list': {
        const response = await this.signedRequest(integration, {
          method: 'GET',
          service: 's3',
          host,
          path: '/',
        });
        return response.text();
      }
    }
  }

  private async signedRequest(integration: Integration, options: {
    method: string;
    service: string;
    host: string;
    path: string;
    body?: any;
    headers?: Record<string, string>;
  }): Promise<Response> {
    const region = integration.config.region || 'us-east-1';
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);

    const headers: Record<string, string> = {
      'Host': options.host,
      'X-Amz-Date': amzDate,
      ...options.headers,
    };

    // AWS Signature Version 4 signing
    const canonicalHeaders = Object.entries(headers)
      .sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()))
      .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}`)
      .join('\n') + '\n';

    const signedHeaders = Object.keys(headers)
      .map(k => k.toLowerCase())
      .sort()
      .join(';');

    const payloadHash = crypto.createHash('sha256')
      .update(options.body || '')
      .digest('hex');

    const canonicalRequest = [
      options.method,
      options.path,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/${options.service}/aws4_request`;

    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    const kDate = crypto.createHmac('sha256', `AWS4${integration.credentials.secretAccessKey}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(options.service).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    const authorizationHeader = `${algorithm} Credential=${integration.credentials.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return fetch(`https://${options.host}${options.path}`, {
      method: options.method,
      headers: {
        ...headers,
        'Authorization': authorizationHeader,
      },
      body: options.body,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Vercel Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class VercelAdapter implements IntegrationAdapter {
  type = IntegrationType.VERCEL;
  private baseUrl = 'https://api.vercel.com';

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v9/projects`, {
        headers: this.getHeaders(integration),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: {
    action: 'deploy' | 'list_deployments' | 'get_project' | 'create_env';
    projectId?: string;
    files?: Record<string, string>;
    envKey?: string;
    envValue?: string;
    target?: 'production' | 'preview' | 'development';
  }): Promise<any> {
    let endpoint = this.baseUrl;
    let method = 'GET';
    let payload: any = {};

    switch (data.action) {
      case 'deploy':
        endpoint += '/v13/deployments';
        method = 'POST';
        payload = {
          name: data.projectId,
          files: Object.entries(data.files || {}).map(([file, data]) => ({
            file,
            data,
          })),
          target: data.target || 'production',
        };
        break;
      case 'list_deployments':
        endpoint += `/v6/deployments?projectId=${data.projectId}`;
        break;
      case 'get_project':
        endpoint += `/v9/projects/${data.projectId}`;
        break;
      case 'create_env':
        endpoint += `/v10/projects/${data.projectId}/env`;
        method = 'POST';
        payload = {
          key: data.envKey,
          value: data.envValue,
          target: [data.target || 'production'],
          type: 'encrypted',
        };
        break;
    }

    const response = await fetch(endpoint, {
      method,
      headers: this.getHeaders(integration),
      body: method !== 'GET' ? JSON.stringify(payload) : undefined,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Vercel error: ${result.error?.message || JSON.stringify(result)}`);
    }
    return result;
  }

  private getHeaders(integration: Integration): Record<string, string> {
    return {
      'Authorization': `Bearer ${integration.credentials.apiToken}`,
      'Content-Type': 'application/json',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Railway Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class RailwayAdapter implements IntegrationAdapter {
  type = IntegrationType.RAILWAY;
  private baseUrl = 'https://backboard.railway.app/graphql/v2';

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(integration),
        body: JSON.stringify({
          query: '{ me { id email } }',
        }),
      });
      const data = await response.json();
      return !!data.data?.me?.id;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: {
    action: 'deploy' | 'restart' | 'list_projects' | 'get_deployment' | 'set_variable';
    projectId?: string;
    serviceId?: string;
    environmentId?: string;
    variableName?: string;
    variableValue?: string;
  }): Promise<any> {
    let query = '';
    let variables: Record<string, any> = {};

    switch (data.action) {
      case 'list_projects':
        query = `
          query { 
            projects { 
              edges { 
                node { id name description updatedAt } 
              } 
            } 
          }
        `;
        break;
      case 'restart':
        query = `
          mutation RestartDeployment($deploymentId: String!) {
            deploymentRestart(id: $deploymentId)
          }
        `;
        variables = { deploymentId: data.serviceId };
        break;
      case 'set_variable':
        query = `
          mutation SetVariable($projectId: String!, $environmentId: String!, $serviceId: String!, $name: String!, $value: String!) {
            variableUpsert(input: {
              projectId: $projectId
              environmentId: $environmentId
              serviceId: $serviceId
              name: $name
              value: $value
            })
          }
        `;
        variables = {
          projectId: data.projectId,
          environmentId: data.environmentId,
          serviceId: data.serviceId,
          name: data.variableName,
          value: data.variableValue,
        };
        break;
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(integration),
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    if (result.errors) {
      throw new Error(`Railway error: ${result.errors[0].message}`);
    }
    return result.data;
  }

  private getHeaders(integration: Integration): Record<string, string> {
    return {
      'Authorization': `Bearer ${integration.credentials.apiToken}`,
      'Content-Type': 'application/json',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Supabase Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class SupabaseAdapter implements IntegrationAdapter {
  type = IntegrationType.SUPABASE;

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch(`${integration.credentials.url}/rest/v1/`, {
        headers: {
          'apikey': integration.credentials.anonKey!,
          'Authorization': `Bearer ${integration.credentials.serviceRoleKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: {
    action: 'query' | 'insert' | 'update' | 'delete' | 'rpc';
    table?: string;
    query?: string;
    data?: any;
    filters?: Record<string, any>;
    functionName?: string;
    params?: any;
  }): Promise<any> {
    const baseUrl = integration.credentials.url;
    const headers: Record<string, string> = {
      'apikey': integration.credentials.anonKey!,
      'Authorization': `Bearer ${integration.credentials.serviceRoleKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };

    let endpoint = `${baseUrl}/rest/v1`;
    let method = 'GET';
    let body: any;

    switch (data.action) {
      case 'query':
        endpoint += `/${data.table}?${data.query || ''}`;
        break;
      case 'insert':
        endpoint += `/${data.table}`;
        method = 'POST';
        body = JSON.stringify(data.data);
        break;
      case 'update':
        endpoint += `/${data.table}?${Object.entries(data.filters || {}).map(([k, v]) => `${k}=eq.${v}`).join('&')}`;
        method = 'PATCH';
        body = JSON.stringify(data.data);
        break;
      case 'delete':
        endpoint += `/${data.table}?${Object.entries(data.filters || {}).map(([k, v]) => `${k}=eq.${v}`).join('&')}`;
        method = 'DELETE';
        break;
      case 'rpc':
        endpoint += `/rpc/${data.functionName}`;
        method = 'POST';
        body = JSON.stringify(data.params);
        break;
    }

    const response = await fetch(endpoint, { method, headers, body });
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Supabase error: ${result.message || JSON.stringify(result)}`);
    }
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Export all adapters
// ═══════════════════════════════════════════════════════════════════════════════

export const cloudAdapters = [
  new AWSS3Adapter(),
  new VercelAdapter(),
  new RailwayAdapter(),
  new SupabaseAdapter(),
];
