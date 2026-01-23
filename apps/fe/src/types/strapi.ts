export interface RevisionEntry {
    id: number;
    date: string;
    description: string;
    editorID: string;
}

export interface PublicationInfo {
    id: number;
    publisher: string;
    place: string;
    year: number;
}

export interface WorkLanguage {
    id: number;
    originalLanguage: string;
    translationLanguage: string;
}

export interface Author {
    id: number;
    documentId: string;
    name: string;
    isOriginal: boolean;
    bio?: string;
    languages?: any;
    works?: Catalog[];
    user?: any;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}

export interface Editor {
    id: number;
    documentId: string;
    name: string;
    role: 'Digital' | 'Curator' | 'Reviewer';
    orcid?: string;
    user?: any;
    createdAt: string;
    updatedAt: string;
}

export interface Document {
    id: number;
    documentId: string;
    xmlFile: any;
    bookNumber?: number;
    summary?: string;
    verseBlockName?: string; // Added for Volume name logic
    sectionRangeStart?: string;
    sectionRangeEnd?: string;
    book?: Book; // Changed from catalog to book
    revisionHistory?: RevisionEntry[];
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}

export interface Book {
    id: number;
    documentId: string;
    title: string;
    period?: string;
    authors?: Author[];
    work?: Catalog;
    verseBlocks?: Document[];
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}

export interface Catalog {
    id: number;
    documentId: string;
    title: string;
    subTitle?: string;
    uuid?: string;
    isbn?: string;
    period?: string;
    reference_author?: string;
    reference_version?: string;
    reference_document_url?: string;
    language?: string;
    isFragmented?: boolean;
    authors?: Author[];
    books?: Book[]; // Changed from fragments to books
    additionalDocuments?: any[];
    projectDescription?: string;
    editorialDeclaration?: string;
    encodingMethod?: string;
    publicationInfo?: PublicationInfo;
    languages?: WorkLanguage;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}

export interface StrapiUser {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    role?: {
        id: number;
        name: string;
        description: string;
        type: string;
    };
    createdAt: string;
    updatedAt: string;
    firstName?: string;
    lastName?: string;
    isScholar?: boolean;
    bio?: string;
    institution?: string;
    title?: string;
}

export interface StrapiResponse<T> {
    data: T;
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export interface StrapiSingleResponse<T> {
    data: T;
    meta: {};
}
