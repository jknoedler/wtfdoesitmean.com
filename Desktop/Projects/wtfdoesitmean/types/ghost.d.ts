declare module '@tryghost/content-api' {
  export interface Post {
    id: string;
    title: string;
    slug: string;
    html: string;
    excerpt?: string;
    published_at: string;
    updated_at: string;
    tags?: Array<{ name: string; slug: string }>;
    meta_title?: string;
    meta_description?: string;
  }

  export interface Pagination {
    page: number;
    limit: number;
    pages: number;
    total: number;
    next: number | null;
    prev: number | null;
  }

  export interface PostsResponse {
    posts: Post[];
    meta: {
      pagination: Pagination;
    };
  }

  export default class GhostContentAPI {
    constructor(config: {
      url: string;
      key: string;
      version: string;
    });

    posts: {
      browse(options?: { 
        page?: number; 
        limit?: number | 'all';
        include?: string[];
        fields?: string[];
        filter?: string;
      }): Promise<PostsResponse>;
    };
  }
}

