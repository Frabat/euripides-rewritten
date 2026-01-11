import type { Schema, Struct } from '@strapi/strapi';

export interface SharedLanguageKnowledge extends Struct.ComponentSchema {
  collectionName: 'components_shared_language_knowledges';
  info: {
    displayName: 'Language Knowledge';
    icon: 'language';
  };
  attributes: {
    language: Schema.Attribute.String & Schema.Attribute.Required;
    proficiency: Schema.Attribute.Enumeration<
      ['Basic', 'Fluent', 'Native', 'Scholarly']
    > &
      Schema.Attribute.DefaultTo<'Scholarly'>;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedNavigationItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_navigation_items';
  info: {
    displayName: 'Navigation Item';
    icon: 'list';
  };
  attributes: {
    label: Schema.Attribute.String;
    targetID: Schema.Attribute.String;
    type: Schema.Attribute.Enumeration<['Book', 'Section', 'Verse']>;
  };
}

export interface SharedPublicationInfo extends Struct.ComponentSchema {
  collectionName: 'components_shared_publication_infos';
  info: {
    displayName: 'Publication Info';
    icon: 'book';
  };
  attributes: {
    place: Schema.Attribute.String;
    publisher: Schema.Attribute.String;
    year: Schema.Attribute.Integer;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRevisionEntry extends Struct.ComponentSchema {
  collectionName: 'components_shared_revision_entries';
  info: {
    displayName: 'Revision Entry';
    icon: 'history';
  };
  attributes: {
    date: Schema.Attribute.DateTime;
    description: Schema.Attribute.Text;
    editorID: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SharedWorkLanguage extends Struct.ComponentSchema {
  collectionName: 'components_shared_work_languages';
  info: {
    description: 'Language details for the work';
    displayName: 'Work Language';
    icon: 'language';
  };
  attributes: {
    originalLanguage: Schema.Attribute.String;
    translationLanguage: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.language-knowledge': SharedLanguageKnowledge;
      'shared.media': SharedMedia;
      'shared.navigation-item': SharedNavigationItem;
      'shared.publication-info': SharedPublicationInfo;
      'shared.quote': SharedQuote;
      'shared.revision-entry': SharedRevisionEntry;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'shared.work-language': SharedWorkLanguage;
    }
  }
}
