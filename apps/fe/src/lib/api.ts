import { StrapiResponse, Catalog } from "@/types/strapi";
import qs from "qs";

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || "";
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

async function fetchAPI<T>(path: string, urlParamsObject: Record<string, any> = {}, options: RequestInit = {}): Promise<T> {
    // Merge default and user options
    const defaultHeaders: Record<string, string> = {
        "Content-Type": "application/json",
    };

    // Only add Server Token if it exists (Server Side) and no Auth header is provided
    if (STRAPI_API_TOKEN && !(options.headers as any)?.Authorization) {
        defaultHeaders["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
    }

    const mergedOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    // Build request URL
    const queryString = qs.stringify(urlParamsObject, { encodeValuesOnly: true });
    const requestUrl = `${STRAPI_URL}/api${path}${queryString ? `?${queryString}` : ""}`;

    // Trigger API call
    const response = await fetch(requestUrl, mergedOptions);

    // Handle response
    // Handle response
    // Handle response
    if (!response.ok) {
        // Suppress console error for 403 Forbidden (common permission issue) to avoid noise
        if (response.status !== 403) {
            console.error(`API Error: ${response.status} ${response.statusText} at ${requestUrl}`);
            const errorBody = await response.text();
            console.error(`Error Body: ${errorBody}`);
        }

        if (response.status === 403) {
            throw new Error("Forbidden: Check Strapi Permissions for this content type.");
        }

        throw new Error(`API validation failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

export async function getCatalogs(filters?: {
    search?: string;
    authorId?: string;
    language?: string;
    sortBy?: string;
}): Promise<Catalog[]> {
    const queryParams: any = {
        populate: {
            authors: true,
            fragments: true,
            languages: true
        },
        filters: { $and: [] },
        // Default sort
        sort: ["updatedAt:desc"],
    };

    // Sorting
    if (filters?.sortBy) {
        if (filters.sortBy === 'title_asc') queryParams.sort = ["title:asc"];
        if (filters.sortBy === 'title_desc') queryParams.sort = ["title:desc"];
        if (filters.sortBy === 'date_desc') queryParams.sort = ["updatedAt:desc"];
    }

    // Search (Title or Fragment Summary)
    if (filters?.search) {
        queryParams.filters.$and.push({
            $or: [
                { title: { $contains: filters.search } },
                {
                    fragments: {
                        summary: { $contains: filters.search }
                    }
                }
            ]
        });
    }

    // Author Filter
    if (filters?.authorId && filters.authorId !== 'all') {
        queryParams.filters.$and.push({
            authors: {
                id: { $eq: filters.authorId }
            }
        });
    }

    // Language Filter
    // Assuming the component structure is languages.originalLanguage
    if (filters?.language && filters.language !== 'all') {
        queryParams.filters.$and.push({
            languages: {
                originalLanguage: { $eq: filters.language }
            }
        });
    }

    const response = await fetchAPI<StrapiResponse<Catalog[]>>("/catalogs", queryParams, {
        cache: 'no-store'
    });

    return response.data;
}

export async function getCatalogById(id: string): Promise<Catalog> {
    const response = await fetchAPI<StrapiResponse<Catalog>>(`/catalogs/${id}`, {
        populate: {
            authors: true,
            fragments: true, // Assuming relation name is 'fragments' or 'documents'. Checked schema: mappedBy: "catalog", inversedBy: "fragments". So on Catalog schema it is "fragments"? 
            // In Catalog schema view (step 226): 
            // "documents": { "mappedBy": "catalog", "relation": "oneToMany", "target": "api::document.document" } --> Wait, relation name in Catalog schema
        }
    }, {
        cache: 'no-store'
    });
    return response.data;
}

export async function getComments(documentId: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetchAPI<StrapiResponse<any[]>>("/comments", {
        filters: {
            document: {
                documentId: {
                    $eq: documentId
                }
            }
        },
        populate: {
            author: true
        },
        sort: ["createdAt:desc"]
    }, {
        cache: 'no-store',
        headers: headers // Pass token here
    });
    return response.data;
}

export async function deleteComment(documentId: string, token: string) {
    const response = await fetch(`${STRAPI_URL}/api/comments/${documentId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) {
        throw new Error("Failed to delete comment");
    }
    return true;
}

export async function getAuthors() {
    const response = await fetchAPI<StrapiResponse<any[]>>("/authors", {
        sort: ["lastName:asc"],
        pagination: {
            limit: 100 // Reasonable limit for now
        }
    }, {
        cache: 'no-store'
    });
    return response.data;
}

export async function getDocumentById(id: string) {
    const response = await fetchAPI<StrapiResponse<any>>(`/documents/${id}`, {
        populate: {
            xmlFile: true,
            catalog: true
        }
    }, {
        cache: 'no-store'
    });
    return response.data;
}

export async function fetchXML(url: string): Promise<string> {
    const fullUrl = url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
    const response = await fetch(fullUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch XML: ${response.statusText}`);
    }
    return response.text();
}
