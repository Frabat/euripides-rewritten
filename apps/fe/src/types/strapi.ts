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
    firstName: string;
    lastName: string;
    type: 'original' | 'scholar';
    bio?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
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
    sectionRangeStart?: string;
    sectionRangeEnd?: string;
    catalog?: Catalog;
    revisionHistory?: RevisionEntry[];
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
    authors?: Author[];
    fragments?: Document[];
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
